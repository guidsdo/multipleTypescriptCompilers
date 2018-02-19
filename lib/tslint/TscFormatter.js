"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslint_1 = require("tslint");
const index_1 = require("../index");
// Export as Formatter for Tslint's autofind feature
class Formatter extends tslint_1.Formatters.AbstractFormatter {
    format(failures) {
        return failures.map(this.formatFailure).join("\n");
    }
    formatFailure(failure) {
        const fileName = index_1.getRelativePath(failure.getFileName());
        const severity = failure.getRuleSeverity().toLocaleUpperCase();
        const start = failure.getStartPosition();
        const lineStart = start.getLineAndCharacter().line + 1;
        const charStart = start.getLineAndCharacter().character + 1;
        const issue = failure.getFailure();
        // Format it as TSC and use TS2515 because the plugin uses it..
        // See: https://github.com/angelozerr/tslint-language-service/blob/master/src/index.ts#L17
        return `${fileName}(${lineStart},${charStart}): ${severity} TS2515: ${issue} (${failure.getRuleName()})`;
    }
}
Formatter.metadata = {
    formatterName: "tsc",
    description: "Lists files containing lint errors.",
    sample: "",
    consumer: "machine"
};
exports.Formatter = Formatter;
exports.TscFormatter = Formatter;
// How to run:
// ./node_modules/.bin/tslint -p . -c tslint_.json -s PATH_TO_THIS_DIR/tslint -t tsc
