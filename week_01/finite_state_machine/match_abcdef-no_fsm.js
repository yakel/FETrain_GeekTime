function match(str) {
  const targe = "abcdef";
  let index = 0;
  for (const char of str) {
    if (char === target[index]) {
      index += 1;
      if (index >= target.length) {
        return true;
      }
    } else {
      index = 0;
      // 对于aabcdef这种，需考虑走到第二个a是虽然因！=b回到起始位，仍需判断是否符合起始状态
      if (char === target[0]) {
        index += 1;
      }
    }
  }
  return false;
}
