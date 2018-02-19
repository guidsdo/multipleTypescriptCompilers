"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslint_1 = require("tslint");
const TscFormatter_1 = require("./TscFormatter");
const configurationFilename = "tslint.json";
const options = {
    fix: false,
    formatter: TscFormatter_1.Formatter
};
const program = tslint_1.Linter.createProgram("tsconfig.json");
const linter = new tslint_1.Linter(options, program);
function lintFiles() {
    const files = tslint_1.Linter.getFileNames(program);
    const configuration = tslint_1.Configuration.findConfiguration(configurationFilename).results;
    files.forEach(file => {
        const fileContents = program.getSourceFile(file).getFullText();
        linter.lint(file, fileContents, configuration);
    });
    return linter.getResult();
}
exports.lintFiles = lintFiles;
console.log(lintFiles().output);
