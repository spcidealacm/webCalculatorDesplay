import { data } from './data'
class Dom {
  text = {
    show: null,
    input: null
  }

  toggle = {
    sun: null,
    moon: null
  }

  number = []
  order = []
  button = null

  constructor() {
    this._getTextAreaDom()
    this._getToggleDom()
    this._getNumberDom()
    this._getCalculatorDoms()
    this._getOrderDom()
  }

  _getTextAreaDom() {
    this.text.show = document.getElementById('show')
    this.text.input = document.getElementById('input')
  }

  _getToggleDom() {
    this.toggle.sun = document.getElementById('sun')
    this.toggle.moon = document.getElementById('moon')
  }

  _getNumberDom() {
    const numberList = data.numberList.sort((a, b) => (a.number - b.number))
    numberList.forEach(num => {
      this.number.push(document.getElementById(num.id))
    });
  }

  _getOrderDom() {
    const orderList = data.orderList.sort((a, b) => (a.order - b.order))
    orderList.forEach(order => {
      this.order.push(document.getElementById(order.id))
    })
  }

  _getCalculatorDoms() {
    this.button = document.querySelectorAll('.calculator span')
  }

  get(info) {
    return document.querySelector(info)
  }

  have(info) {
    return !!this.get(info)
  }

  getByID(id) {
    return document.getElementById(id)
  }

  haveByID(id) {
    return !!this.getByID(id)
  }
}

const dom = new Dom()

export { dom }