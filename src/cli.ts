import minimist from 'minimist';
import { converter } from './main.js';
import { existsSync } from 'fs';
import chalk from 'chalk';

/**
 * @function generate
 * @description
 * Cette fonction analyse les arguments de ligne de commande et exécute la commande `generate`.
 * Elle attend en entrée un fichier UML au format XMI (`--input` ou `-i`) et un chemin de sortie Langium (`--output` ou `-o`).
 * Si les arguments sont valides, elle appelle la fonction `converter` pour générer un fichier Langium à partir du fichier UML fourni.
 *
 * @usage
 * ```bash
 * uml-to-langium generate --input chemin/vers/mon.uml.xmi --output chemin/vers/ma.grammar.langium
 * ```
 *
 * @throws
 * - Affiche un message d'erreur si les arguments sont manquants ou invalides.
 * - Affiche une erreur si le fichier UML spécifié n'existe pas.
 * - Affiche toute erreur survenue pendant l'exécution de la conversion.
 *
 * @dependencies
 * - minimist : pour parser les arguments de la ligne de commande
 * - fs.existsSync : pour vérifier l'existence du fichier d'entrée
 * - chalk : pour afficher des messages colorés dans le terminal
 * - converter : fonction d'import qui réalise la transformation UML → Langium
 */

export function generate():void {
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
      console.error(chalk.red(`Le fichier ${input} n'existe pas.`));
      process.exit(1);
    }

    try {
      converter(input, output);
      console.log(chalk.green(`Fichier Langium généré avec succès dans "${output}".`));
    } catch (e) {
      console.error(chalk.red('Erreur lors de la génération :', e));
      process.exit(1);
    }
  } else {
    console.error(chalk.red('Commande inconnue. Utilisez "generate"'));
    process.exit(1);
  }
}
