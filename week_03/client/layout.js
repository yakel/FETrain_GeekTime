function layout(element) {
  if (!element.computedStyle) {
    return
  }
  const style = getStyle(element)
  if (style.display !== 'flex') {
    return
  }

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

  const items = element.children.filter((e) => e.type === 'element')
  items.sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })

  let isAutoMainSize = false
  if (!style[mainSize]) {
    style[mainSize] = 0
    for (const item of items) {
      const itemSize = getStyle(item)
      const itemMainSize = itemSize[mainSize]
      if (itemMainSize) {
        style[mainSize] += itemMainSize
      }
    }
    isAutoMainSize = true
  }

  const flexLine = []
  const flexLines = [flexLine]
  let mainSpace = style[mainSize]
  let crossSpace = 0
  for (const item of items) {
    const itemStyle = getStyle(item)
    itemStyle[mainSize] = itemStyle[mainSize] || 0
    // 主轴尺寸：容器尺寸减去固定尺寸元素，剩下的空间给伸缩元素分配
    if (itemStyle.flex) {
      // 自动伸缩
      flexLine.push(item)
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize]
      const itemCrossSize = itemStyle[crossSize]
      if (itemCrossSize) {
        crossSpace = Math.max(crossSpace, itemCrossSize)
      }
      flexLine.push(item)
    } else {
      // 限制item主轴尺寸不超过容器尺寸
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize]
      }
      if (mainSpace < itemStyle[mainSize]) {
        // 超出剩余空间，结束该行，添加相应空间属性
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace
        // 新开一行放置元素
        flexLine = [item]
        flexLines.push(flexLine)
        mainSpace = style[mainSize]
        crossSize = 0
      } else {
        flexLine.push(item)
      }

      mainSpace -= itemStyle[mainSize]
      const itemCrossSize = itemStyle[crossSize]
      if (itemCrossSize) {
        crossSpace = Math.max(crossSpace, itemCrossSize)
      }
    }
  }
  // item处理完毕，保存行主轴、交叉轴空间属性
  flexLine.mainSpace = mainSpace
  if (style.flexWrap === 'nowrap' && isAutoMainSize) {
    flexLine.crossSize = style[crossSize] || crossSpace
  } else {
    flexLine.crossSpace = crossSpace
  }

  if (mainSpace < 0) {
    const scale = style[mainSize] / (style[mainSize] - mainSpace)
    let currentBase = mainBase
    for (const item of items) {
      const itemStyle = getStyle(item)
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0
      }
      itemStyle[mainSize] *= scale
      itemStyle[mainStart] = currentBase
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
      currentBase = itemStyle[mainEnd]
    }
  } else {
    for (const flexLine of flexLines) {
      const mainSpace = flexLine.mainSpace
      const flexTotal = flexLine.reduce((total, item) => {
        const itemStyle = getStyle(item)
        return total + (itemStyle.flex || 0)
      }, 0)
      if (flexTotal > 0) {
        // 有flexible项，按比例分配
        const currentMain = mainBase
        for (const item of flexLine) {
          const itemStyle = getStyle(item)
          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
          }
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = currentMain + mainSign * itemStyle[mainSize]
          currentMain = itemStyle[mainEnd]
        }
      } else {
        // 无flexible项，使用justContent属性布局
        let currentMain
        let step
        switch (style.justifyContent) {
          case 'flex-start':
            currentMain = mainBase
            step = 0
            break
          case 'flex-end':
            currentMain = mainBase + mainSpace * mainSign
            step = 0
            break
          case 'center':
            currentMain = mainBase + (mainSpace / 2) * mainSign
            step = 0
            break
          case 'space-between':
            currentMain = mainBase
            step = (mainSpace / (flexLine.length - 1)) * mainSign
            break
          case 'space-arround':
            step = (mainSpace / flexLine.length) * mainSign
            currentMain = mainBase + step / 2
            break
        }
        for (const item of flexLine) {
          const itemStyle = getStyle(item)
          itemStyle[mainStart] = currentMain
          itemStyle[mainEnd] = currentMain + itemStyle[mainSize] * mainSign
          currentMain = itemStyle[mainEnd] + step
        }
      }
    }
  }

  // computeCrossSize
  let remainingCrossSpace
  if (!style[crossSize]) {
    remainingCrossSpace = 0
    style[crossSize] = flexLines.reduce(
      (acc, flexLine) => acc + flexLine.crossSize,
      0
    )
  } else {
    remainingCrossSpace = style[crossSize]
    for (const flexLine of flexLines) {
      remainingCrossSpace -= flexLine.crossSize
    }
  }

  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize]
  } else {
    crossBase = 0
  }
  const lineSize = style[crossSize] / flexLines.length
  let step
  switch (style.alignContent) {
    case 'flex-start':
      crossBase += 0
      step = 0
      break
    case 'flex-end':
      crossBase += crossSign * crossSpace
      step = 0
      break
    case 'center':
      crossBase += crossSign + crossSpace * 2
      step = 0
      break
    case 'space-between':
      crossBase += 0
      step = crossSpace / (flexLines.length - 1)
      break
    case 'space-around':
      step = crossSpace / flexLines.length
      crossBase += (crossSign * step) / 2
      break
    case 'stretch':
      crossBase += 0
      step = 0
      break
  }
  for (const flexLine of flexLines) {
    let lineCrossSize = flexLine.crossSpace
    if (style.alignContent === 'stretch') {
      lineCrossSize = flexLine.crossSpace + crossSpace / flexLines.length
    }
    for (const item of flexLine) {
      const itemStyle = getStyle(item)
      const align = itemStyle.alignSelf || style.alignItems
      if (!itemStyle[crossSize]) {
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0
      }
      switch (align) {
        case 'flex-start':
          itemStyle[crossStart] = crossBase
          itemStyle[crossEnd] =
            itemStyle[crossStart] + crossSign * itemStyle[crossSize]
          break
        case 'flex-end':
          itemStyle[crossStart] = crossBase + crossSign * lineCrossSize
          itemStyle[crossEnd] =
            itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
          break
        case 'center':
          itemStyle[crossStart] =
            crossBase + crossSign * (lineCrossSize - itemStyle[crossSize] / 2)
          itemStyle[crossEnd] =
            itemStyle[crossStart] + crossSign * itemStyle[crossSize]
          break
        case 'stretch':
          itemStyle[crossStart] = crossBase
        // itemStyle[crossEnd] = crossBase + crossSign * item
        // itemStyle[crossSize] = crossSign * itemStyle[cro]
      }
    }
    crossBase += crossSign * (lineCrossSize + step)
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
