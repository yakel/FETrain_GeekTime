const css = require('css')
const layout = require('./layout')

const EOF = Symbol('EOF') // End of file

let currentToken = null
let currentAttribute = null

let stack = [{ type: 'document', children: [] }]
let currentTextNode = null

let rules = []
function addCSSRule(text) {
  const ast = css.parse(text)
  // console.log(JSON.stringify(ast, null, '    '))
  rules.push(...ast.stylesheet.rules)
}

function match(element, selector) {
  if (!selector || !element.attributes) {
    return false
  }
  const start = selector.charAt(0)
  if (start === '#') {
    const idSelector = selector.slice(1)
    return element.attributes.id === idSelector
  } else if (start === '.') {
    const classSelector = selector.slice(1)
    return element.attributes.class === classSelector
  } else {
    if (element.tagName === selector) {
      return true
    }
  }
  return false
}

function specificity(selector) {
  const p = [0, 0, 0, 0]
  const parts = selector.split(' ')
  for (const part of parts) {
    const start = part.charAt(0)
    if (start === '#') {
      p[1] += 1
    } else if (start === '.') {
      p[2] += 1
    } else {
      p[3] += 1
    }
  }
  return p
}

function compare(sp1, sp2) {
  let diff
  // 循环遍历进行比较
  for (let i = 0; i < 4; i += 1) {
    diff = sp1[i] - sp2[i]
    if (diff) {
      return diff
    }
  }
  return diff
}

function computeCSS(element) {
  if (!element.computedStyle) {
    element.computedStyle = {}
  }

  const ancestors = stack.slice().reverse()
  for (rule of rules) {
    const selectorParts = rule.selectors[0].split(' ').reverse()
    if (!match(element, selectorParts[0])) {
      continue
    }

    let selectorIndex = 1
    for (const ancestor of ancestors) {
      if (match(ancestor, selectorParts[selectorIndex])) {
        selectorIndex += 1
      }
    }
    const matched = selectorIndex >= selectorParts.length
    if (matched) {
      computedStyle = element.computedStyle
      const ruleSp = specificity(rule.selectors[0])
      for (const declaration of rule.declarations) {
        const property = declaration.property
        if (!computedStyle[property]) {
          computedStyle[property] = {}
        }
        const sp = computedStyle[property].specificity
        // 第一次设置 或 规则比当前值大 时，更新规则及特征值
        if (!sp || compare(ruleSp, sp) > 0) {
          computedStyle[property].value = declaration.value
          computedStyle[property].specificity = ruleSp
        }
      }
      console.log('computed style:', computedStyle)
    }
  }
}

function emit(token) {
  top = stack[stack.length - 1]

  if (token.type === 'startTag') {
    const element = {
      type: 'element',
      tagName: token.tagName,
      // TODO: 为什么实例用数组，感觉用object更方便访问，有什么特殊的原因？
      attributes: {},
      children: [],
    }
    for (const [key, value] of Object.entries(token)) {
      if (!['type', 'tagName'].includes(key)) {
        element.attributes[key] = value
      }
    }

    computeCSS(element)

    top.children.push(element)
    element.parent = top

    if (!token.isSelfClosing) {
      stack.push(element)
    }
    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Tag start end not match!')
    } else {
      if (top.tagName === 'style') {
        addCSSRule(top.children[0].content)
      }
      layout(top)
      stack.pop()
    }
    currentTextNode = null
  } else if (token.type === 'text') {
    if (!currentTextNode) {
      currentTextNode = {
        type: 'text',
        content: '',
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function data(char) {
  if (char === '<') {
    return tagOpen
  } else if (char === EOF) {
    emit({ type: 'EOF' })
    return
  } else {
    emit({ type: 'text', content: char })
    return data
  }
}

function tagOpen(char) {
  if (char === '/') {
    return endTagOpen
  } else if (char.match(/[a-zA-Z]/)) {
    currentToken = {
      type: 'startTag',
      tagName: '',
    }
    return tagName(char)
  } else {
    return
  }
}

function endTagOpen(char) {
  if (char.match(/[a-zA-Z]/)) {
    currentToken = {
      type: 'endTag',
      tagName: '',
    }
    return tagName(char)
  } else if (char === '>') {
  } else if (char === EOF) {
  } else {
  }
}

function tagName(char) {
  if (char.match(/[\t\n\f ]/)) {
    return beforeAttributeName
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char === '>') {
    emit(currentToken)
    return data
  } else if (char.match(/[a-zA-Z]/)) {
    currentToken.tagName += char //.toLowerCase()
    return tagName
  } else {
    return tagName
  }
}

function beforeAttributeName(char) {
  if (char.match(/[\t\n\f ]/)) {
    return beforeAttributeName
  } else if (char === '>' || char === '/' || char === EOF) {
    return afterAttributeName(char)
  } else if (char === '=') {
  } else {
    currentAttribute = {
      name: '',
      value: '',
    }
    return attributeName(char)
  }
}

function attributeName(char) {
  if (char.match(/[\t\n\f \/>]/) || char === EOF) {
    return afterAttributeName(c)
  } else if (char === '=') {
    return beforeAttributeValue
  } else if (char === '\u0000') {
  } else if (['"', "'", '>'].includes(char)) {
  } else {
    currentAttribute.name += char
    return attributeName
  }
}

function afterAttributeName(char) {
  if (char.match(/[\t\n\f ]/)) {
    return afterAttributeName
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char === '=') {
    return beforeAttributeValue
  } else if (char === '>') {
    return data
  } else {
    currentAttribute = { name: '', value: '' }
    return attributeName(char)
  }
}

function beforeAttributeValue(char) {
  if (char.match(/[\t\n\f ]/)) {
    return beforeAttributeValue
  } else if (char === '"') {
    return doubleQuotedAttributeValue
  } else if (char === "'") {
    return singleQuotedAttributeValue
  } else if (char === '>') {
    return data
  } else {
    return unquotedAttributeValue(char)
  }
}

function doubleQuotedAttributeValue(char) {
  if (char === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (char === '&') {
  } else if (char === '\u0000') {
  } else if (char === EOF) {
  } else {
    currentAttribute.value += char
    return doubleQuotedAttributeValue
  }
}

function singleQuotedAttributeValue(char) {
  if (char === "'") {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (char === '&') {
  } else if (char === '\u0000') {
  } else if (char === EOF) {
  } else {
    currentAttribute.value += char
    return singleQuotedAttributeValue
  }
}

function unquotedAttributeValue(char) {
  if (char.match(/[\t\n\f ]/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (char === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (char === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (char === '&') {
  } else if (char === '\u0000') {
  } else if (char.match(/['"<=`]/)) {
  } else if (char === EOF) {
  } else {
    currentAttribute.value += char
    return unquotedAttributeValue
  }
}

function afterQuotedAttributeValue(char) {
  if (char.match(/[\t\n\f ]/)) {
    return beforeAttributeName
  } else if (char === '/') {
    return selfClosingStartTag
  } else if (char === '>') {
    return data
  } else if (char === EOF) {
  } else {
    return beforeAttributeName(char)
  }
}

function selfClosingStartTag(char) {
  if (char === '>') {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  } else if (char === EOF) {
  } else {
  }
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data
  for (const char of html) {
    state = state(char)
  }
  state = state(EOF)
  console.log('tree:', stack[0])
}
