const input = document.getElementById('input')
const output = document.getElementById('output')
const compileBtn = document.getElementById('compile')
const runBtn = document.getElementById('run')
const shareBtn = document.getElementById('share')

function getTokens(source) {
  const tokens = []
  let i = 0
  while (i < source.length) {
    if (source[i] === ' ' || source[i] === '\t' || source[i] === '\r') { i++; continue }
    if (source[i] === '\n') { tokens.push({ type: 'NEWLINE' }); i++; continue }
    if (source[i] === '/' && source[i+1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }
    if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
      const quote = source[i]; let value = ''; i++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') { value += source[i]; i++ }
        value += source[i]; i++
      }
      i++; tokens.push({ type: 'STRING', value, quote }); continue
    }
    if (/[0-9]/.test(source[i])) {
      let num = ''
      while (i < source.length && /[0-9.]/.test(source[i])) { num += source[i]; i++ }
      tokens.push({ type: 'NUMBER', value: Number(num) }); continue
    }
    if (/[a-zA-Z_$]/.test(source[i])) {
      let word = ''
      while (i < source.length && /[a-zA-Z0-9_$]/.test(source[i])) { word += source[i]; i++ }
      const kw = ['if','else','for','in','ret','safe','empty','true','false','and','or','not','class','new','export','import','from','as','all','always','catch','init','extends']
      tokens.push({ type: kw.includes(word) ? 'KEYWORD' : 'IDENTIFIER', value: word }); continue
    }
    if (source[i] === '=' && source[i+1] === '=') { tokens.push({ type: 'OPERATOR', value: '==' }); i+=2; continue }
    if (source[i] === '!' && source[i+1] === '=') { tokens.push({ type: 'OPERATOR', value: '!=' }); i+=2; continue }
    if (source[i] === '>' && source[i+1] === '=') { tokens.push({ type: 'OPERATOR', value: '>=' }); i+=2; continue }
    if (source[i] === '<' && source[i+1] === '=') { tokens.push({ type: 'OPERATOR', value: '<=' }); i+=2; continue }
    if (source[i] === '.' && source[i+1] === '.') { tokens.push({ type: 'RANGE' }); i+=2; continue }
    const singles = { ':':'COLON','=':'ASSIGN','+':'OPERATOR','-':'OPERATOR','*':'OPERATOR','/':'OPERATOR','%':'OPERATOR','>':'OPERATOR','<':'OPERATOR','!':'OPERATOR','@':'AT','.':'DOT',';':'SEMICOLON','?':'QUESTION','(':'LPAREN',')':'RPAREN','{':'LBRACE','}':'RBRACE','[':'LBRACKET',']':'RBRACKET',',':'COMMA','$':'DOLLAR' }
    if (singles[source[i]]) { tokens.push({ type: singles[source[i]], value: source[i] }); i++; continue }
    i++
  }
  tokens.push({ type: 'EOF' })
  return tokens
}

function compile(source) {
  const lines = source.split('\n')
  const result = []
  let indent = 0

  for (let line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { result.push(''); continue }

    if (trimmed.startsWith('//')) { result.push(''); continue }

    if (trimmed.includes('@console')) {
      const match = trimmed.match(/(\w+)@console\((.+)\)/)
      if (match) {
        result.push('  '.repeat(indent) + `console.${match[1]}(${match[2]});`)
        continue
      }
    }

    if (trimmed.includes('@get(')) {
      const match = trimmed.match(/@get\((.+)\)/)
      if (match) {
        result.push('  '.repeat(indent) + `document.querySelector(${match[1]})`)
        continue
      }
    }

    if (trimmed.includes('@click(')) {
      const match = trimmed.match(/@click\((.+)\)/)
      if (match) {
        result.push('  '.repeat(indent) + `addEventListener('click', ${match[1]})`)
        continue
      }
    }

    if (trimmed.match(/^\w+\(.*\)\s*\{?$/)) {
      const funcMatch = trimmed.match(/^(\w+)\(([^)]*)\)\s*\{?$/)
      if (funcMatch) {
        result.push('  '.repeat(indent) + `function ${funcMatch[1]}(${funcMatch[2]}) {`)
        indent++
        continue
      }
    }

    if (trimmed === '}') {
      indent = Math.max(0, indent - 1)
      result.push('  '.repeat(indent) + '}')
      continue
    }

    if (trimmed.includes(' = ')) {
      const parts = trimmed.split(' = ')
      result.push('  '.repeat(indent) + `let ${parts[0]} = ${parts[1]};`)
      continue
    }

    if (trimmed.startsWith('if ')) {
      const cond = trimmed.replace('if ', '').replace(':', '').replace('{', '').trim()
      result.push('  '.repeat(indent) + `if (${cond}) {`)
      indent++
      continue
    }

    if (trimmed.startsWith('for ') && trimmed.includes(' in ')) {
      const match = trimmed.match(/for (\w+)(?:, (\w+))? in (.+):/)
      if (match) {
        const item = match[1]
        const iter = match[3]
        result.push('  '.repeat(indent) + `for (let ${item} of ${iter}) {`)
        indent++
        continue
      }
    }

    if (trimmed.startsWith('ret ')) {
      const val = trimmed.replace('ret ', '')
      result.push('  '.repeat(indent) + `return ${val};`)
      continue
    }

    if (trimmed.includes('+') || trimmed.includes('"')) {
      result.push('  '.repeat(indent) + `return ${trimmed};`)
      continue
    }

    result.push('  '.repeat(indent) + trimmed + ';')
  }

  while (indent > 0) {
    indent--
    result.push('  '.repeat(indent) + '}')
  }

  return result.join('\n')
}

function updateOutput() {
  const source = input.value
  const js = compile(source)
  output.value = js
}

function runCode() {
  const js = output.value
  const consoleOutput = []
  const fakeConsole = {
    log: (...args) => consoleOutput.push(args.join(' ')),
    warn: (...args) => consoleOutput.push('WARN: ' + args.join(' ')),
    error: (...args) => consoleOutput.push('ERROR: ' + args.join(' '))
  }
  try {
    const fn = new Function('console', js)
    fn(fakeConsole)
    if (consoleOutput.length > 0) {
      alert('Output:\n' + consoleOutput.join('\n'))
    } else {
      alert('Code ran successfully (no console output)')
    }
  } catch (e) {
    alert('Error: ' + e.message)
  }
}

function shareCode() {
  const code = input.value
  const url = new URL(window.location)
  url.hash = btoa(unescape(encodeURIComponent(code)))
  navigator.clipboard.writeText(url.toString()).then(() => {
    alert('Link copied to clipboard!')
  })
}

compileBtn.addEventListener('click', updateOutput)
runBtn.addEventListener('click', runCode)
shareBtn.addEventListener('click', shareCode)

input.addEventListener('input', updateOutput)

const hash = window.location.hash
if (hash) {
  try {
    const code = decodeURIComponent(escape(atob(hash.slice(1))))
    input.value = code
  } catch (e) {}
}

updateOutput()