import { watch } from 'fs'
import { resolve, extname } from 'path'
import { build } from './build.js'

export function watchFile(input, output) {
  const inputPath = resolve(input)
  const outputPath = output ? resolve(output) : inputPath.replace('.sjs', '.js')

  console.log(`Watching: ${input}`)

  build(input, output)

  watch(inputPath, (eventType) => {
    if (eventType === 'change') {
      console.log(`File changed, recompiling...`)
      build(input, output)
    }
  })
}