todos = 0

addTodo(text) {
  log@console("Added: " + text)
}

toggleTodo(index) {
  log@console("Toggled: " + index)
}

addTodo("Learn Simple.js")
addTodo("Build something cool")
toggleTodo(0)
log@console("Total: " + 3)