const EOF = Symbol('EOF') // End of file

function data(char) {
  if (char === '<') {
    return tagOpen
  } else if (char === EOF) {
    return
  } else {
    return data
  }
}

function tagOpen(char) {
  if (char === '/') {
    return endTagOpen
  } else if (char.match(/[a-zA-Z]/)) {
    return tagName(char)
  } else {
    return
  }
}

function endTagOpen(char) {
  if (char.match(/[a-zA-Z]/)) {
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
    return data
  } else if (char.match(/[a-zA-Z]/)) {
    return tagName
  } else {
    return tagName
  }
}

function beforeAttributeName(char) {
  if (char.match(/[a-zA-Z]/)) {
    return beforeAttributeName
  } else if (char === '>') {
    return data
  } else if (char === '=') {
    return beforeAttributeName
  } else {
    return beforeAttributeName
  }
}

function selfClosingStartTag(char) {
  if (char === '>') {
    currentToken.isSelfClosing = true
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
}
