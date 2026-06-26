import { compile } from '@simplejs/compiler'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export function build(input, output) {
  const inputPath = resolve(input)
  const outputPath = output ? resolve(output) : inputPath.replace('.sjs', '.js')

  if (!existsSync(inputPath)) {
    console.error(`File not found: ${input}`)
    process.exit(1)
  }

  const source = readFileSync(inputPath, 'utf8')
  const js = compile(source)
  writeFileSync(outputPath, js, 'utf8')
  console.log(`Compiled: ${input} → ${outputPath}`)
}