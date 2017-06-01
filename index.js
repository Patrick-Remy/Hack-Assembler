'use strict'

const chalk = require('chalk')

const Assembler = require('./lib/assembler')

for (let i = 2; i < process.argv.length; i++) {
  const file = process.argv[i];

  (async () => {
    try {
      process.stdout.write(chalk.green('Compiling...\n'))
      await Assembler.assembleFile(file)
      process.stdout.write(chalk.green(`Successfully compiled ${file}.\n`))
    } catch (exception) {
      process.stdout.write(chalk.red('An error occured:\n'))
      process.stdout.write(exception)
    }
  })()
}
