import { Info } from '../data/db.json'

class Data {
  operatorID
  pureOperatorTag
  invisible
  numberList
  orderList

  constructor(info) {
    this.info = info
    this.init()
  }

  init() {
    this._getOperator()
    this._getPureOperator()
    this._getInvisible()
    this._getInvisible()
    this._getNumber()
    this._getOrder()
  }

  // 获取操作符
  _getOperator() {
    this.operator = this.info.filter(info => info.property.filter(prop => prop === 'operator').length)
    this.operatorID = []
    this.operator.forEach(info => {
      info.tag ? this.operatorID.push(info.id) : null
    })
  }

  // 获取纯净操作符
  _getPureOperator() {
    this.pureOperator = this.info.filter(info => info.property.filter(prop => prop === 'pureOperator').length)
    this.pureOperatorTag = []
    this.pureOperator.forEach(info => {
      info.tag ? this.pureOperatorTag.push(info.tag) : null
    })
  }

  // 获取可视操作符
  _getInvisible() {
    this.invisible = this.info.filter(info => info.property.filter(prop => prop === 'invisible').length)
  }

  // 获取数字
  _getNumber() {
    this.numberList = this.info.filter(info => info.property.filter(prop => prop === 'number').length)
  }

  _getOrder() {
    this.orderList = this.info.filter(info => info.order).sort((a, b) => (a.order - b.order))
    console.log(this.orderList);
  }

  // 获取类型
  getInputType(info) {
    const isPureOperator = !!info.property.filter(prop => prop === "pureOperator").length
    const isPoint = !!info.property.filter(prop => prop === "pointer").length
    const isEqual = !!info.property.filter(prop => prop === "equal").length
    const isNumber = !!info.property.filter(prop => prop === "number").length
    const isAddValue = !!info.property.filter(prop => prop === "addValue").length
    const isShowResult = !!info.property.filter(prop => prop === "showResult").length
    return {
      isPureOperator, isPoint, isEqual, isNumber, isAddValue, isShowResult
    }
  }
}

const data = new Data(Info)

export { data }