function StringToJson (strA) {
  this.commonObj = {}
  this.str = strA
}
StringToJson.prototype.getObjValue = function (objString) {
  let array = []
  let indexEnd
  let indexStart
  let stateEnd = false
  let stateStart = true
  for (let i in objString) {
    if (array.length === 0 && stateEnd === true) {
      indexEnd = i
      break
    }
    if (objString[i] === '{' && stateStart === false) {
      array.push(i)
    } else if (objString[i] === '{' && stateStart === true) {
      indexStart = i
      array.push(i)
      stateStart = false
    } else if (objString[i] === '}') {
      stateEnd = true
      array.pop()
    }
  }
  return {
    'indexStart': indexStart,
    'indexEnd': indexEnd
  }
}
StringToJson.prototype.getObjKey = function (objString) {
  let indexEnd
  let indexStart
  let stateStart = true
  for (let i in objString) {
    if (objString[i] === "'" && stateStart === true) {
      indexStart = i
      stateStart = false
    } else if (objString[i] === "'" && stateStart === false) {
      indexEnd = i
      break
    }
  }
  return {
    'indexStart': indexStart,
    'indexEnd': indexEnd
  }
}
StringToJson.prototype.getObjByStep = function (firstObjString) {
  var self = this
  //            获取第二层
  let secondObjList = {}
  let indexTwoStart = 0
  let indexTwoEnd = firstObjString.length
  do {
    let objString = firstObjString.substring(indexTwoStart, indexTwoEnd)
    let secondKeyIndex = self.getObjKey(objString)
    let key = objString.substring(parseInt(secondKeyIndex.indexStart) + 1, secondKeyIndex.indexEnd)
    let secondValueIndex = self.getObjValue(objString)
    let value = objString.substring(parseInt(secondValueIndex.indexStart) + 1, secondValueIndex.indexEnd)
//              获取第三层
    let valueObj
    // ':{标识一个对象
    if (value.indexOf("':{") > 0) {
      valueObj = self.getObjByStep(value)
      if (firstObjString === this.str) {
        secondObjList = valueObj
      } else {
        secondObjList[key] = valueObj
      }
    } else {
      valueObj = ''
      let valueArray = value.match(/>[^<]*</g)
      if (valueArray !== null && valueArray.length !== 0) {
        valueArray.forEach((value) => {
          valueObj += value.substring(1, value.length - 1)
        })
        let content = ''
        valueObj.split("'+'").forEach((k) => {
          content += '<li class="guiLi-gap-faq">' + k + '</li>'
        })
        secondObjList[key] = {
          'isLeafNode': true,
          'type': 'layerTwo',
          'content': content
        }
      }
    }
    indexTwoStart = parseInt(indexTwoStart) + parseInt(secondValueIndex.indexEnd) + 1
  } while (indexTwoStart <= indexTwoEnd - 3)
  return secondObjList
}

export default function (strA) {
  const str = new StringToJson(strA)
  return str.getObjByStep(strA)
}
