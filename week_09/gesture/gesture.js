const element = document.documentElement

element.addEventListener('mousedown', (event) => {
  console.log('down:', event.clientX, event.clientY)

  const move = (event) => {
    console.log('move:', event, event.clientX, event.clientY)
  }

  const up = (event) => {
    console.log('up:', event.clientX, event.clientY)
    element.removeEventListener('mousemove', move)
    element.removeEventListener('mouseup', up)
  }

  element.addEventListener('mousemove', move)
  element.addEventListener('mouseup', up)
})

element.addEventListener('touchstart', (event) => {
  console.log('start:', event)
})

element.addEventListener('touchmove', (event) => {})

element.addEventListener('touchend', (event) => {})
