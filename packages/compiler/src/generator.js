export function generate(ast) {
  let output = ''
  let indentLevel = 0

  function emit(str) {
    output += str
  }

  function emitLine(str = '') {
    output += '  '.repeat(indentLevel) + str + '\n'
  }

  function walk(node, isExpression) {
    if (!node) return
    if (Array.isArray(node)) {
      node.forEach(n => walk(n))
      return
    }

    switch (node.type) {
      case 'Program':
        node.body.forEach(stmt => {
          walk(stmt)
          emit('\n')
        })
        break

      case 'Block':
        indentLevel++
        node.body.forEach(stmt => {
          walk(stmt)
        })
        indentLevel--
        break

      case 'IfStatement': {
        emit(`if (${expr(node.test)}) {\n`)
        indentLevel++
        if (node.body && node.body.body) {
          node.body.body.forEach(stmt => walk(stmt))
        }
        indentLevel--
        emitLine('}')
        if (node.else) {
          if (node.else.type === 'IfStatement') {
            emit(' else ')
            walk(node.else)
          } else {
            emit(' else {\n')
            indentLevel++
            if (node.else.body) {
              node.else.body.forEach(stmt => walk(stmt))
            }
            indentLevel--
            emitLine('}')
          }
        }
        emit('\n')
        break
      }

      case 'TransformedFor': {
        const iter = node.iterVar
        const arr = expr(node.iterable)
        emit(`for (let ${iter} of ${arr}) {\n`)
        indentLevel++
        if (node.body && node.body.body) {
          node.body.body.forEach(stmt => walk(stmt))
        }
        indentLevel--
        emitLine('}')
        emit('\n')
        break
      }

      case 'ReturnStatement':
        emitLine(`return ${expr(node.argument)};`)
        break

      case 'TransformedSafe': {
        emit(`try {\n`)
        indentLevel++
        if (node.body && node.body.body) {
          node.body.body.forEach(stmt => walk(stmt))
        }
        indentLevel--
        emitLine(`} catch (${node.errorVar}) {`)
        if (node.errorBlock) {
          indentLevel++
          if (node.errorBlock.body) {
            node.errorBlock.body.forEach(stmt => walk(stmt))
          }
          indentLevel--
        }
        emitLine('}')
        if (node.alwaysBlock) {
          emit('finally {\n')
          indentLevel++
          if (node.alwaysBlock.body) {
            node.alwaysBlock.body.forEach(stmt => walk(stmt))
          }
          indentLevel--
          emitLine('}')
        }
        emit('\n')
        break
      }

      case 'ImportStatement': {
        if (node.names.length === 1) {
          emitLine(`import { ${node.names[0]} } from "${node.source}";`)
        } else {
          emitLine(`import { ${node.names.join(', ')} } from "${node.source}";`)
        }
        break
      }

      case 'ExportNamed':
        walk(node.declaration)
        break

      case 'ExportDefault':
        emit('export default ')
        walk(node.declaration, true)
        break

      case 'TransformedClass': {
        emit(`class ${node.name}`)
        if (node.superClass) {
          emit(` extends ${node.superClass}`)
        }
        emit(' {\n')
        indentLevel++
        node.methods.forEach(method => {
          if (method.name === 'init') {
            emitLine(`constructor(${method.params.map(p => p.name).join(', ')}) {`)
            indentLevel++
            if (method.body && method.body.body) {
              method.body.body.forEach(stmt => walk(stmt))
            }
            indentLevel--
            emitLine('}')
          } else {
            walk(method)
          }
        })
        indentLevel--
        emitLine('}')
        emit('\n')
        break
      }

      case 'Assignment': {
        const left = expr(node.left)
        const right = expr(node.right)
        if (node.isDeclaration) {
          emitLine(`let ${left} = ${right};`)
        } else {
          emitLine(`${left} = ${right};`)
        }
        break
      }

      case 'Function': {
        const name = node.name || ''
        const params = node.params.map(p => {
          if (p.default) return `${p.name} = ${expr(p.default)}`
          return p.name
        }).join(', ')
        emit(`function ${name}(${params}) {\n`)
        indentLevel++
        if (node.body && node.body.body) {
          const bodyStmts = node.body.body
          const lastIndex = bodyStmts.length - 1
          bodyStmts.forEach((stmt, i) => {
            if (i === lastIndex && stmt.type !== 'ReturnStatement' && stmt.type !== 'IfStatement' && stmt.type !== 'ForStatement' && stmt.type !== 'SafeStatement') {
              emitLine(`return ${expr(stmt)};`)
            } else {
              walk(stmt)
            }
          })
        }
        indentLevel--
        emitLine('}')
        emit('\n')
        break
      }

      case 'CallExpression': {
        if (isExpression) {
          emit(`${expr(node.callee)}(${node.arguments.map(expr).join(', ')})`)
        } else {
          emitLine(`${expr(node.callee)}(${node.arguments.map(expr).join(', ')});`)
        }
        break
      }

      case 'TransformedAt': {
        const left = expr(node.left)
        const target = node.target
        if (target === 'console') {
          emit(`console.${left}`)
        } else if (target === 'get') {
          emit(`document.querySelector(${left})`)
        } else if (target === 'local') {
          emit(`localStorage.${left}`)
        } else {
          emit(`${target}.${left}`)
        }
        break
      }

      case 'Identifier':
        emit(node.name)
        break

      case 'Literal': {
        if (node.value === null || node.value === undefined) {
          emit('null')
        } else if (typeof node.value === 'string') {
          const q = node.quote || '"'
          emit(`${q}${node.value}${q}`)
        } else {
          emit(String(node.value))
        }
        break
      }

      case 'ThisExpression':
        emit('this')
        break

      case 'BinaryExpression': {
        const op = node.operator === 'and' ? '&&' :
                   node.operator === 'or' ? '||' :
                   node.operator
        emit(`${expr(node.left)} ${op} ${expr(node.right)}`)
        break
      }

      case 'MemberExpression':
        emit(`${expr(node.object)}.${node.property}`)
        break

      case 'TernaryExpression':
        emit(`${expr(node.test)} ? ${expr(node.consequent)} : ${expr(node.alternate)}`)
        break

      case 'GroupExpression':
        emit(`(${node.expressions.map(expr).join(', ')})`)
        break

      case 'ObjectExpression': {
        emit('{ ')
        node.properties.forEach((prop, i) => {
          if (i > 0) emit(', ')
          emit(`${prop.key}: ${expr(prop.value)}`)
        })
        emit(' }')
        break
      }

      case 'ArrayExpression':
        emit(`[${node.elements.map(expr).join(', ')}]`)
        break

      case 'AllExpression':
        emit(`Promise.all([${node.expressions.map(expr).join(', ')}])`)
        break

      default:
        if (isExpression && node.value !== undefined) {
          emit(String(node.value))
        }
        break
    }
  }

  function expr(node) {
    if (!node) return ''
    let result = ''
    const oldOutput = output
    output = ''
    walk(node, true)
    result = output.trim()
    output = oldOutput
    return result
  }

  walk(ast)
  return output
}