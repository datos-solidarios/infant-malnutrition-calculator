const moment = require('moment')
const tableWFA = require('./z-tables/WFA.json')
const tableHFA = require('./z-tables/HFA.json')
const tableWFH = require('./z-tables/WFH.json')
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

  calculateNutrition(months, gender, weight, height){
    let report = {months, gender, weight, height}
    report.WFA = this.calculateWFA(months, gender, weight);
    report.HFA = this.calculateHFA(months, gender, height);
    report.WFH = this.calculateWFH(gender, weight, height);
    report.recommendedAction = this.recommendedAction(Math.min(report.WFA.zWFA, report.HFA.zHFA, report.WFH.zWFH))
    return report
  }

  calculateWFA(months, gender, weight) {
    let valuesWFA = tableWFA.filter(values => {
      return values.ID === (gender + months)
    })[0]
    valuesWFA.zWFA= ((Math.pow((weight/parseFloat(valuesWFA.M)), parseFloat(valuesWFA.L)) - 1)/(parseFloat(valuesWFA.S)*parseFloat(valuesWFA.L)))
    valuesWFA.risk = this.calculateRisk(valuesWFA.zWFA)
    return valuesWFA
  }

  calculateHFA(months, gender, height) {
    let valuesHFA = tableHFA.filter(values => {
      return values.ID === (gender + months)
    })[0]
    valuesHFA.zHFA = ((Math.pow((height/parseFloat(valuesHFA.M)), parseFloat(valuesHFA.L)) - 1)/(parseFloat(valuesHFA.S)*parseFloat(valuesHFA.L)))
    valuesHFA.risk = this.calculateRisk(valuesHFA.zHFA)
    return valuesHFA
  }

  calculateWFH(gender, weight, height) {
    let valuesWFH = tableWFH.filter(values => {
      return values.ID === (gender + height)
    })[0]
    valuesWFH.zWFH = ((Math.pow((weight/parseFloat(valuesWFH.M)), parseFloat(valuesWFH.L)) - 1)/(parseFloat(valuesWFH.S)*parseFloat(valuesWFH.L)))
    valuesWFH.risk = this.calculateRisk(valuesWFH.zWFH)
    return valuesWFH
  }

  calculateRisk(risk){
    if(risk > 3){
      return this.locale.measurementError
    } else if(risk > -1) {
      return this.locale.correct
    } else if(risk > -2) {
      return this.locale.incipient
    } else if(risk > -3) {
      return this.locale.moderate
    } else {
      return this.locale.severe
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
