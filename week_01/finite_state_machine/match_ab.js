function match(str) {
  let foundA = false
  for (const char of str) {
    if (char === 'a') {
      foundA = true
    } else if (foundA && char === 'b') {
      return true
    } else {
      foundA = false
    }
  }
  return false
}

match('I am robot')
