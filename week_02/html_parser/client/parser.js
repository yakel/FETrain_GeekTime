const EOF = Symbol('EOF') // End of file

let currentToken = null
let currentAttribute = null

let stack = [{ type: 'document', children: [] }]
let currentTextNode = null

function emit(token) {
  top = stack[stack.length - 1]

  if (token.type === 'startTag') {
    const element = {
      type: 'element',
      tagName: token.tagName,
      attributes: {},
      children: [],
    }
    for (const [key, value] of Object.entries(token)) {
      if (!['type', 'tagName'].includes(key)) {
        element.attributes[key] = value
      }
    }
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
