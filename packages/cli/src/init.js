import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

export function init(name) {
  const projectPath = resolve(name || 'simplejs-app')

  if (existsSync(projectPath)) {
    console.error(`Directory already exists: ${name}`)
    process.exit(1)
  }

  mkdirSync(projectPath, { recursive: true })

  const appContent = `name = "World"
greet() { "Hello " + name }
log@console(greet())
`

  writeFileSync(resolve(projectPath, 'app.sjs'), appContent, 'utf8')

  console.log(`Project created: ${name}`)
  console.log(`  cd ${name}`)
  console.log(`  simplejs build app.sjs`)
}