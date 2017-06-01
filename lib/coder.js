'use strict'

const SymbolTable = require('./symbolTable')

const decimalToBinary = function (decimal, bits = 16) {
  if (typeof decimal !== 'number' || typeof bits !== 'number') {
    throw new Error('Arguments must be of type Number.')
  }

  if (parseInt(decimal) !== decimal || parseInt(bits) !== bits) {
    throw new Error('Arguments must be integers.')
  }

  if (bits < 1) {
    throw new Error('Number of bits must be at least 1.')
  }

  const binary = decimal.toString(2)
  let nBitBinary = ''

  for (let i = bits - 1; i >= 0; i--) {
    const binaryIndex = binary.length - i - 1
    if (binaryIndex < 0) {
      nBitBinary += '0'
    } else {
      nBitBinary += binary[binaryIndex]
    }
  }

  return nBitBinary
}
const encode = (instructions, symbolTable = new SymbolTable()) => {
  /* eslint-disable no-new-object */
  if (!(new Object(instructions) instanceof Array)) {
    throw new Error('Instructions must be of type Array.')
  }
  if (!(new Object(symbolTable) instanceof SymbolTable)) {
    throw new Error('Symbol table must be of type SymbolTable')
  }
  /* eslint-enable no-new-object */

  let codes = []
  for (const instruction of instructions) {
    if (instruction === null) continue

    switch (instruction.type) {
      case 'A':
        let address = instruction.symbol
        if (typeof address === 'string') address = symbolTable.addressFor(instruction.symbol)

        codes.push('0' + decimalToBinary(address, 15))
        break

      case 'L':
        break

      case 'C':

        /* eslint-disable no-extend-native */
        // Source: https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
        String.prototype.replaceAt = function (index, replace) {
          return this.substr(0, index) + replace + this.substr(index + replace.length)
        }
        /* eslint-enable no-extend-native */

        let destination = '000'
        if (instruction.dest !== undefined) {
          if (instruction.dest.includes('A')) destination = destination.replaceAt(0, '1')
          if (instruction.dest.includes('D')) destination = destination.replaceAt(1, '1')
          if (instruction.dest.includes('M')) destination = destination.replaceAt(2, '1')
        }

        let jump = '000'
        if (instruction.jump !== undefined) {
          if (instruction.jump.includes('L')) jump = jump.replaceAt(0, '1')
          if (instruction.jump.includes('E')) jump = jump.replaceAt(1, '1')
          if (instruction.jump.includes('G')) jump = jump.replaceAt(2, '1')
          if (instruction.jump === 'JNE') jump = '101'
          else if (instruction.jump === 'JMP') jump = '111'
        }

        let a = '0'
        if (instruction.comp.includes('M')) a = '1'

        let compute = '000000'

        /* Logical approach
        if (!instruction.comp.includes('D')) compute[0] = '1'
        if (instruction.comp.match(/[+-]/) !== null) compute[4] = '1'
        if (instruction.comp.match(/[!|]/)) compute[5] = '1'
        if (instruction.comp === '0') compute = '101010'
        if (instruction.comp === '1') compute = '111111'
        if (instruction.comp === '-1') compute = '111010'
        */

        if (instruction.comp === '0') compute = '101010'
        else if (instruction.comp === '1') compute = '111111'
        else if (instruction.comp === '-1') compute = '111010'
        else if (instruction.comp === 'D') compute = '001100'
        else if (instruction.comp.match(/^[AM]$/)) compute = '110000'
        else if (instruction.comp === '!D') compute = '001101'
        else if (instruction.comp.match(/^![AM]$/)) compute = '110001'
        else if (instruction.comp === '-D') compute = '001111'
        else if (instruction.comp.match(/^-[AM]$/)) compute = '110011'
        else if (instruction.comp === 'D+1') compute = '011111'
        else if (instruction.comp.match(/^[AM]\+1$/)) compute = '110111'
        else if (instruction.comp === 'D-1') compute = '001110'
        else if (instruction.comp.match(/^[AM]-1$/)) compute = '110010'
        else if (instruction.comp.match(/^D\+[AM]$/)) compute = '000010'
        else if (instruction.comp.match(/^D-[AM]$/)) compute = '010011'
        else if (instruction.comp.match(/^[AM]-D$/)) compute = '000111'
        else if (instruction.comp.match(/^D&[AM]$/)) compute = '000000'
        else if (instruction.comp.match(/^D|[AM]$/)) compute = '010101'

        codes.push('111' + a + compute + destination + jump)
        break
    }
  }

  return codes
}

module.exports = {
  decimalToBinary,
  encode
}
