'use strict'

const assert = require('assert')
const coder = require('../../lib/coder')

describe('coder', function () {
  describe('decimalToBinary', () => {
    it('should expect at least one argument', () => {
      assert.throws(() => coder.decimalToBinary())
    })

    it('should expect positive integer arguments', () => {
      assert.throws(() => coder.decimalToBinary(undefined))
      assert.throws(() => coder.decimalToBinary(null))
      assert.throws(() => coder.decimalToBinary('0'))
      assert.throws(() => coder.decimalToBinary({}))
      assert.throws(() => coder.decimalToBinary([0]))
      assert.throws(() => coder.decimalToBinary(0, -1))
      assert.throws(() => coder.decimalToBinary(0, 0))
      assert.doesNotThrow(() => {
        coder.decimalToBinary(0)
        coder.decimalToBinary(0, 1)
      })
    })

    it('should set default number of bits to 16', () => {
      assert.strictEqual(coder.decimalToBinary(0), '0000000000000000')
    })

    it('should pad number of not filled bits with 0', () => {
      assert.strictEqual(coder.decimalToBinary(0, 1), '0')
      assert.strictEqual(coder.decimalToBinary(0, 8), '00000000')
    })

    it('should convert decimal to binary correctly', () => {
      assert.strictEqual(coder.decimalToBinary(1, 2), '01')
      assert.strictEqual(coder.decimalToBinary(2, 2), '10')
      assert.strictEqual(coder.decimalToBinary(3, 2), '11')
      assert.strictEqual(coder.decimalToBinary(1234567890, 32), '01001001100101100000001011010010')
    })
  })

  describe('encode', () => {
    it('should encode symbols', () => {
      const code = coder.encode([{
        type: 'A',
        symbol: 4
      }])

      assert.deepEqual(code, ['0000000000000100'])
    })

    it('should encode destinations', () => {
      const destinations = [undefined, 'M', 'D', 'MD', 'A', 'AM', 'AD', 'AMD']
      const expected = ['000', '001', '010', '011', '100', '101', '110', '111']

      for (let i = 0; i < destinations.length; i++) {
        const code = coder.encode([{
          type: 'C',
          dest: destinations[i],
          comp: '0'
        }])
        assert.deepEqual(code, ['111' + '0' + '101010' + expected[i] + '000'])
      }
    })

    it('should encode computes', () => {
      const computes = [
        '0', '1', '-1', 'D', 'A', 'M',
        '!D', '!A', '!M', '-D', '-A', '-M',
        'D+1', 'A+1', 'M+1', 'D-1', 'A-1', 'M-1',
        'D+A', 'D+M', 'D-A', 'D-M', 'A-D', 'M-D',
        'D&A', 'D&M', 'D|A', 'D|M'
      ]
      const expected = [
        '0101010', '0111111', '0111010', '0001100', '0110000', '1110000',
        '0001101', '0110001', '1110001', '0001111', '0110011', '1110011',
        '0011111', '0110111', '1110111', '0001110', '0110010', '1110010',
        '0000010', '1000010', '0010011', '1010011', '0000111', '1000111',
        '0000000', '1000000', '0010101', '1010101'
      ]

      for (let i = 0; i < computes.length; i++) {
        const code = coder.encode([{
          type: 'C',
          comp: computes[i]
        }])
        assert.deepEqual(code, ['111' + expected[i] + '000' + '000'])
      }
    })

    it('should encode jumps', () => {
      const jumps = [undefined, 'JGT', 'JEQ', 'JGE', 'JLT', 'JNE', 'JLE', 'JMP']
      const expected = ['000', '001', '010', '011', '100', '101', '110', '111']

      for (let i = 0; i < jumps.length; i++) {
        const code = coder.encode([{
          type: 'C',
          jump: jumps[i],
          comp: '0'
        }])
        assert.deepEqual(code, ['111' + '0' + '101010' + '000' + expected[i]])
      }
    })
  })
})
