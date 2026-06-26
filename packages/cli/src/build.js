import { compile } from '@simplejs/compiler'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname, extname, join } from 'path'
import { globSync } from 'fs'

export function build(input, output) {
  const inputPath = resolve(input)
  const outputPath = output ? resolve(output) : inputPath.replace('.sjs', '.js')

  if (!existsSync(inputPath)) {
    console.error(`File not found: ${input}`)
    process.exit(1)
  }

  const source = readFileSync(inputPath, 'utf8')
  const js = compile(source)
  const outDir = dirname(outputPath)
  
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
  }

  writeFileSync(outputPath, js, 'utf8')
  console.log(`Compiled: ${input} → ${output}`)
}