import { Linter, Configuration } from "tslint";
import { Formatter } from "./TscFormatter";

const configurationFilename = "tslint.json";
const options = {
    fix: false,
    formatter: Formatter
};

const program = Linter.createProgram("tsconfig.json");
const linter = new Linter(options, program);

export function lintFiles() {
    const files = Linter.getFileNames(program);
    const configuration = Configuration.findConfiguration(configurationFilename).results;

    files.forEach(file => {
        const fileContents = program.getSourceFile(file)!.getFullText();
        linter.lint(file, fileContents, configuration);
    });

    return linter.getResult();
}

console.log(lintFiles().output);
