import { test } from 'node:test'
import assert from 'node:assert'
import { tokenize } from '../src/tokenizer.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('tokenizes hello.sjs', () => {
  const source = readFileSync(join(__dirname, 'fixtures', 'hello.sjs'), 'utf8')
  const tokens = tokenize(source)

  assert.ok(tokens.length > 0)

  assert.equal(tokens[0].type, 'IDENTIFIER')
  assert.equal(tokens[0].value, 'name')

  assert.equal(tokens[tokens.length - 1].type, 'EOF')
})

test('tokenizes keywords', () => {
  const tokens = tokenize('if true')

  assert.equal(tokens[0].type, 'KEYWORD')
  assert.equal(tokens[0].value, 'if')

  assert.equal(tokens[1].type, 'KEYWORD')
  assert.equal(tokens[1].value, 'true')
})

test('tokenizes strings', () => {
  const tokens = tokenize('"Siva"')

  assert.equal(tokens[0].type, 'STRING')
  assert.equal(tokens[0].value, 'Siva')
  assert.equal(tokens[1].type, 'EOF')
})

test('tokenizes numbers', () => {
  const tokens = tokenize('42')

  assert.equal(tokens[0].type, 'NUMBER')
  assert.equal(tokens[0].value, 42)
  assert.equal(tokens[1].type, 'EOF')
})

test('tokenizes @ operator', () => {
  const tokens = tokenize('log@console("hi")')

  const atToken = tokens.find(t => t.type === 'AT')
  assert.ok(atToken)
})