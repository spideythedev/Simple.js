const vscode = require('vscode')

function activate(context) {
  const collection = vscode.languages.createDiagnosticCollection('simplejs')

  vscode.workspace.onDidSaveTextDocument((doc) => {
    if (doc.languageId !== 'simplejs') return

    const diagnostics = []
    const text = doc.getText()
    const lines = text.split('\n')
    let braceCount = 0

    lines.forEach((line, i) => {
      const open = (line.match(/\{/g) || []).length
      const close = (line.match(/\}/g) || []).length
      braceCount += open - close

      if (braceCount < 0) {
        diagnostics.push({
          message: 'Unexpected closing brace',
          range: new vscode.Range(i, line.indexOf('}'), i, line.indexOf('}') + 1),
          severity: vscode.DiagnosticSeverity.Error
        })
        braceCount = 0
      }
    })

    if (braceCount > 0) {
      diagnostics.push({
        message: `Missing ${braceCount} closing brace(s)`,
        range: new vscode.Range(lines.length - 1, 0, lines.length - 1, 0),
        severity: vscode.DiagnosticSeverity.Warning
      })
    }

    collection.set(doc.uri, diagnostics)
  })

  context.subscriptions.push(collection)
}

function deactivate() {}

module.exports = { activate, deactivate }