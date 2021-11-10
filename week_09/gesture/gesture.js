const element = document.documentElement

element.addEventListener('mousedown', (event) => {
  start(event)

  const mousemove = (event) => {
    move(event)
  }

  const mouseup = (event) => {
    end(event)

    element.removeEventListener('mousemove', mousemove)
    element.removeEventListener('mouseup', mouseup)
  }

  element.addEventListener('mousemove', mousemove)
  element.addEventListener('mouseup', mouseup)
})

element.addEventListener('touchstart', (event) => {
  for (const touch of event.changedTouches) {
    start(touch)
  }
})

element.addEventListener('touchmove', (event) => {
  for (const touch of event.changedTouches) {
    move(touch)
  }
})

element.addEventListener('touchend', (event) => {
  for (const touch of event.changedTouches) {
    end(touch)
  }
})

element.addEventListener('touchcancel', (event) => {
  for (const touch of event.changedTouches) {
    cancel(touch)
  }
})

let handler
let startX
let startY
let isTap
let isPan
let isPress

const start = (point) => {
  // console.log('start:', point.clientX, point.clientY)
  startX = point.clientX
  startY = point.clientY
  isTap = true
  isPan = false
  isPress = false

  handler = setTimeout(() => {
    console.log('press')
    isTap = false
    isPan = false
    isPress = true
    handler = null
  }, 500)
}

const move = (point) => {
  // console.log('move:', point.clientX, point.clientY)
  if (!isPan) {
    const dx = point.clientX - startX
    const dy = point.clientY - startY
    if (dx ** 2 + dy ** 2 > 100) {
      isTap = false
      isPan = true
      isPress = false
      console.log('pan')

      clearTimeout(handler)
    }
  }
}

const end = (point) => {
  // console.log('end:', point.clientX, point.clientY)
  if (isTap) {
    console.log('tap')
    clearTimeout(handler)
  }
  if (isPan) {
    console.log('panend')
  }
  if (isPress) {
    console.log('pressend')
  }
}

const cancel = (point) => {
  console.log('cancel:', point.clientX, point.clientY)
}
