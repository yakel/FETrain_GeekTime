import { Component, STATE, ATTRIBUTE } from './framework'
import { enableGesture } from './gesture'
import { Timeline, Animation } from './animation'
import { ease } from './ease'

export class Carousel extends Component {
  constructor() {
    super()
  }

  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')
    for (const record of this[ATTRIBUTE].src) {
      const image = document.createElement('div')
      image.style.backgroundImage = `url('${record.img}')`
      this.root.appendChild(image)
    }
    enableGesture(this.root)
    const timeline = new Timeline()
    timeline.start()

    const children = this.root.children
    this[STATE].position = 0

    let t = 0
    let ax = 0
    let handler

    this.root.addEventListener('start', (event) => {
      timeline.pause()
      clearInterval(handler)
      let progress = (Date.now() - t) / 500
      ax = ease(progress) * 500 - 500
    })

    this.root.addEventListener('tap', (event) => {
      this.triggerEvent('click', {
        position: this[STATE].position,
        data: this[ATTRIBUTE].src[this[STATE].position],
      })
    })

    this.root.addEventListener('pan', (event) => {
      const offsetX = event.clientX - event.startX - ax
      const current = this[STATE].position - (offsetX - (offsetX % 500)) / 500
      for (let offset of [-1, 0, 1]) {
        let pos = current + offset
        pos = ((pos % children.length) + children.length) % children.length
        const child = children[pos]
        child.style.transform = `translateX(${
          -pos * 500 + offset * 500 + (offsetX % 500)
        }px)`
      }
    })

    this.root.addEventListener('end', (event) => {
      timeline.reset()
      timeline.start()
      handler = setInterval(nextPicture, 3000)

      const offsetX = event.clientX - event.startX - ax
      const current = this[STATE].position - (offsetX - (offsetX % 500)) / 500

      let direction = Math.round((offsetX % 500) / 500)
      if (event.isFlick) {
        if (event.velocity < 0) {
          direction = Math.ceil((offsetX % 500) / 500)
        } else {
          direction = Math.floor((offsetX % 500) / 500)
        }
      }

      for (let offset of [-1, 0, 1]) {
        let pos = current + offset
        pos = ((pos % children.length) + children.length) % children.length
        const child = children[pos]
        timeline.add(
          new Animation(
            child.style,
            'transform',
            -pos * 500 + offset * 500 + (offsetX % 500),
            -pos * 500 + offset * 500 + direction * 500,
            500,
            0,
            ease,
            (v) => `translateX(${v}px)`
          )
        )
      }

      this[STATE].position -= (offsetX - (offsetX % 500)) / 500 - direction
      this[STATE].position =
        ((this[STATE].position % children.length) + children.length) %
        children.length
      this.triggerEvent('change', { position: this[STATE].position })
    })

    const nextPicture = () => {
      t = Date.now()
      const current = this.root.children[this[STATE].position]
      timeline.add(
        new Animation(
          current.style,
          'transform',
          -this[STATE].position * 500,
          -500 - this[STATE].position * 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      )

      const nextIndex = (this[STATE].position + 1) % this.root.children.length
      const next = this.root.children[nextIndex]
      next.style.transform = `translateX(${500 - nextIndex * 500}px)`
      timeline.add(
        new Animation(
          next.style,
          'transform',
          500 - nextIndex * 500,
          -nextIndex * 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      )

      this[STATE].position = nextIndex
      this.triggerEvent('change', { position: this[STATE].position })
    }
    handler = setInterval(nextPicture, 3000)

    return this.root
  }
}
