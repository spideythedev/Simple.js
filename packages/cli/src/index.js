import { build } from './build.js'
import { watchFile } from './watch.js'
import { init } from './init.js'

export function run(args) {
  const command = args[0]

  if (!command) {
    console.log('Simple.js — JavaScript, gentle.')
    console.log('')
    console.log('Commands:')
    console.log('  init <name>       Create a new project')
    console.log('  build <input>     Compile .sjs to .js')
    console.log('  watch <input>     Watch and recompile')
    console.log('')
    console.log('Example:')
    console.log('  simplejs init my-app')
    console.log('  simplejs build app.sjs')
    return
  }

  switch (command) {
    case 'build':
      build(args[1], args[2])
      break
    case 'watch':
      watchFile(args[1], args[2])
      break
    case 'init':
      init(args[1])
      break
    default:
      console.log(`Unknown command: ${command}`)
  }
}