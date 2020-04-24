const moment = require('moment')
const tableWFA = require('./z-tables/WFA.json')
const tableHFA = require('./z-tables/HFA.json')
const tableWFH = require('./z-tables/WFH.json')
const tableBFA = require('./z-tables/BFA.json')
const englishLocale = require('./locale/english.json')
const spanishLocale = require('./locale/spanish.json')
const frenchLocale = require('./locale/french.json')



class nutritionCalculator {
  constructor(language = "en"){
    language = language.toLowerCase();
    switch(language) {
      case "fr":
        this.locale = frenchLocale
        break;
      case "es":
        this.locale = spanishLocale
        break;
      default:
        this.locale = englishLocale
    }
  }

  calculateNutrition(months, sex, weight, height){
    let report = {months, sex, weight, height}
    report.WFA = (0 < months && months < 121) ? this.calculateWFA(months, sex, weight) : this.locale.nonApplicable;
    report.HFA = (0 < months && months < 229) ? this.calculateHFA(months, sex, height) : this.locale.nonApplicable;
    report.WFH = (0 < months && months < 60) ? this.calculateWFH(sex, weight, height) : this.locale.nonApplicable;
    report.BFA = (60 < months && months < 229) ? this.calculateBFA(months, sex, weight, height) : this.locale.nonApplicable;
    let zScores = [report.WFA.zWFA, report.HFA.zHFA, report.WFH.zWFH, report.BFA.zBFA]
    zScores = zScores.filter( score => score != undefined )
    report.recommendedAction = this.recommendedAction(Math.min(...zScores))
    return report
  }

  calculateWFA(months, sex, weight) {
    let valuesWFA = tableWFA.filter(values => {
      return (values.sex == sex) && (values.age == months)
    })[0]
    valuesWFA.zWFA= ((Math.pow((weight/parseFloat(valuesWFA.M)), parseFloat(valuesWFA.L)) - 1)/(parseFloat(valuesWFA.S)*parseFloat(valuesWFA.L)))
    let errorRangeWFA = [5, -6]
    valuesWFA.risk = this.calculateRisk(valuesWFA.zWFA, errorRangeWFA)
    return valuesWFA
  }

  calculateHFA(months, sex, height) {
    let valuesHFA = tableHFA.filter(values => {
      return (values.sex == sex) && (values.age == months)
    })[0]
    valuesHFA.zHFA = ((Math.pow((height/parseFloat(valuesHFA.M)), parseFloat(valuesHFA.L)) - 1)/(parseFloat(valuesHFA.S)*parseFloat(valuesHFA.L)))
    let errorRangeHFA = [6, -6]
    valuesHFA.risk = this.calculateRisk(valuesHFA.zHFA, erroRangeHFA)
    return valuesHFA
  }

  calculateWFH(sex, weight, height) {
    let valuesWFH = tableWFH.filter(values => {
      //Round height to nearest .5 point, to check on table.
      let roundedHeight = Math.round(height*2)/2;
      return (values.sex == sex) && (values.height == roundedHeight)
    })[0]
    valuesWFH.zWFH = ((Math.pow((weight/parseFloat(valuesWFH.M)), parseFloat(valuesWFH.L)) - 1)/(parseFloat(valuesWFH.S)*parseFloat(valuesWFH.L)))
    let errorRangeWFH = [5, -5]
    valuesWFH.risk = this.calculateRisk(valuesWFH.zWFH, errorRangeWFH)
    return valuesWFH
  }

  calculateBFA(months, sex, weight, height) {
    let bmi = weight/(height * height)
    let valuesBFA = tableBFA.filter(values => {
      return (values.sex == sex) && (values.age == months)
    })[0]
    valuesBFA.zBFA= ((Math.pow((bmi/parseFloat(valuesBFA.M)), parseFloat(valuesBFA.L)) - 1)/(parseFloat(valuesBFA.S)*parseFloat(valuesBFA.L)))
    let errorRangeBFA = [5, -5]
    valuesBFA.risk = this.calculateRisk(valuesBFA.zBFA, errorRangeBFA)
    return valuesBFA
  }


  calculateRisk(risk, errorRange){
    if(risk > errorRange[0]){
      return this.locale.measurementError
    } else if(risk > -1) {
      return this.locale.excellent
    } else if(risk > -1.5) {
      return this.locale.good
    } else if(risk > -2) {
      return this.locale.limit
    } else if(risk > -3) {
      return this.locale.moderate
    } else if(risk > -4) {
      return this.locale.severe
    } else if(risk > errorRange[1]) {
      return this.locale.verySevere
    } else {
      return this.locale.measurementError
    }
  }

  recommendedAction(risk){
    if(risk > 3){
      return this.locale.measurementError
    } else if(risk > -1) {
      return this.locale.healthy
    } else if(risk > -2) {
      return this.locale.increaseFoodAmount
    } else {
      return this.locale.toDoctor
    }
  }
}


module.exports = nutritionCalculator
