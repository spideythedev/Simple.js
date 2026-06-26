<p align="center">
  <img src="assets/simplejs.png" alt="Simple.js" width="120"/>
</p>

<h1 align="center">Simple.js</h1>

<p align="center">
  <strong>JavaScript, gentle.</strong>
</p>

<p align="center">
  <a href="https://simplejs.dev">Website</a> ·
  <a href="https://playground.simplejs.dev">Playground</a> ·
  <a href="https://simplejs.dev/docs">Docs</a>
</p>

---

## What is Simple.js?

JavaScript takes **4 months** to learn. **Simple.js** takes **1**.

Same power. Same runtime. Cleaner syntax. Compiles directly to standard JavaScript.

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
const name = "World";

function greet() {
  return "Hello " + name;
}

console.log(greet());
```

---

## Why?

| JavaScript | Simple.js |
|------------|-----------|
| `const`, `let`, `var` | Just assign with `=` |
| `function`, `=>` | `name() { }` |
| `null`, `undefined` | `empty` |
| `try/catch/finally` | `safe` / `if error` / `always` |
| `async` / `await` | Automatic |
| `this` | `$` |
| `==` and `===` | Just `==` (always strict) |

---

## Quick Start

### Install

```bash
npm install -g simplejs
simplejs init my-app
cd my-app
simplejs build
```

### Browser

```html
<script src="https://cdn.simplejs.dev/simple.min.js"></script>

<script type="text/simplejs">
  name = "Siva"
  log@console("Hello " + name)
</script>
```

---

## The `@` System

```js
log@console("Hello")            // Console

text@get("#title"): "Welcome"   // DOM

on@click("#btn"): handleClick   // Events

save@local("key", data)         // Storage

data = fetch@("/api/users")     // Network
```

---

## License

MIT © Simple.js
