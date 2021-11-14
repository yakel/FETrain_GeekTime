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

  for (let child of children) {
    if (typeof child === 'string') {
      child = new TextNodeWrapper(child)
    }
    child.mountTo(element)
  }
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
    this.root = document.createElement(type)
  }
}

class TextNodeWrapper extends Component {
  constructor(type) {
    this.root = document.createTextNode(type)
  }
}
