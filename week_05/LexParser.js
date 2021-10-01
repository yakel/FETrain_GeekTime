class XRegExp {
  constructor(lexicalStruct, flags, root) {
    const regExpStr = this.compile(lexicalStruct, root)
    this.regExp = new RegExp(regExpStr.source, flags)
    // console.log('re:', this.regExp)
  }

  // 递归扩展正则表达式，并用命名分组添加类型信息
  compile(lexicalStruct, name) {
    const expr = lexicalStruct[name]
    if (expr instanceof RegExp) {
      return { source: expr.source, isTerminal: true }
    }

    // 一个token可能会匹配多个，匹配最内层最具体的那个
    // 比如: for既是Token也是Keyword，需匹配Keyword
    // 因此需记录某个结构是否是终结符，只有终结符的父节点才添加命名分组
    let isTerminal = true
    const regExpStr = expr.replace(/<(\w+)>/g, (s, name) => {
      // 出现替换则说明是非终结符
      isTerminal = false
      const result = this.compile(lexicalStruct, name)
      if (result.isTerminal) {
        // 使用命名分组记录类型名称
        return `(?<${name}>` + result.source + ')'
      } else {
        return result.source
      }
    })
    return {
      source: regExpStr,
      isTerminal,
    }
  }

  exec(str) {
    const res = this.regExp.exec(str)
    if (!res.groups) {
      return
    }
    let type
    for (const [key, value] of Object.entries(res.groups)) {
      if (value !== undefined) {
        type = key
      }
    }
    if (type) {
      res.type = type
    }
    return res
  }

  get lastIndex() {
    return this.regExp.lastIndex
  }

  set lastIndex(value) {
    this.regExp.lastIndex = value
  }
}

function* scan(str) {
  const lexicalStruct = {
    InputElement: '<WhiteSpace>|<LineTerminator>|<Comment>|<Token>',
    WhiteSpace: / /,
    LineTerminator: /\n/,
    Comment: '<SigleLineComment>|<MultiLineComment>',
    SigleLineComment: /\/\/[^\n]*/,
    MultiLineComment: /\/\*(?:[^*]|\*[^\/])*\*\//,
    Token: '<Literal>|<Keyword>|<Identifier>|<Punctuator>',
    Literal: '<NumericLiteral>|<StringLiteral>|<BooleanLiteral>|<NullLiteral>',
    NumericLiteral: /(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/,
    StringLiteral: /"(?:[^"\n]|\\[\s\S])*"|'(?:[^'\n]|\\[\s\S])*'/,
    BooleanLiteral: /true|false/,
    NullLiteral: /null/,
    Keyword: /for|let/,
    Identifier: /[a-zA-Z_\$][a-zA-Z0-9_\$]*/,
    Punctuator: /\(|\)|\[|\]|\{|\}|=>|==|=|<|\+|\+\+|\.|;|\?|:|\*|,/,
  }
  const regExp = new XRegExp(lexicalStruct, 'g', 'InputElement')
  while (regExp.lastIndex < str.length) {
    const res = regExp.exec(str)
    if (
      [
        'WhiteSpace',
        'LineTerminal',
        'SingleLineComment',
        'MultiLineComment',
      ].includes(res.type)
    ) {
      // ignore token
    } else if (
      ['NumericLiteral', 'StringLiteral', 'BooleanLiteral'].includes(res.type)
    ) {
      yield {
        type: res.type,
        value: res[0],
      }
    } else if (res.type === 'NullLiteral') {
      yield {
        type: res.type,
        value: null,
      }
    } else if (res.type === 'Identifier') {
      yield {
        type: res.type,
        name: res[0],
      }
    } else if (res.type === 'Keyword') {
      yield { type: res[0] }
    } else if (res.type === 'Punctuator') {
      yield { type: res[0] }
    } else {
      throw new Error('unexpected token ' + res[0])
    }
    // console.log(JSON.stringify(res[0]).padEnd(20), res.lexcialType)
  }
  yield { type: 'EOF' }
}

// const source = `for (let i = 0; i < 3; i++) {
//   for (let j = 0; j < 3; j++) {
//     let cell = document.createElement('div')
//     cell.classList.add('cell')
//     cell.innerHTML =
//       pattern[i * 3 + j] == 2 ? '❌' : pattern[i * 3 + j] == 1 ? '⭕️' : ''
//     cell.addEventListener('click', () => userMove(j, i))
//     board.appendChild(cell)
//   }
//   board.appendChild(document.createElement('br'))
// }`

// const elements = scan(source)
// for (const element of elements) {
//   console.log(element)
// }

module.exports = scan
