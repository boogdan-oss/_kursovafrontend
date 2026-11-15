import { readFileSync, writeFileSync } from 'node:fs'

import ts from 'typescript'

const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed })

for (const file of process.argv.slice(2)) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  writeFileSync(file, printer.printFile(source))
}
