const xRegExp = {
  InputElement: '<WhiteSpace>|<LineTerminator>|<Comment>|<Token>',
  WhiteSpace: / /,
  LineTerminator: /\n/,
  Comment: '<SigleLineComment>|<MultiLineComment>',
  SigleLineComment: /\/\/[^\n]*/,
  MultiLineComment: /\/\*([^*]|\*[^\/])*\*\//,
  Token: '<Literal>|<Keyword>|<Identifier>|<Punctuator>',
  Literal: '<NumericLiteral>|<StringLiteral>|<BooleanLiteral>|<NullLiteral>',
  NumericLiteral: /[1-9][0-9]*|0/,
  StringLiteral: /"[^"]*"|'[^']*'/,
  BooleanLiteral: /true|false/,
  NullLiteral: /null/,
  Keyword: /for|if/,
  Identifier: /[a-zA-Z1-9_\$][a-zA-Z0-9_\$]*/,
  Punctuator: /,/,
}

function compile(name) {
  const expr = xRegExp[name]
  if (expr instanceof RegExp) {
    return expr.source
  }
  return expr.replace(/<(\w+)>/g, (s, $1) => compile($1))
}

function scan(str) {
  const regExpStr = compile('InputElement')
  const regExp = RegExp(regExpStr, 'g')
  console.log('r:', regExp)
  while (regExp.lastIndex < str.length) {
    const r = regExp.exec(str)
    console.log(JSON.stringify(r[0]))
  }
}

scan(`
0
3
10
12
// hello world
/* hello world */
/* javascript */
`)
