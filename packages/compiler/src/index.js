import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

export function compile(source) {
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

    if (trimmed.match(/^\w+\(.*\)\s*\{/) && !trimmed.includes('@')) {
      const funcMatch = trimmed.match(/^(\w+)\(([^)]*)\)\s*\{/)
      if (funcMatch) {
        const bodyMatch = trimmed.match(/\{\s*(.+)\s*\}/)
        if (bodyMatch) {
          result.push('  '.repeat(indent) + `function ${funcMatch[1]}(${funcMatch[2]}) {`)
          result.push('  '.repeat(indent + 1) + `return ${bodyMatch[1]};`)
          result.push('  '.repeat(indent) + '}')
        } else {
          result.push('  '.repeat(indent) + `function ${funcMatch[1]}(${funcMatch[2]}) {`)
          indent++
        }
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
      const leftSide = parts[0].trim()
      const allCode = result.join('\n')
      const isPropertyAccess = leftSide.includes('[') || leftSide.includes('.')
      const varName = leftSide.split('[')[0].split('.')[0].trim()
      const alreadyDeclared = allCode.includes(`let ${varName} =`) || allCode.includes(`function ${varName}`)
      const keyword = (!isPropertyAccess && !alreadyDeclared) ? 'let ' : ''
      result.push('  '.repeat(indent) + `${keyword}${parts[0]} = ${parts[1]};`)
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

    if (trimmed.includes('+') && trimmed.includes('"')) {
      result.push('  '.repeat(indent) + `return ${trimmed};`)
      continue
    }

    if (trimmed.match(/^\w+\(.*\)$/)) {
      result.push('  '.repeat(indent) + trimmed + ';')
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

export function compileFile(inputPath, outputPath) {
  const source = readFileSync(resolve(inputPath), 'utf8')
  const js = compile(source)
  if (outputPath) {
    writeFileSync(resolve(outputPath), js, 'utf8')
  }
  return js
}

const args = process.argv.slice(2)

if (args.length >= 1) {
  const input = args[0]
  const output = args[1] || input.replace('.sjs', '.js')
  const js = compileFile(input, output)
  if (!args[1]) {
    console.log(js)
  }
} else {
  console.log('Simple.js Compiler')
  console.log('Usage: node index.js <input.sjs> [output.js]')
}