class XRegExp {
  constructor(source, flags, root) {
    this.table = new Map()
    const regExpStr = this.compile(source, root, 1)
    this.regExp = new RegExp(regExpStr.source, flags)
    console.log('re:', this.regExp)
    console.log('table:', this.table)
  }

  compile(source, name, start) {
    const expr = source[name]
    if (expr instanceof RegExp) {
      return { source: expr.source, length: 0 }
    }
    let offset = 0
    const regExpStr = expr.replace(/<(\w+)>/g, (s, $1) => {
      this.table.set(start + offset, $1)
      offset += 1
      const result = this.compile(source, $1, start + offset)
      offset += result.length
      return '(' + result.source + ')'
    })
    return {
      source: regExpStr,
      length: offset,
    }
  }

  exec(str) {
    const res = this.regExp.exec(str)
    console.log(res)
    for (let i = 1; i < res.length; i += 1) {
      if (res[i] !== undefined) {
        console.log(res[i], this.table.get(i))
        res[this.table.get(i)] = res[i]
      }
    }
    return res

    console.log('r:', res)
  }

  get lastIndex() {
    return this.regExp.lastIndex
  }

  set lastIndex(value) {
    this.regExp.lastIndex = value
  }
}

function scan(str) {
  const lexical = {
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
  const regExp = new XRegExp(lexical, 'g', 'InputElement')
  // let res = ''
  while (regExp.lastIndex < str.length) {
    const r = regExp.exec(str)
    // res += r[0]
    break
  }
  // console.log(res)
}

scan(`for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    let cell = document.createElement('div')
    cell.classList.add('cell')
    cell.innerHTML =
      pattern[i * 3 + j] == 2 ? '❌' : pattern[i * 3 + j] == 1 ? '⭕️' : ''
    cell.addEventListener('click', () => userMove(j, i))
    board.appendChild(cell)
  }
  board.appendChild(document.createElement('br'))
}`)
