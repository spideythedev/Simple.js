count = 0

increment() {
  count = count + 1
  log@console(count)
}

log@console("Counter ready")
log@console(count)
increment()
increment()