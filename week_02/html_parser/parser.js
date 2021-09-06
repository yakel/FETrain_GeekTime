const EOF = Symbol('EOF') // End of file

function data(char) {}

module.exports.parseHTML = function parseHTML(html) {
  let state = data
  for (const char of html) {
    state = state(char)
  }
  state = state(EOF)
}
