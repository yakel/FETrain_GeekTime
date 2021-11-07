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

export class Component {
  constructor() {}
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(child) {
    this.root.appendChild(child)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
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
