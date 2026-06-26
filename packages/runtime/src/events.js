export function on(element, event, handler) {
  if (!element) return
  const eventName = event.replace('on', '').toLowerCase()
  element.addEventListener(eventName, handler)
}

export function off(element, event, handler) {
  if (!element) return
  const eventName = event.replace('on', '').toLowerCase()
  element.removeEventListener(eventName, handler)
}

export function once(element, event, handler) {
  if (!element) return
  const eventName = event.replace('on', '').toLowerCase()
  element.addEventListener(eventName, handler, { once: true })
}

export function trigger(element, event) {
  if (!element) return
  const eventName = event.replace('on', '').toLowerCase()
  element.dispatchEvent(new Event(eventName))
}