const images = require('images')

function render(viewport, element) {
  const style = element.style
  if (!style) {
    return
  }
  const image = images(style.width, style.height)

  const bgColor = style['background-color'] || 'rgb(0,0,0)'
  bgColor.match(/rgb\((\d+),(\d+),(\d+)\)/)
  image.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))

  viewport.draw(image, style.left || 0, style.top || 0)

  if (element.children) {
    for (const child of element.children) {
      render(viewport, child)
    }
  }
}

module.exports = redner
