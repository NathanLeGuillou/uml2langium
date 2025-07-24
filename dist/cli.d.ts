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
export declare function generate(): void;
