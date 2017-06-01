'use strict'

const assert = require('assert')
const SymbolTable = require('../../lib/symbolTable')

describe('SymbolTable', () => {
  describe('constructor', () => {
    it('should contain the default symbols', () => {
      const symbols = {
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

      const symbolTable = new SymbolTable()
      for (const symbol in symbols) {
        assert.strictEqual(symbolTable.addressFor(symbol), symbols[symbol])
      }
    })
  })

  describe('resolveSymbols', () => {
    it('should create local variables', () => {
      const symbols = ['a', 'b', 'c']

      let instructions = []
      for (const symbol of symbols) {
        instructions.push({
          type: 'A',
          symbol
        })
      }

      const symbolTable = new SymbolTable(instructions)
      for (let i = 0; i < symbols.length; i++) {
        assert.strictEqual(symbolTable.addressFor(symbols[i]), 16 + i)
      }
    })

    it('should create labels', () => {
      const labelPrefix = 'LABEL'
      const labelPositions = [0, 5, 7, 10]

      let instructions = []
      const positionsMax = labelPositions.reduce((a, b) => Math.max(a, b))
      for (let i = 0; i <= positionsMax + 1; i++) {
        if (labelPositions.includes(i)) {
          instructions.push({ type: 'L', symbol: labelPrefix + i })
        } else {
          instructions.push({ type: 'C', comp: '0' })
        }
      }

      const symbolTable = new SymbolTable(instructions)
      for (let i = 0; i < labelPositions.length; i++) {
        const position = labelPositions[i]
        assert.strictEqual(symbolTable.addressFor(labelPrefix + position), position - i)
      }
    })
  })
})
