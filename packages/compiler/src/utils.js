export function indent(level) {
  return '  '.repeat(level)
}

export function isKeyword(word) {
  const keywords = [
    'if', 'else', 'for', 'in', 'ret', 'safe',
    'empty', 'true', 'false', 'and', 'or', 'not',
    'class', 'new', 'export', 'import', 'from',
    'as', 'all', 'always', 'catch', 'init', 'extends'
  ]
  return keywords.includes(word)
}

export function isBuiltinAt(target) {
  const builtins = [
    'console', 'get', 'local', 'api',
    'file', 'click', 'submit', 'keydown'
  ]
  return builtins.includes(target)
}

export function escapeString(str) {
  return str.replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
}

export function throwError(message, line, column) {
  const err = new Error(`${message} at line ${line}, column ${column}`)
  err.line = line
  err.column = column
  throw err
}