'use strict'

const assert = require('assert')
const parser = require('../../lib/parser')

describe('parser', function () {
  describe('clean', () => {
    it('should expect a string as first argument', () => {
      assert.throws(() => parser.clean())
      assert.throws(() => parser.clean(undefined))
      assert.throws(() => parser.clean(true))
      assert.throws(() => parser.clean(42))
      assert.throws(() => parser.clean(null))
      assert.throws(() => parser.clean({}))
      assert.throws(() => parser.clean([]))
      assert.doesNotThrow(() => parser.clean(''))
    })

    it('should return a string', () => {
      assert(typeof parser.clean('') === 'string')
    })

    it('should remove all whitespaces', () => {
      assert.strictEqual(parser.clean('   4  2 2   '), '422')
    })

    it('should remove blank lines and last newline', () => {
      assert.strictEqual(parser.clean('\n\n\r\n\n4\n\n2\n\n'), '4\n2')
    })

    it('should set line-endings to \\n', () => {
      assert.strictEqual(parser.clean('4\r\n2\n'), '4\n2')
    })

    it('should remove comments', () => {
      assert.strictEqual(parser.clean('// A curious comment'), '')
      assert.strictEqual(parser.clean('42// A curious comment'), '42')
    })
  })

  describe('parse', () => {
    it('should expect a string as first argument', () => {
      assert.throws(() => parser.parse())
      assert.throws(() => parser.parse(undefined))
      assert.throws(() => parser.parse(true))
      assert.throws(() => parser.parse(42))
      assert.throws(() => parser.parse(null))
      assert.throws(() => parser.parse({}))
      assert.throws(() => parser.parse([]))
      assert.doesNotThrow(() => parser.parse('@42'))
    })

    it('should parse a decimal A-instruction symbol', () => {
      const parsed = parser.parse('@42')
      assert.notStrictEqual(parsed, null)
      assert.strictEqual(parsed.type, 'A')
      assert.strictEqual(parsed.symbol, 42)
    })

    it('should parse a labelled A-instruction', () => {
      const parsed = parser.parse('@label')
      assert.notStrictEqual(parsed, null)
      assert.strictEqual(parsed.type, 'A')
      assert.strictEqual(parsed.symbol, 'label')
    })

    it('should parse L-instructions', () => {
      const parsed = parser.parse('(label)')
      assert.notStrictEqual(parsed, null)
      assert.strictEqual(parsed.type, 'L')
      assert.strictEqual(parsed.symbol, 'label')
    })

    it('should parse ._$ in symbol name', () => {
      let parsed = parser.parse('@._$')
      assert.notStrictEqual(parsed, null)
      assert.strictEqual(parsed.type, 'A')
      assert.strictEqual(parsed.symbol, '._$')

      parsed = parser.parse('(._$)')
      assert.notStrictEqual(parsed, null)
      assert.strictEqual(parsed.type, 'L')
      assert.strictEqual(parsed.symbol, '._$')
    })

    it('should parse C-instructions', () => {
      const destinations = ['', 'A', 'M', 'D', 'AM', 'AD', 'MD', 'AMD']
      const computes = [
        '0', '1', '-1', 'D', 'A', 'M',
        '!D', '!A', '!M', '-D', '-A', '-M',
        'D+1', 'A+1', 'M+1', 'D-1', 'A-1', 'M-1',
        'D+A', 'D+M', 'D-A', 'D-M', 'A-D', 'M-D',
        'D&A', 'D&M', 'D|A', 'D|M'
      ]
      const jumps = ['', 'JGT', 'JEQ', 'JGE', 'JLT', 'JNE', 'JLE', 'JMP']

      for (const destination of destinations) {
        for (const compute of computes) {
          for (const jump of jumps) {
            const stringToParse = (destination !== '' ? destination + '=' : '') +
              compute +
              (jump !== '' ? ';' + jump : '')
            const parsed = parser.parse(stringToParse)

            assert.notStrictEqual(parsed, null)
            assert.strictEqual(parsed.type, 'C')
            assert.strictEqual(parsed.dest, destination !== '' ? destination : undefined)
            assert.strictEqual(parsed.comp, compute)
            assert.strictEqual(parsed.jump, jump !== '' ? jump : undefined)
          }
        }
      }
    })

    it('should not parse some C-instructions', () => {
      const instructions = [
        '+0', '-0', '+1',
        '1+D', '1+A', '1+M', '-1+D', '-1+A', '-1+M',
        'A+D', 'M+D', '-A+D', '-M+D', '-D+A', '-D+M',
        'A&D', 'M&D', 'M&A', 'A&M', 'A|D', 'M|D', 'M|A', 'A|M'
      ]

      for (const instruction of instructions) {
        assert.throws(() => parser.parse(instruction))
      }
    })
  })
})
