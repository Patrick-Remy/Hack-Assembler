'use strict'

const fs = require('fs')
const path = require('path')

const parser = require('./parser')
const coder = require('./coder')
const SymbolTable = require('./symbolTable')

const assemble = function (fileContent) {
  if (typeof fileContent !== 'string') {
    throw new Error('Argument must be of type String.')
  }

  const instructions = parser.clean(fileContent)
    .split('\n')
    .map((line) => parser.parse(line))

  const symbolTable = new SymbolTable(instructions)

  return coder.encode(instructions, symbolTable)
    .join('\n') + '\n'
}

const assembleFile = function (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return reject(err)

      const hackCode = assemble(data)
      const hackFilePath = path.format({
        dir: path.dirname(file),
        base: path.basename(file, path.extname(file)) + '.hack'
      })

      fs.writeFile(hackFilePath, hackCode, 'utf8', err => {
        if (err) return reject(err)
        resolve(hackFilePath)
      })
    })
  })
}

module.exports = {
  assemble,
  assembleFile
}
