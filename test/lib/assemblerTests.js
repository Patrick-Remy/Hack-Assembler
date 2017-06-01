'use strict'

const assert = require('assert')
const isolated = require('isolated')
const fs = require('fs')
const path = require('path')

const assembler = require('../../lib/assembler')

describe('assembler', function () {
  describe('assemble', () => {
    it('should throw an error if argument is not a string', () => {
      assert.throws(() => assembler.assemble())
      assert.throws(() => assembler.assemble(undefined))
      assert.throws(() => assembler.assemble(null))
      assert.throws(() => assembler.assemble(true))
      assert.throws(() => assembler.assemble({}))
      assert.throws(() => assembler.assemble([]))
      assert.throws(() => assembler.assemble(42))
      assert.doesNotThrow(() => assembler.assemble('@0'))
    })

    it('should assemble correctly', () => {
      assert.strictEqual(assembler.assemble('@1'), '0000000000000001\n')
      assert.strictEqual(
        assembler.assemble('@1\n@2\n'),
        '0000000000000001\n0000000000000010\n')
    })
  })

  describe('assembleFile', () => {
    it('should throw an error, if file does not exist', (done) => {
      isolated(async (err, directory) => {
        assert.strictEqual(err, null)

        try {
          await assembler.assembleFile('not-existing-file.asm')
          done()
        } catch (exception) {
          assert.notEqual(exception, null)
          done()
        }
      })
    })

    it('should assemble test-files correctly', (done) => {
      const dataFolder = path.join(__dirname, '..', 'data')
      const files = [
        path.join(dataFolder, 'add/Add.asm'),
        path.join(dataFolder, 'max/MaxL.asm'),
        path.join(dataFolder, 'max/Max.asm'),
        path.join(dataFolder, 'rect/RectL.asm'),
        path.join(dataFolder, 'rect/Rect.asm'),
        path.join(dataFolder, 'pong/PongL.asm'),
        path.join(dataFolder, 'pong/Pong.asm')
      ]

      const doneFile = () => {
        if (this.filesCount === undefined) this.filesCount = files.length - 1
        else if (--this.filesCount === 0) done()
      }

      for (const file of files) {
        const fileBasename = path.basename(file)
        const compareBasename = path.basename(file, path.extname(file)) + '.cmp.hack'
        const outputBasename = path.basename(file, path.extname(file)) + '.hack'

        isolated({
          files: [
            file,
            path.format({
              dir: path.dirname(file),
              base: compareBasename
            })
          ]
        }, async (err, directory) => {
          assert.strictEqual(err, null)

          try {
            await assembler.assembleFile(path.join(directory, fileBasename), 'utf8')
            const output = fs.readFileSync(path.join(directory, outputBasename), 'utf8')
            const compare = fs.readFileSync(path.join(directory, compareBasename), 'utf8')
            assert.equal(output, compare)
            doneFile()
          } catch (exception) {
            doneFile()
          }
        })
      }
    })
  })
})
