import { gsap } from 'gsap'
import { CSSRulePlugin } from 'gsap/CSSRulePlugin'
import { create, all } from "mathjs"
import { data } from './data'

// 精确科学计算插件 替换原有计算 使计算不会出现javascript的各种离奇行为
const math = create(all, {})
// GSAP注册CSSRule插件 用来调用伪元素，使gsap可以操控伪元素进行动画过程
gsap.registerPlugin(CSSRulePlugin)

class Calculator {
  showDom = document.getElementById('show')
  inputDom = document.getElementById('input')

  status = {
    isResult: false
  }

  constructor(data) {
    this.data = data
    this.init()
  }

  init = () => {
    this.data.info.forEach(info => {
      const dom = document.getElementById(info.id)
      if (dom) {
        /*=== add tag ===*/
        document.styleSheets[0].insertRule(`#${info.id}::before{content:"${info.tag}"}`)

        /*=== add rules */
        dom.addEventListener('click', () => {
          this._triggerCore(info)
        })

        window.addEventListener("keydown", (event) => {
          info.key.forEach(element => {
            if (element === event.key) {
              this._triggerCore(info)
              const btn = document.getElementById(info.id)
              pressBtn(btn)
            }
          })
        })

        window.addEventListener("keyup", (event) => {
          info.key.forEach(element => {
            if (element === event.key) {
              const btn = document.getElementById(info.id)
              releaseBtn(btn)
            }
          })
        })
      }
    })
  }

  _triggerCore(info) {
    const checkStatus = this._getInputType(info)

    if (this._isThroughRule(info)) {
      // console.log(checkStatus);
      this.status.isResult = false
      if (checkStatus.isAddValue) {
        this._addValue(info.tag)
      }
      if (checkStatus.isShowResult) {
        const analysisResult = this._inputAnalysis()
        let checkStatus = false
        analysisResult.some(tag => {
          if (this.pureOperatorTag.includes(tag)) {
            checkStatus = true
            return true
          }
        })
        checkStatus && this._showResult()
      }
    }
  }

