function match(str) {
  let state = start;
  for (const char of str) {
    state = state(char);

    if (state === end) {
      return true;
    }
  }
  return state === end;
}

function start(char) {
  if (char === "a") {
    return foundA;
  }
  return start;
}

function end(char) {
  return end;
}

function foundA(char) {
  if (char === "b") {
    return foundB;
  }
  return start(char);
}

function foundB(char) {
  if (char === "c") {
    return foundC;
  }
  return start(char);
}

function foundC(char) {
  if (char === "a") {
    return foundA2;
  }
  return start(char);
}

function foundA2(char) {
  if (char === "b") {
    return foundB2;
  }
  return start(char);
}

function foundB2(char) {
  if (char === "x") {
    return end;
  }
  return findB(char);
}

console.log(match("abcabcabx"));
