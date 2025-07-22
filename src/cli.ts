import minimist from 'minimist'
import { converter } from './main.js'
import { existsSync } from 'fs'
import chalk from 'chalk'

const args = minimist(process.argv.slice(2))
const command = args._[0]

switch (command) {
    case 'generate': {
        const input = args.input || args.i
        const output = args.output || args.o

        if (!input || !output) {
            console.error(chalk.red(' Usage: generate --input <uml.xmi> --output <grammar.langium>'))
            process.exit(1)
        }

        if (!existsSync(input)) {
            console.error(chalk.red(` Le fichier ${input} n'existe pas.`))
            process.exit(1)
        }

        try {
            converter(input, output)
            console.log(chalk.green(`Fichier Langium généré avec succès dans "${output}".`))
        } catch (e) {
            console.error(chalk.red(`Erreur lors de la génération :`, e))
            process.exit(1)
        }
        break
    }

    case 'help':
    default:
        console.log(`Usage :
  uml-to-langium generate --input <uml.xmi> --output <grammar.langium>
  uml-to-langium help`)
        break
}