  _getInputType(info) {
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

  _isThroughRule(info) {
    // 获取输入内容的状态
    const checkType = this._getInputType(info)
    let thoughRule = true
    thoughRule &&= this._checkHeaderRule(info)
    if (!thoughRule) return false
    info.rule.every(rule => {
      const funcName = `this._${rule}`
      if (typeof eval(funcName) === "function") {
        // 过滤所有的规则，只有完全通过规则才能让thoughtRule 变为 true
        return thoughRule &&= eval(`${funcName}(info.tag)`)
      } else {
        console.log(funcName, ": cannot add this function");
      }
    })
    return thoughRule
  }

  _checkHeaderRule(info) {
    console.log("_checkHeaderRule", this.status.isResult);
    let checkStatus = true
    checkStatus &&= (this.status.isResult ? this._onlyOperator(info) : true)
    return checkStatus
  }

  _inputAnalysis() {
    // 产生新的tag数据，将 - 号改变的目的是为了放入正则中
    const regTag = this.pureOperatorTag.map(tag => {
      return tag === '-' ? '\\-' : tag
    })
    // console.log(regTag);
    // 正则，最外层圆形（），可以保证保留拆分符号。 内层[], 选择多项
    const analysisCore = new RegExp(`([${regTag}])`)
    let analysisResult = this.inputDom.value.split(analysisCore)
    // console.log("inputList: ", inputList);

    // 保留拆分符的筛选项需要删除空项目
    analysisResult = analysisResult.filter(element => element !== '')

    // 将数字置换，目的是去掉其中多余的 0
    if (analysisResult && analysisResult.length) {
      analysisResult = analysisResult.map(element => {
        if (Number(element) || Number(element) === 0) {
          return math.evaluate(Number(element)).toString()
        }
        return element
      })
      console.log(analysisResult);
    }

    return analysisResult
  }

  _inputAnalysisString() {
    const analysisResult = this._inputAnalysis()
    let newShowString = ""
    // console.log(analysisResult);
    analysisResult.forEach(element => {
      // console.log(element, typeof element);
      newShowString += element
    })
    return newShowString
  }

  _havePoint(value) {
    console.log('value:', value, "value.search('.'): ", value.search('.'));
    return !(value.search(/\./) === -1)
  }

  _canNotUseFirst = () => {
    console.log('_canNotUseFirst');
    return !!this.inputDom.value
  }

  _canNotUseWithOperator = () => {
    console.log('_canNotUseWithOperator', this.pureOperatorTag);
    const inputList = this._inputAnalysis()
    console.log(inputList);
    const infoLen = inputList.length
    if (!infoLen) return true
    let checkStatus = true
    this.pureOperatorTag.every(tag => {
      console.log('tag:', tag);
      if (tag === inputList[infoLen - 1]) {
        checkStatus = false
        return false
      } else {
        return true
      }
    })
    return checkStatus
  }

  _canNotUseWithPointer = () => {
    console.log('_canNotUseWithPointer');
    return !(this.inputDom.value[this.inputDom.value.length - 1] === '.')
  }

  _canNotUseIfTheNumAlreadyHavePointer = () => {
    console.log("_canNotUseIfTheNumAlreadyHavePointer");
    const analysisResult = this._inputAnalysis()
    console.log(analysisResult);
    const resultLen = analysisResult.length
    console.log(analysisResult[resultLen - 1]);
    if (resultLen && analysisResult[resultLen - 1]) {
      return !this._havePoint(analysisResult[resultLen - 1])
    }
    return false
  }

  _onlyOperator = (info) => {
    console.log(info);
    let findID = false
    this.operatorID.some(id => {
      if (id === info.id) {
        findID = true
        return true
      }
    })
    console.log("findID:", findID);
    return findID
  }

  _addValue = (value) => {
    console.log('_addValue');
    this.inputDom.value += value
  }

  _showResult = () => {
    console.log('_showResult');
    const newShowString = this._inputAnalysisString()
    // const calcResult = eval(newShowString)
    const calcResult = math.evaluate(newShowString)

    if (typeof calcResult === "number") {
      this.showDom.value = newShowString + '='
      this.inputDom.value = calcResult
      this._textAreaAnimationShowOneHistory()
      this.status.isResult = true
    }
  }

  _clearAll = () => {
    console.log('_clearAll');
    // 如果什么都没有，则什么都不做
    if (!this.inputDom.value && !this.showDom.value) return

    // 如果输入值没有，则删掉展示值
    if (!this.inputDom.value) {
      this.showDom.value = ''
      // 将展示面板收起
      this._textAreaAnimationHideOneHistory()
      return true
    }

    // 如果输出值面板有内容则将展示面板内容重新计算，并重置输出面板
    this._reCalcShowDomValue()
    this.inputDom.value = ''
    return true
  }

  _reCalcShowDomValue() {
    const showDomLen = this.showDom.value.length
    if (this.showDom.value[showDomLen - 1] === '=') {
      this.showDom.value += math.evaluate(this.showDom?.value.substring(0, showDomLen - 1))
    }
  }

  _clearLast = () => {
    this._reCalcShowDomValue()
    const value = this.inputDom.value
    this.inputDom.value = value.substring(0, value.length - 1)
    this.status.isResult = false
  }

  _textAreaAnimationShowOneHistory = () => {
    gsap.to(this.inputDom, { duration: 0.5, y: 24, textAlignLast: true })
    gsap.to(this.showDom, { duration: 0.5, display: "block", opacity: 1, y: -24, textAlignLast: true })
  }

  _textAreaAnimationHideOneHistory = () => {
    gsap.to(this.inputDom, { duration: 0, y: 0, textAlignLast: true })
    gsap.to(this.showDom, { duration: 0, display: "none", opacity: 0, y: 0 })
  }
}

const btnClass = new Calculator(Info)


// === 按下动画 ===
const buttonGroup = document.querySelectorAll('.calculator span')

buttonGroup.forEach(btn => {
  btn.addEventListener('mousedown', () => {
    pressBtn(btn)
  })

  btn.addEventListener('mouseup', () => {
    releaseBtn(btn)
  })

  btn.addEventListener('mouseout', () => {
    releaseBtn(btn)
  })
})

function pressBtn(btn) {
  btn.classList.remove('mousedown')
  btn.classList.add('mousedown')
}

function releaseBtn(btn) {
  btn.classList.remove('mousedown')
}