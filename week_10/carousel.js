import { Component } from './framework'
import { enableGesture } from './gesture'
import { Timeline, Animation } from './animation'
import { ease } from './ease'

export class Carousel extends Component {
  constructor() {
    super()
    this.attributes = Object.create(null)
  }

  setAttribute(name, value) {
    this.attributes[name] = value
  }

  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')
    for (const record of this.attributes.src) {
      const image = document.createElement('div')
      image.style.backgroundImage = `url('${record}')`
      this.root.appendChild(image)
    }
    enableGesture(this.root)
    this.root.addEventListener('pan', (event) => {
      console.log('pan:', event)
      const offsetX = event.clientX - event.startX
      const current = position - (offsetX - (offsetX % 500)) / 500
      for (let offset of [-1, 0, 1]) {
        const pos = (current + offset + children.length) % children.length
        const child = children[pos]
        child.style.transition = 'none'
        child.style.transform = `translateX(${
          -pos * 500 + offset * 500 + (offsetX % 500)
        }px)`
      }
    })

    const children = this.root.children
    let position = 0

    // this.root.addEventListener('mousedown', (event) => {
    //   const startX = event.clientX

    //   const move = (event) => {
    //     const offsetX = event.clientX - startX
    //     const current = position - (offsetX - (offsetX % 500)) / 500
    //     for (let offset of [-1, 0, 1]) {
    //       const pos = (current + offset + children.length) % children.length
    //       const child = children[pos]
    //       child.style.transition = 'none'
    //       child.style.transform = `translateX(${
    //         -pos * 500 + offset * 500 + (offsetX % 500)
    //       }px)`
    //     }
    //   }

    //   const up = (event) => {
    //     const offsetX = event.clientX - startX
    //     position -= Math.floor(offsetX / 500)
    //     for (let offset of [
    //       0,
    //       -Math.sign(
    //         Math.round(offsetX / 500) - offsetX + 250 * Math.sign(offsetX)
    //       ),
    //     ]) {
    //       const pos = (position + offset + children.length) % children.length
    //       const child = children[pos]
    //       child.style.transition = ''
    //       child.style.transform = `translateX(${-pos * 500 + offset * 500}px)`
    //     }
    //     document.removeEventListener('mousemove', move)
    //     document.removeEventListener('mouseup', up)
    //   }

    //   document.addEventListener('mousemove', move)
    //   document.addEventListener('mouseup', up)
    // })

    // let currentIndex = 0
    // setInterval(() => {
    //   const nextIndex = (currentIndex + 1) % this.root.children.length

    //   const current = this.root.children[currentIndex]
    //   const next = this.root.children[nextIndex]

    //   next.style.transition = 'none'
    //   next.style.transform = `translateX(${100 - nextIndex * 100}%)`

    //   setTimeout(() => {
    //     current.style.transform = `translateX(${-100 - currentIndex * 100}%)`
    //     next.style.transition = ''
    //     next.style.transform = `translateX(${-nextIndex * 100}%)`
    //     currentIndex = nextIndex
    //   }, 16)
    // }, 3000)
    return this.root
  }

  mountTo(parent) {
    parent.appendChild(this.render())
  }
}
