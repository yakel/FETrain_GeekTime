function layout(element) {
  if (!element.computedStyle) {
    return
  }
  const elementStyle = getStyle(element)
  if (elementStyle.display !== 'flex') {
    return
  }
  const items = element.children.filter((e) => e.type === 'element')
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })

  const style = elementStyle
  for (const size of ['width', 'height']) {
    if (style[size] == 'auto' || style[size] === '') {
      style[size] = null
    }
  }
  style.flexDirection = style.flexDirection || 'row'
  style.flexWrap = style.flexWrap || 'no-wrap'
  style.justifyContent = style.justifyContent || 'flex-start'
  style.alignItems = style.alignItems || 'stretch'
  style.alignContent = style.alignContent || 'flex-start'

  let mainSize, mainStart, mainEnd, mainSign, mainBase
  let crossSize, crossStart, crossEnd, crossSign, crossBase
  const flexDirection = style.flexDirection
  if (flexDirection.includes('row')) {
    mainSize = 'width'
    if (flexDirection === 'row') {
      mainStart = 'left'
      mainEnd = 'right'
      mainSign = +1
      mainBase = 0
    } else if (flexDirection === 'row-reverse') {
      mainStart = 'right'
      mainEnd = 'left'
      mainSign = -1
      mainBase = style.width
    }

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'end'
  } else if (flexDirection.includes('column')) {
    mainSize = 'height'
    if (flexDirection === 'column') {
      mainStart = 'top'
      mainEnd = 'bottom'
      mainSign = +1
      mainBase = 0
    } else if (flexDirection === 'column-reverse') {
      mainStart = 'bottom'
      mainEnd = 'top'
      mainSign = -1
      mainBase = style.height
    }

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }
  if (style.flexWrap === 'wrap-reverse') {
    let tmp = crossStart
    crossStart = crossEnd
    crossEnd = tmp
    crossSign = -1
  } else {
    crossSign = +1
    crossBase = 0
  }
}

function getStyle(element) {
  if (!element.style) {
    element.style = {}
  }
  for (const [propName, propItem] of Object.entries(element.computedStyle)) {
    let propVaule = propItem.value
    if (propVaule.toString().match(/px$/)) {
      propVaule = parseInt(propVaule)
    }
    if (propVaule.toString().match(/^[0-9\.]+$/)) {
      propVaule = parseInt(propVaule)
    }
    element.style[propName] = propValue
  }
  return element.style
}

module.exports = layout
