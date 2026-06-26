todos = []

addTodo(text) {
  todos.add({ text: text, done: false })
  log@console("Added: " + text)
}

toggleTodo(index) {
  todos[index].done = !todos[index].done
  log@console("Toggled: " + index)
}

showTodos() {
  for todo, i in todos {
    status = if todo.done { "✓" } else { " " }
    log@console(status + " " + todo.text)
  }
}

addTodo("Learn Simple.js")
addTodo("Build something cool")
toggleTodo(0)
showTodos()
log@console("Total: " + todos.length)