function match(str) {
  for (const char of str) {
    if (char === 'a') {
      return true
    }
  }
  return false
}

match('I am robot')
