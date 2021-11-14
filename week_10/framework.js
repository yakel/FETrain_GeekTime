export function createElement(type, attributes, ...children) {
  let element
  if (typeof type === 'string') {
    element = new ElementWrapper(type)
  } else {
    element = new type()
  }

  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value)
    }
  }

  let processChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'object' && child instanceof Array) {
        processChildren(child)
        continue
      }

      if (typeof child === 'string') {
        child = new TextNodeWrapper(child)
      }
      child.mountTo(element)
    }
  }
  processChildren(children)
  return element
}

export const STATE = Symbol('state')
export const ATTRIBUTE = Symbol('ATTRIBUTE')

export class Component {
  constructor() {
    this[ATTRIBUTE] = Object.create(null)
    this[STATE] = Object.create(null)
  }
  setAttribute(name, value) {
    this[ATTRIBUTE][name] = value
  }
  render() {
    return this.root
  }
  appendChild(child) {
    this.root.appendChild(child)
  }
  mountTo(parent) {
    if (!this.root) {
      this.render()
    }
    parent.appendChild(this.root)
  }
  triggerEvent(type, args) {
    const event = new CustomEvent(type, { detail: args })
    const onKey = 'on' + type.replace(/^[\s\S]/, (s) => s.toUpperCase())
    this[ATTRIBUTE][onKey](event)
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super()
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
}

class TextNodeWrapper extends Component {
  constructor(type) {
    super()
    this.root = document.createTextNode(type)
  }
}
