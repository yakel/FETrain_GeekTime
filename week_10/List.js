import { Component, STATE, ATTRIBUTE, createElement } from './framework'

export class List extends Component {
  constructor() {
    super()
  }

  render() {
    this.children = this[ATTRIBUTE].data.map(this.tempalte)
    this.root = (<div>{this.children}</div>).render()
    return this.root
  }

  appendChild(child) {
    this.tempalte = child
    this.render()
  }
}
