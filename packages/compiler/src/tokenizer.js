import { isKeyword } from './utils.js'

export function tokenize(source) {
  const tokens = []
  let i = 0
  let line = 1
  let column = 1

  while (i < source.length) {
    if (source[i] === ' ' || source[i] === '\t') {
      column++
      i++
      continue
    }

    if (source[i] === '\n') {
      tokens.push({ type: 'NEWLINE', line, column })
      line++
      column = 1
      i++
      continue
    }

    if (source[i] === '\r') {
      column++
      i++
      continue
    }

    if (source[i] === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') {
        i++
        column++
      }
      continue
    }

    if (source[i] === '/' && source[i + 1] === '*') {
      i += 2
      column += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') {
          line++
          column = 1
        } else {
          column++
        }
        i++
      }
      i += 2
      column += 2
      continue
    }

    if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
      const quote = source[i]
      const startLine = line
      const startCol = column
      let value = ''
      i++
      column++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') {
          value += source[i]
          i++
          column++
          if (i < source.length) {
            value += source[i]
            i++
            column++
          }
        } else {
          if (source[i] === '\n') { line++; column = 1 }
          else { column++ }
          value += source[i]
          i++
        }
      }
      if (i < source.length) {
        i++
        column++
      }
      tokens.push({ type: 'STRING', value, quote, line: startLine, column: startCol })
      continue
    }

    if (/[0-9]/.test(source[i])) {
      const startCol = column
      let num = ''
      while (i < source.length && /[0-9.]/.test(source[i])) {
        num += source[i]
        i++
        column++
      }
      tokens.push({ type: 'NUMBER', value: Number(num), line, column: startCol })
      continue
    }

    if (/[a-zA-Z_$]/.test(source[i])) {
      const startCol = column
      let word = ''
      while (i < source.length && /[a-zA-Z0-9_$]/.test(source[i])) {
        word += source[i]
        i++
        column++
      }
      const type = isKeyword(word) ? 'KEYWORD' : 'IDENTIFIER'
      tokens.push({ type, value: word, line, column: startCol })
      continue
    }

    const twoCharOps = {
      '==': 'OPERATOR',
      '!=': 'OPERATOR',
      '>=': 'OPERATOR',
      '<=': 'OPERATOR',
      '..': 'RANGE'
    }

    const twoChar = source[i] + source[i + 1]
    if (twoCharOps[twoChar]) {
      tokens.push({ type: twoCharOps[twoChar], value: twoChar, line, column })
      i += 2
      column += 2
      continue
    }

    const singleChars = {
      ':': 'COLON',
      '=': 'ASSIGN',
      '+': 'OPERATOR',
      '-': 'OPERATOR',
      '*': 'OPERATOR',
      '/': 'OPERATOR',
      '%': 'OPERATOR',
      '>': 'OPERATOR',
      '<': 'OPERATOR',
      '!': 'OPERATOR',
      '@': 'AT',
      '.': 'DOT',
      ',': 'COMMA',
      '(': 'LPAREN',
      ')': 'RPAREN',
      '{': 'LBRACE',
      '}': 'RBRACE',
      '[': 'LBRACKET',
      ']': 'RBRACKET',
      '?': 'QUESTION',
      '$': 'DOLLAR'
    }

    if (singleChars[source[i]]) {
      tokens.push({ type: singleChars[source[i]], value: source[i], line, column })
      i++
      column++
      continue
    }

    i++
    column++
  }

  tokens.push({ type: 'EOF', line, column })
  return tokens
}