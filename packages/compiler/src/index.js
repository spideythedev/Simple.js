import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { tokenize } from './tokenizer.js'
import { parse } from './parser.js'
import { transform } from './transformer.js'
import { generate } from './generator.js'

export function compile(source) {
  const tokens = tokenize(source)
  const ast = parse(tokens)
  const transformed = transform(ast)
  const js = generate(transformed)
  return js
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