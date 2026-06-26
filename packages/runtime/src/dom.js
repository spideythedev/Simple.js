export function get(selector) {
  if (selector.startsWith('#')) {
    return document.getElementById(selector.slice(1))
  }
  if (selector.startsWith('.')) {
    return document.querySelectorAll(selector)
  }
  return document.querySelector(selector)
}

export function text(element, value) {
  if (!element) return ''
  if (value !== undefined) {
    element.textContent = value
  }
  return element.textContent
}

export function html(element, value) {
  if (!element) return ''
  if (value !== undefined) {
    element.innerHTML = value
  }
  return element.innerHTML
}

export function value(element, val) {
  if (!element) return ''
  if (val !== undefined) {
    element.value = val
  }
  return element.value
}

export function show(element) {
  if (element) element.style.display = ''
}

export function hide(element) {
  if (element) element.style.display = 'none'
}

export function addClass(element, className) {
  if (element) element.classList.add(className)
}

export function removeClass(element, className) {
  if (element) element.classList.remove(className)
}