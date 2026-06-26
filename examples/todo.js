let todos = 0;

function addTodo(text) {
  console.log("Added: " + text);
}

function toggleTodo(index) {
  console.log("Toggled: " + index);
}

addTodo("Learn Simple.js");
addTodo("Build something cool");
toggleTodo(0);
console.log("Total: " + 3);