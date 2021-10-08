const scan = require('./LexParser')

const syntax = {
  Program: [['StatementList', 'EOF']],
  StatementList: [['Statement'], ['StatementList', 'Statement']],
  Statement: [
    ['ExpressionStatement'],
    ['IfStatement'],
    ['VariableDeclaration'],
    ['FunctionDeclaration'],
  ],
  IfStatement: [['if', '(', 'Expression', ')', 'Statement']],
  VariableDeclaration: [
    // ['var', 'Identifier', ';'],
    ['let', 'Identifier', ';'],
    // ['const', 'Identifier', ';'],
  ],
  FunctionDeclaration: [
    ['function', 'Identifier', '(', ')', '{', 'StatementList', '}'],
  ],
  ExpressionStatement: [['Expression', ';']],
  Expression: [['AdditiveExpression']],
  AdditiveExpression: [
    ['MutiplicativeExpression'],
    ['AdditiveExpression', '+', 'MutiplicativeExpression'],
    ['AdditiveExpression', '-', 'MutiplicativeExpression'],
  ],
  MutiplicativeExpression: [
    ['PrimaryExpression'],
    ['MutiplicativeExpression', '*', 'PrimaryExpression'],
    ['MutiplicativeExpression', '/', 'PrimaryExpression'],
  ],
  PrimaryExpression: [['(', 'Expression', ')'], ['Literal'], ['Identifier']],
  Literal: [['Number']],
}

const hash = {}

function closure(state) {
  hash[JSON.stringify(state)] = state
  const queue = []
  for (const symbol in state) {
    if (symbol.match(/^\$/)) {
      return
    }
    queue.push(symbol)
  }
  while (queue.length) {
    const symbol = queue.shift()
    // console.log(symbol)
    const rules = syntax[symbol]
    if (rules) {
      for (const rule of rules) {
        if (!state[rule[0]]) {
          queue.push(rule[0])
        }
        let current = state
        for (const part of rule) {
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part]
        }
        current.$reduceType = symbol
        current.$reduceLength = rule.length
      }
    }
  }

  for (const symbol in state) {
    if (symbol.match(/^\$/)) {
      return
    }
    if (hash[JSON.stringify(state[symbol])]) {
      state[symbol] = hash[JSON.stringify(state[symbol])]
    } else {
      closure(state[symbol])
    }
  }
}

let start = {
  Program: { $isEnd: true },
  // IfStatement: end,
}

closure(start)
// console.log(start)

function parse(source) {
  const stack = [start]
  const symbolStack = []

  function reduce() {
    let state = stack[stack.length - 1]
    if (state.$reduceType) {
      const children = []
      for (let i = 0; i < state.$reduceLength; i += 1) {
        stack.pop()
        children.push(symbolStack.pop())
      }
      // non-ternimal symbol
      return {
        type: state.$reduceType,
        children: children.reverse(),
      }
    } else {
      throw new Error('unexpected token ' + state)
    }
  }

  function shift(symbol) {
    const state = stack[stack.length - 1]
    // terminal symbol
    if (symbol.type in state) {
      stack.push(state[symbol.type])
      symbolStack.push(symbol)
    } else {
      // reduce to non-terminal symbol
      shift(reduce())
      shift(symbol)
    }
  }

  for (const symbol of scan(source)) {
    shift(symbol)
  }

  const res = reduce()
  console.log(res)
}

let source = 'var a;'
parse(source)
