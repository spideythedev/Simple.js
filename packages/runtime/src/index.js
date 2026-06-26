import { get, text, html, value, show, hide, addClass, removeClass } from './dom.js'
import { on, off, once, trigger } from './events.js'
import { save, load, remove, clear } from './storage.js'
import { fetchData, postData } from './fetch.js'
import { log, warn, error } from './console.js'

const SimpleJS = {
  get,
  text,
  html,
  value,
  show,
  hide,
  addClass,
  removeClass,
  on,
  off,
  once,
  trigger,
  save,
  load,
  remove,
  clear,
  fetch: fetchData,
  post: postData,
  log,
  warn,
  error
}

if (typeof window !== 'undefined') {
  window.SimpleJS = SimpleJS
  window.$ = SimpleJS
}

export default SimpleJS