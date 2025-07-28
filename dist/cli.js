import minimist from 'minimist';
import { converter } from './main.js';
import { existsSync } from 'fs';
import chalk from 'chalk';
/**
 * @function generate
 * @description
 * This function parses command-line arguments and executes the `generate` command.
 * It expects a UML file in XMI format as input (`--input` or `-i`) and a Langium output path (`--output` or `-o`).
 * If the arguments are valid, it calls the `converter` function to generate a Langium file from the provided UML file.
 *
 * @usage
 * ```bash
 * uml-to-langium generate --input path/to/my.uml.uml --output path/to/my.grammar.langium
 * ```
 *
 * @throws
 * - Displays an error message if arguments are missing or invalid.
 * - Displays an error if the specified UML file does not exist.
 * - Displays any error that occurs during the conversion process.
 *
 * @dependencies
 * - minimist: parses command-line arguments
 * - fs.existsSync: checks if the input file exists
 * - chalk: displays colored messages in the terminal
 * - converter: imported function that performs the UML → Langium transformation
 */
export function generate() {
    const args = minimist(process.argv.slice(2));
    const command = args._[0];
    if (command === 'generate') {
        const input = args.input || args.i;
        const output = args.output || args.o;
        if (!input || !output) {
            console.error(chalk.red('Usage: uml-to-langium generate --input <uml.xmi> --output <grammar.langium>'));
            process.exit(1);
        }
        if (!existsSync(input)) {
            console.error(chalk.red(`The file ${input} does not exist.`));
            process.exit(1);
        }
        try {
            converter(input, output);
            console.log(chalk.green(`Langium file successfully generated in "${output}".`));
        }
        catch (e) {
            console.error(chalk.red('Error during generation:', e));
            process.exit(1);
        }
    }
    else {
        console.error(chalk.red('Unknown command. Use "generate".'));
        process.exit(1);
    }
}
//# sourceMappingURL=cli.js.map