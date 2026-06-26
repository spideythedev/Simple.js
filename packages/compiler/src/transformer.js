export function transform(ast) {
  let varCounter = 0

  function newVar() {
    return `_v${varCounter++}`
  }

  function walk(node) {
    if (!node || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map(walk)

    switch (node.type) {
      case 'Program':
        return { ...node, body: walk(node.body) }

      case 'Block':
        return { ...node, body: walk(node.body) }

      case 'IfStatement':
        return {
          ...node,
          test: walk(node.test),
          body: walk(node.body),
          else: walk(node.else)
        }

      case 'ForStatement': {
        const iterVar = newVar()
        const indexVar = node.vars.length > 1 ? newVar() : null
        const iterable = walk(node.iterable)
        const body = walk(node.body)
        return {
          type: 'TransformedFor',
          iterVar,
          indexVar,
          vars: node.vars.map(walk),
          iterable,
          body
        }
      }

      case 'ReturnStatement':
        return { ...node, argument: walk(node.argument) }

      case 'SafeStatement': {
        const errorVar = node.errorBlock ? (node.errorBlock.errorVar || newVar()) : newVar()
        return {
          type: 'TransformedSafe',
          body: walk(node.body),
          errorVar,
          errorBlock: walk(node.errorBlock),
          alwaysBlock: walk(node.alwaysBlock)
        }
      }

      case 'ImportStatement':
        return { ...node }

      case 'ExportNamed':
        return { ...node, declaration: walk(node.declaration) }

      case 'ExportDefault':
        return { ...node, declaration: walk(node.declaration) }

      case 'ClassStatement': {
        const className = node.name
        const superClass = node.superClass
        const methods = node.body.map(m => walk(m))
        return { type: 'TransformedClass', name: className, superClass, methods }
      }

      case 'Assignment': {
        const left = walk(node.left)
        const right = walk(node.right)
        return { type: 'Assignment', left, right, isDeclaration: true }
      }

      case 'BinaryExpression':
        return {
          ...node,
          left: walk(node.left),
          right: walk(node.right)
        }

      case 'AtExpression': {
        const left = walk(node.left)
        const target = walk(node.target)
        const targetName = target.type === 'Identifier' ? target.name : target.value
        return { type: 'TransformedAt', left, target: targetName }
      }

      case 'MemberExpression':
        return {
          ...node,
          object: walk(node.object),
          property: node.property
        }

      case 'CallExpression':
        return {
          ...node,
          callee: walk(node.callee),
          arguments: walk(node.arguments)
        }

      case 'FunctionDeclaration':
      case 'FunctionExpression': {
        const params = node.params.map(p => {
          if (p.type === 'Assignment') {
            return { name: p.left.name, default: walk(p.right) }
          }
          return { name: p.name || p.value }
        })
        const body = walk(node.body)
        return { type: 'Function', name: node.name, params, body }
      }

      case 'ObjectExpression':
        return { ...node, properties: walk(node.properties) }

      case 'Property':
        return { ...node, value: walk(node.value) }

      case 'ArrayExpression':
        return { ...node, elements: walk(node.elements) }

      case 'TernaryExpression':
        return {
          ...node,
          test: walk(node.test),
          consequent: walk(node.consequent),
          alternate: walk(node.alternate)
        }

      case 'GroupExpression':
        return { ...node, expressions: walk(node.expressions) }

      case 'AllExpression':
        return { ...node, expressions: walk(node.expressions) }

      case 'Literal':
      case 'Identifier':
      case 'ThisExpression':
        return node

      default:
        return node
    }
  }

  return walk(ast)
}