import { IFormatterMetadata, Formatters, RuleFailure } from "tslint";
import { getRelativePath } from "../index";

// Export as Formatter for Tslint's autofind feature
export class Formatter extends Formatters.AbstractFormatter {
    static alwaysShowRuleFailuresAsWarnings = false;

    static metadata: IFormatterMetadata = {
        formatterName: "tsc",
        description: "Lists files containing lint errors.",
        sample: "",
        consumer: "machine"
    };

    format(failures: RuleFailure[]): string {
        return failures.map(this.formatFailure).join("\n");
    }

    formatFailure = (failure: RuleFailure) => {
        const fileName = getRelativePath(failure.getFileName());
        const severity = Formatter.alwaysShowRuleFailuresAsWarnings
            ? "warning"
            : failure.getRuleSeverity().toLocaleLowerCase();
        const start = failure.getStartPosition();
        const lineStart = start.getLineAndCharacter().line + 1;
        const charStart = start.getLineAndCharacter().character + 1;
        const issue = failure.getFailure();

        // Format it as TSC..
        // https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher
        // and use TS2515 because the plugin uses it..
        // See: https://github.com/angelozerr/tslint-language-service/blob/master/src/index.ts#L17
        return `${fileName}(${lineStart},${charStart}): ${severity} TS2515: ${issue} (${failure.getRuleName()})`;
    };
}

export const TscFormatter = Formatter;

// How to run:
// ./node_modules/.bin/tslint -p . -c tslint_.json -s PATH_TO_THIS_DIR/tslint -t tsc
