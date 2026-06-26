export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function load(key) {
  const item = localStorage.getItem(key)
  if (item === null) return null
  try {
    return JSON.parse(item)
  } catch {
    return item
  }
}

export function remove(key) {
  localStorage.removeItem(key)
}

export function clear() {
  localStorage.clear()
}