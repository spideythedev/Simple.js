export function parse(tokens) {
  let pos = 0

  function peek() {
    return tokens[pos]
  }

  function peekNext() {
    return tokens[pos + 1]
  }

  function consume(type, value) {
    const token = tokens[pos]
    if (!token) {
      throw new Error(`Unexpected end of input`)
    }
    if (type && token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type} at line ${token.line}`)
    }
    if (value !== undefined && token.value !== value) {
      throw new Error(`Expected ${value} but got ${token.value} at line ${token.line}`)
    }
    pos++
    return token
  }

  function skipNewlines() {
    while (peek() && peek().type === 'NEWLINE') {
      pos++
    }
  }

  function parseProgram() {
    const body = []
    skipNewlines()
    while (peek() && peek().type !== 'EOF') {
      body.push(parseStatement())
      skipNewlines()
    }
    return { type: 'Program', body }
  }

  function parseStatement() {
    const token = peek()

    if (token.type === 'KEYWORD') {
      if (token.value === 'if') return parseIf()
      if (token.value === 'for') return parseFor()
      if (token.value === 'ret') return parseReturn()
      if (token.value === 'safe') return parseSafe()
      if (token.value === 'import') return parseImport()
      if (token.value === 'export') return parseExport()
      if (token.value === 'class') return parseClass()
    }

    return parseExpression()
  }

  function parseIf() {
    consume('KEYWORD', 'if')
    const test = parseExpression()
    consume('COLON')
    skipNewlines()
    const body = parseBlock()
    let elseBlock = null

    skipNewlines()
    if (peek() && peek().type === 'KEYWORD' && peek().value === 'else') {
      consume('KEYWORD', 'else')
      if (peek() && peek().type === 'KEYWORD' && peek().value === 'if') {
        elseBlock = parseIf()
      } else {
        consume('COLON')
        skipNewlines()
        elseBlock = parseBlock()
      }
    }

    return { type: 'IfStatement', test, body, else: elseBlock }
  }

  function parseBlock() {
    const body = []
    if (peek() && peek().type === 'LBRACE') {
      consume('LBRACE')
      skipNewlines()
      while (peek() && peek().type !== 'RBRACE' && peek().type !== 'EOF') {
        body.push(parseStatement())
        skipNewlines()
      }
      consume('RBRACE')
    } else {
      body.push(parseStatement())
    }
    return { type: 'Block', body }
  }

  function parseFor() {
    consume('KEYWORD', 'for')
    const vars = []
    vars.push(parseExpression())
    while (peek() && peek().type === 'COMMA') {
      consume('COMMA')
      vars.push(parseExpression())
    }
    consume('KEYWORD', 'in')
    const iterable = parseExpression()
    consume('COLON')
    skipNewlines()
    const body = parseBlock()
    return { type: 'ForStatement', vars, iterable, body }
  }

  function parseReturn() {
    consume('KEYWORD', 'ret')
    const argument = parseExpression()
    return { type: 'ReturnStatement', argument }
  }

  function parseSafe() {
    consume('KEYWORD', 'safe')
    consume('COLON')
    skipNewlines()
    const body = parseBlock()
    let errorBlock = null
    let alwaysBlock = null

    skipNewlines()
    if (peek() && peek().type === 'KEYWORD' && peek().value === 'if') {
      consume('KEYWORD', 'if')
      const errorVar = peek().type === 'IDENTIFIER' ? consume('IDENTIFIER').value : 'error'
      consume('COLON')
      skipNewlines()
      errorBlock = parseBlock()
      errorBlock.errorVar = errorVar
    }

    skipNewlines()
    if (peek() && peek().type === 'KEYWORD' && peek().value === 'always') {
      consume('KEYWORD', 'always')
      consume('COLON')
      skipNewlines()
      alwaysBlock = parseBlock()
    }

    return { type: 'SafeStatement', body, errorBlock, alwaysBlock }
  }

  function parseImport() {
    consume('KEYWORD', 'import')
    const names = []
    if (peek().type === 'LBRACE') {
      consume('LBRACE')
      names.push(consume('IDENTIFIER').value)
      while (peek() && peek().type === 'COMMA') {
        consume('COMMA')
        names.push(consume('IDENTIFIER').value)
      }
      consume('RBRACE')
      consume('KEYWORD', 'from')
    } else if (peek().type === 'IDENTIFIER') {
      names.push(consume('IDENTIFIER').value)
      if (peek().type === 'KEYWORD' && peek().value === 'from') {
        consume('KEYWORD', 'from')
      }
    }
    const source = consume('STRING').value
    return { type: 'ImportStatement', names, source }
  }

  function parseExport() {
    consume('KEYWORD', 'export')
    if (peek().type === 'KEYWORD' && peek().value === 'default') {
      consume('KEYWORD', 'default')
      const declaration = parseExpression()
      return { type: 'ExportDefault', declaration }
    }
    const declaration = parseExpression()
    return { type: 'ExportNamed', declaration }
  }

  function parseClass() {
    consume('KEYWORD', 'class')
    const name = consume('IDENTIFIER').value
    let superClass = null
    if (peek().type === 'KEYWORD' && peek().value === 'from') {
      consume('KEYWORD', 'from')
      superClass = consume('IDENTIFIER').value
    }
    consume('COLON')
    skipNewlines()
    const body = []
    while (peek() && peek().type !== 'EOF' && !(peek().type === 'NEWLINE' && peekNext() && peekNext().type !== 'IDENTIFIER')) {
      skipNewlines()
      if (peek().type === 'IDENTIFIER') {
        body.push(parseFunction())
      } else {
        break
      }
    }
    return { type: 'ClassStatement', name, superClass, body }
  }

  function parseExpression() {
    return parseAssignment()
  }

  function parseAssignment() {
    const left = parseBinary()
    if (peek() && peek().type === 'ASSIGN') {
      consume('ASSIGN')
      const right = parseAssignment()
      return { type: 'Assignment', left, right }
    }
    return left
  }

  function parseBinary() {
    let left = parseAtExpression()
    while (peek() && peek().type === 'OPERATOR' && ['+', '-', '*', '/', '%', '>', '<', '>=', '<=', '==', '!=', 'and', 'or'].includes(peek().value)) {
      const op = consume('OPERATOR').value
      const right = parseAtExpression()
      left = { type: 'BinaryExpression', operator: op, left, right }
    }
    return left
  }

  function parseAtExpression() {
    let left = parsePrimary()
    while (peek() && peek().type === 'AT') {
      consume('AT')
      const target = parsePrimary()
      left = { type: 'AtExpression', left, target }
    }
    while (peek() && peek().type === 'DOT') {
      consume('DOT')
      const prop = consume('IDENTIFIER').value
      left = { type: 'MemberExpression', object: left, property: prop }
    }
    if (peek() && peek().type === 'LPAREN') {
      left = parseCall(left)
    }
    return left
  }

  function parsePrimary() {
    const token = peek()

    if (token.type === 'NUMBER') {
      consume('NUMBER')
      return { type: 'Literal', value: token.value }
    }

    if (token.type === 'STRING') {
      consume('STRING')
      return { type: 'Literal', value: token.value, quote: token.quote }
    }

    if (token.type === 'KEYWORD') {
      if (token.value === 'true') { consume('KEYWORD', 'true'); return { type: 'Literal', value: true } }
      if (token.value === 'false') { consume('KEYWORD', 'false'); return { type: 'Literal', value: false } }
      if (token.value === 'empty') { consume('KEYWORD', 'empty'); return { type: 'Literal', value: null } }
      if (token.value === 'all') return parseAll()
    }

    if (token.type === 'IDENTIFIER') {
      const id = consume('IDENTIFIER').value
      if (peek() && peek().type === 'COLON' && peekNext() && peekNext().type !== 'NEWLINE' && peekNext().type !== 'EOF') {
        return parseFunction(id)
      }
      if (peek() && peek().type === 'LPAREN') {
        return parseCall({ type: 'Identifier', name: id })
      }
      return { type: 'Identifier', name: id }
    }

    if (token.type === 'LPAREN') {
      consume('LPAREN')
      const params = []
      if (peek().type !== 'RPAREN') {
        params.push(parseExpression())
        while (peek() && peek().type === 'COMMA') {
          consume('COMMA')
          params.push(parseExpression())
        }
      }
      consume('RPAREN')
      if (peek() && peek().type === 'COLON') {
        consume('COLON')
        const body = parseBlock()
        return { type: 'FunctionExpression', params, body }
      }
      return { type: 'GroupExpression', expressions: params }
    }

    if (token.type === 'LBRACKET') {
      consume('LBRACKET')
      const elements = []
      while (peek() && peek().type !== 'RBRACKET') {
        elements.push(parseExpression())
        if (peek() && peek().type === 'COMMA') consume('COMMA')
      }
      consume('RBRACKET')
      return { type: 'ArrayExpression', elements }
    }

    if (token.type === 'LBRACE') {
      return parseObject()
    }

    if (token.type === 'DOLLAR') {
      consume('DOLLAR')
      return { type: 'ThisExpression' }
    }

    if (token.type === 'QUESTION') {
      return parseTernary()
    }

    throw new Error(`Unexpected token: ${token.type} at line ${token.line}`)
  }

  function parseFunction(name) {
    if (name) {
      consume('COLON')
    }
    const params = []
    if (peek() && peek().type === 'LPAREN') {
      consume('LPAREN')
      if (peek().type !== 'RPAREN') {
        params.push(parseExpression())
        while (peek() && peek().type === 'COMMA') {
          consume('COMMA')
          params.push(parseExpression())
        }
      }
      consume('RPAREN')
    }
    if (peek() && peek().type === 'COLON') {
      consume('COLON')
    }
    const body = parseBlock()
    return { type: 'FunctionDeclaration', name, params, body }
  }

  function parseCall(callee) {
    consume('LPAREN')
    const args = []
    if (peek().type !== 'RPAREN') {
      args.push(parseExpression())
      while (peek() && peek().type === 'COMMA') {
        consume('COMMA')
        args.push(parseExpression())
      }
    }
    consume('RPAREN')
    return { type: 'CallExpression', callee, arguments: args }
  }

  function parseObject() {
    consume('LBRACE')
    const properties = []
    skipNewlines()
    while (peek() && peek().type !== 'RBRACE') {
      const key = consume('IDENTIFIER').value
      if (peek() && peek().type === 'LPAREN') {
        const method = parseCall({ type: 'Identifier', name: key })
        properties.push({ type: 'Property', key, value: method, method: true })
      } else if (peek() && peek().type === 'COLON') {
        consume('COLON')
        const value = parseExpression()
        properties.push({ type: 'Property', key, value })
      } else {
        properties.push({ type: 'Property', key, value: { type: 'Identifier', name: key } })
      }
      skipNewlines()
      if (peek() && peek().type === 'COMMA') {
        consume('COMMA')
        skipNewlines()
      }
    }
    consume('RBRACE')
    return { type: 'ObjectExpression', properties }
  }

  function parseAll() {
    consume('KEYWORD', 'all')
    consume('LBRACKET')
    const expressions = []
    while (peek() && peek().type !== 'RBRACKET') {
      expressions.push(parseExpression())
      if (peek() && peek().type === 'COMMA') consume('COMMA')
    }
    consume('RBRACKET')
    return { type: 'AllExpression', expressions }
  }

  function parseTernary() {
    consume('QUESTION')
    const test = parseExpression()
    consume('COLON')
    const consequent = parseExpression()
    let alternate = null
    if (peek() && peek().type === 'QUESTION') {
      alternate = parseTernary()
    } else if (peek() && peek().type === 'COLON') {
      consume('COLON')
      alternate = parseExpression()
    }
    return { type: 'TernaryExpression', test, consequent, alternate }
  }

  function parseProgram() {
    const body = []
    skipNewlines()
    while (peek() && peek().type !== 'EOF') {
      body.push(parseStatement())
      skipNewlines()
    }
    return { type: 'Program', body }
  }

  return parseProgram()
}