export class Listener {
  constructor(element, recognizer) {
    this.element = element
    this.recognizer = recognizer
    this.contexts = new Map()
    this.isListeningMouse = false

    this.addMouseListener()
    this.addTouchListener()
  }

  addMouseListener() {
    this.element.addEventListener('mousedown', (event) => {
      const context = Object.create(null)
      const key = 'mouse' + (1 << event.button)
      this.contexts.set(key, context)
      this.recognizer.start(event, context)

      const mousemove = (event) => {
        let button = 1
        while (button <= event.buttons) {
          if (button & event.buttons) {
            let key = button
            // 处理mousedown和mousemove event的button不对应问题
            if (key === 2) {
              key = 4
            } else if (key === 4) {
              key = 2
            }
            const context = this.contexts.get('mouse' + key)
            this.recognizer.move(event, context)
          }
          button = button << 1
        }
      }

      const mouseup = (event) => {
        const key = 'mouse' + (1 << event.button)
        const context = this.contexts.get(key)
        this.recognizer.end(event, context)
        this.contexts.delete(key)

        if (event.buttons === 0) {
          document.removeEventListener('mousemove', mousemove)
          document.removeEventListener('mouseup', mouseup)
          this.isListeningMouse = false
        }
      }

      if (!this.isListeningMouse) {
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
        this.isListeningMouse = true
      }
    })
  }

  addTouchListener() {
    this.element.addEventListener('touchstart', (event) => {
      for (const touch of event.changedTouches) {
        const context = Object.create(null)
        this.contexts.set(touch.identifier, context)
        this.recognizer.start(touch, context)
      }
    })

    this.element.addEventListener('touchmove', (event) => {
      for (const touch of event.changedTouches) {
        const context = this.contexts.get(touch.identifier)
        this.recognizer.move(touch, context)
      }
    })

    this.element.addEventListener('touchend', (event) => {
      for (const touch of event.changedTouches) {
        const context = this.contexts.get(touch.identifier)
        this.recognizer.end(touch, context)
        this.contexts.delete(touch.identifier)
      }
    })

    this.element.addEventListener('touchcancel', (event) => {
      for (const touch of event.changedTouches) {
        const context = this.contexts.get(touch.identifier)
        this.recognizer.cancel(touch, context)
      }
    })
  }
}

export class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher
  }

  start(point, context) {
    // console.log('start:', point.clientX, point.clientY)
    this.dispatcher.dispatch('start', {})
    context.startX = point.clientX
    context.startY = point.clientY
    context.isTap = true
    context.isPan = false
    context.isPress = false
    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      },
    ]

    context.handler = setTimeout(() => {
      this.dispatcher.dispatch('press', {})
      context.isTap = false
      context.isPan = false
      context.isPress = true
      context.handler = null
    }, 500)
  }

  move(point, context) {
    // console.log('move:', point.clientX, point.clientY)
    if (!context.isPan) {
      const dx = point.clientX - context.startX
      const dy = point.clientY - context.startY
      if (dx ** 2 + dy ** 2 > 100) {
        context.isTap = false
        context.isPan = true
        context.isPress = false
        this.dispatcher.dispatch('panstart', {
          clientX: point.clientX,
          clientY: point.clientY,
          startX: context.startX,
          startY: context.startY,
        })

        clearTimeout(context.handler)
      }
    } else {
      this.dispatcher.dispatch('pan', {
        clientX: point.clientX,
        clientY: point.clientY,
        startX: context.startX,
        startY: context.startY,
      })
    }

    const now = Date.now()
    context.points = context.points.filter((p) => now - p.t < 500)
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    })
  }

  end(point, context) {
    // console.log('end:', point.clientX, point.clientY)
    context.points = context.points.filter((p) => Date.now() - p.t < 500)
    let v = 0
    if (context.points.length) {
      const firstPoint = context.points[0]
      const dx = point.clientX - firstPoint.clientX
      const dy = point.clientY - firstPoint.clientY
      const d = Math.sqrt(dx ** 2 + dy ** 2)
      v = d / (Date.now() - firstPoint.t)
    }
    context.isFlick = v > 1.5

    if (context.isTap) {
      this.dispatcher.dispatch('tap', {})
      clearTimeout(context.handler)
    }
    if (context.isPan) {
      this.dispatcher.dispatch('panend', {
        clientX: point.clientX,
        clientY: point.clientY,
        startX: context.startX,
        startY: context.startY,
        isFlick: context.isFlick,
        velocity: v,
      })
    }
    if (context.isPress) {
      this.dispatcher.dispatch('pressend', {})
    }
    this.dispatcher.dispatch('end', {
      clientX: point.clientX,
      clientY: point.clientY,
      startX: context.startX,
      startY: context.startY,
      isFlick: context.isFlick,
      velocity: v,
    })
  }

  cancel(point, context) {
    clearTimeout(context.handler)
    this.dispatcher.dispatch('cancel', {})
  }
}

export class Dispatcher {
  constructor(element) {
    this.element = element
  }

  dispatch(type, properties) {
    // console.log('dispatch:', type)
    const event = new Event(type)
    for (const [key, value] of Object.entries(properties)) {
      event[key] = value
    }
    this.element.dispatchEvent(event)
  }
}

export function enableGesture(element) {
  const dispatcher = new Dispatcher(element)
  const recognizer = new Recognizer(dispatcher)
  new Listener(element, recognizer)
}
