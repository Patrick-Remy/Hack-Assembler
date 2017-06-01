'use strict'

class SymbolTable {
  constructor (instructions) {
    this.symbols = {
      'nextRAMAddress': 16,
      'R0': 0,
      'R1': 1,
      'R2': 2,
      'R3': 3,
      'R4': 4,
      'R5': 5,
      'R6': 6,
      'R7': 7,
      'R8': 8,
      'R9': 9,
      'R10': 10,
      'R11': 11,
      'R12': 12,
      'R13': 13,
      'R14': 14,
      'R15': 15,
      'SCREEN': 16384,
      'KBD': 24576,
      'SP': 0,
      'LCL': 1,
      'ARG': 2,
      'THIS': 3,
      'THAT': 4
    }

    if (instructions === undefined) return

    /* eslint-disable no-new-object */
    if (!(new Object(instructions) instanceof Array)) {
      throw new Error('Argument must be of type Array.')
    }
    /* eslint-enable no-new-object */

    let instructionCounter = 0
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i]

      if (instruction === null) {
        throw new Error('Instruction ' + (i + 1) + ' is invalid.')
      }

      if (instruction.type === 'L' && typeof instruction.symbol === 'string') {
        if (this.symbols[instruction.symbol] === undefined) {
          this.symbols[instruction.symbol] = instructionCounter
        } else {
          throw new Error('Redeclaration of symbol \'' + instruction.symbol + '\'')
        }
      } else if (instruction.type !== 'L') instructionCounter++
    }
  }

  addressFor (symbol) {
    let address = this.symbols[symbol]
    if (address === undefined) {
      address = this.symbols[symbol] = this.symbols['nextRAMAddress']++
    }

    return address
  }
}

module.exports = SymbolTable
