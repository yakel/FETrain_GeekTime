const TICK = Symbol('tick')
const TICK_HANDLER = Symbol('tick_handler')
const ANIMATIONS = Symbol('animations')
const START_TIME = Symbol('start_time')
const PAUSE_START = Symbol('pause_start')
const PAUSE_TIME = Symbol('pause_time')

export class Timeline {
  constructor() {
    this[ANIMATIONS] = new Set()
    this[START_TIME] = new Map()
  }

  add(animation, startTime) {
    startTime = startTime || Date.now()
    this[ANIMATIONS].add(animation)
    this[START_TIME].set(animation, startTime)
  }

  start() {
    const timelineStartTime = Date.now()
    this[PAUSE_TIME] = 0
    this[TICK] = () => {
      const now = Date.now()
      for (const animation of this[ANIMATIONS]) {
        let startTime = this[START_TIME].get(animation)
        if (startTime < timelineStartTime) {
          startTime = timelineStartTime
        }

        const timeDiff = now - startTime - this[PAUSE_TIME]
        if (timeDiff > animation.duration) {
          this[ANIMATIONS].delete(animation)
          timeDiff = animation.duration
        }
        if (timeDiff > 0) {
          animation.receive(timeDiff)
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK])
    }
    this[TICK]()
  }

  pause() {
    this[PAUSE_START] = Date.now()
    cancelAnimationFrame(this[TICK_HANDLER])
  }

  resume() {
    this[PAUSE_TIME] = Date.now() - this[PAUSE_START]
    this[TICK]()
  }

  reset() {}
}

export class Animation {
  constructor(
    object,
    property,
    startValue,
    endValue,
    duration,
    delay,
    timingFunction,
    template
  ) {
    this.object = object
    this.property = property
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.delay = delay
    this.timingFunction = timingFunction || ((v) => v)
    this.template = template || ((v) => v)
  }

  receive(time) {
    const range = this.endValue - this.startValue
    const progress = this.timeFunction(time / this.duration)
    this.object[this.property] = this.template(
      this.startValue + range * progress
    )
  }
}
