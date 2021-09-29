const syntax = {
  Program: [['StatementList']],
  StatementList: [['Statement'], ['StatementList', 'Statement']],
  Statement: [
    ['ExpressionStatement'],
    ['IfStatement'],
    ['VariableDeclaration'],
    ['FunctionDeclaration'],
  ],
  ExpressionStatement: [['AdditiveExpression']],
  AdditiveExpression: [
    ['MutiplicativeExpression'],
    ['AdditiveExpression', '+', 'MutiplicativeExpression'],
    ['AdditiveExpression', '-', 'MutiplicativeExpression'],
  ],
}
