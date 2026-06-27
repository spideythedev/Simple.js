<p align="center">
  <img src="simplejs.png" alt="Simple.js" width="120"/>
</p>

<h1 align="center">Simple.js</h1>

<p align="center">
  <strong>JavaScript, gentle.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/simple-js">
    <img src="https://img.shields.io/npm/v/simple-js?color=%233B82F6" alt="npm">
  </a>
  <a href="https://github.com/spideythedev/Simple.js/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/spideythedev/simple.js/publish.yml?color=%2306B6D4" alt="Build">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-%238B5CF6" alt="License">
  </a>
</p>

---

## What is Simple.js?

JavaScript takes **4 months** to learn. **Simple.js** takes **1**.

Same power. Same runtime. Cleaner syntax. Compiles directly into standard JavaScript.

### Simple.js

```js
name = "World"

greet() {
  "Hello " + name
}

log@console(greet())
```

### Compiled JavaScript

```js
let name = "World";

function greet() {
  return "Hello " + name;
}

console.log(greet());
```

---

## Quick Start

### Install

```bash
npm install -g @spideythedev/simple-js

simple-js init my-app

cd my-app

simple-js build app.sjs

node app.js
```

---

## Syntax

| JavaScript | Simple.js |
|------------|-----------|
| `const name = "Siva"` | `name = "Siva"` |
| `function greet() {}` | `greet() {}` |
| `return value` | `ret value` or last line |
| `null` / `undefined` | `empty` |
| `try / catch / finally` | `safe / if error / always` |
| `async` / `await` | Automatic |
| `this` | `$` |
| `===` | `==` (always strict) |

---

## The `@` System

```js
log@console("Hello")            // Console output

text@get("#title"): "Welcome"   // DOM text

on@click("#btn"): handleClick   // Event listeners

save@local("key", data)         // Local storage

data = fetch@("/api/users")     // Network requests
```

---

## Examples

### Hello World

```js
name = "World"

greet() {
  "Hello " + name
}

log@console(greet())
```

### Counter

```js
count = 0

increment() {
  count = count + 1
  log@console(count)
}

increment()
increment()
```

### Todo

```js
todos = []

addTodo(text) {
  todos.push(text)
  log@console("Added: " + text)
}

addTodo("Learn Simple.js")
```

---

## Commands

```bash
simple-js init my-app

simple-js build app.sjs

simple-js watch app.sjs

simple-js run app.sjs
```

---

## Features

- Clean, readable syntax
- Zero runtime overhead
- Compiles to modern JavaScript
- Automatic async handling
- Powerful `@` operator
- Browser and Node.js support
- CLI included
- Fast compiler
- Lightweight output
- Beginner-friendly while remaining production-ready

---

## Project Structure

```text
simple.js/
├── bin/
├── compiler/
├── parser/
├── lexer/
├── runtime/
├── std/
├── examples/
├── tests/
├── docs/
├── package.json
├── README.md
└── LICENSE
```

---

## Links

- GitHub
- npm
- Playground
- Documentation

---

## Browser Support

| Chrome | Firefox | Safari | Edge |
|---------|---------|---------|---------|
| ✅ | ✅ | ✅ | ✅ |

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

Please ensure all tests pass before submitting.

---

## Roadmap

- [ ] Language Server (LSP)
- [ ] VS Code Extension
- [ ] Playground Improvements
- [ ] Package Manager
- [ ] Formatter
- [ ] REPL
- [ ] WebAssembly Backend

---

## License

MIT © Simple.js

---

<p align="center">
  <strong>Simple.js</strong><br>
  <sub>JavaScript, gentle.</sub>
</p>