function match(str) {
  let state = start
  for (const char of str) {
    state = state(char)

    if (state === end) {
      return true
    }
  }
  return state === end
}

function start(char) {
  if (char === 'a') {
    return foundA
  }
  return start
}

function end(char) {
  return end
}

function foundA(char) {
  if (char === 'b') {
    return foundB
  }
  return start(char)
}

function foundB(char) {
  if (char === 'c') {
    return foundC
  }
  return start(char)
}

function foundC(char) {
  if (char === 'd') {
    return foundD
  }
  return start(char)
}

function foundD(char) {
  if (char === 'e') {
    return foundE
  }
  return start(char)
}

function foundE(char) {
  if (char === 'f') {
    return end
  }
  return start(char)
}

console.log(match('aabcdefg'))
