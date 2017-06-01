'use strict'

const clean = function (fileContent) {
  if (typeof fileContent !== 'string') {
    throw new Error('Argument must be of type String.')
  }

  return fileContent.replace(/\/\/.*/gm, '') // Remove comments
    .replace(/[^\S\n]/gm, '') // Remove whitespaces
    .replace(/\r\n/gm, '\n') // Set line endings to \n
    .replace(/^\s*\n/gm, '') // Remove empty lines
    .replace(/\n(?=[^\n]*$)/g, '') // Remove possible last newline
}

const parse = function (line) {
  if (typeof line !== 'string') {
    throw new Error('Argument must be of type String.')
  }

  const aInstr = /^@([\w.$]+)$/.exec(line)
  const lInstr = /^\(([\w.$]+)\)$/.exec(line)
  const cInstr = /^(?:(A?M?D?)=)?(0|1|-1|[ADM][+-]1|[!-]?[ADM]|[AM]-D|D[+\-&|][AM])(?:;(JGT|JEQ|JGE|JLT|JNE|JLE|JMP))?$/.exec(line)

  if (aInstr !== null && aInstr[1] !== undefined) {
    return {
      type: 'A',
      symbol: !isNaN(aInstr[1]) ? parseInt(aInstr[1]) : aInstr[1]
    }
  }
  if (lInstr !== null && lInstr[1] !== undefined) {
    return {
      type: 'L',
      symbol: lInstr[1]
    }
  }
  if (cInstr !== null && (cInstr[1] !== undefined || cInstr[2] !== undefined | cInstr[3] !== undefined)) {
    return {
      type: 'C',
      dest: cInstr[1],
      comp: cInstr[2],
      jump: cInstr[3]
    }
  }

  throw new Error('Instruction \'' + line + '\' is invalid.')
}

module.exports = {
  clean,
  parse
}
