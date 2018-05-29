// Tsconfig is only allowed for project tslint settings
export type TslintCfg =
    | boolean // Enable tslint? Will search in project specific folder or global tslint file (will search to tslint.json if not provided)
    | string // Rules file
    | TslintCfgObject & {
          // Will search in project specific folder or else in root dir to tsconfig.json if not provided. NOTE: Must be a file name (not a full path).
          tsconfig?: string;
      };

export type TslintCfgObject = {
    // Default value is true
    enabled?: boolean;
    // Default value is false
    autofix?: boolean;
    // Will search in project specific folder or else in root dir to tslint.json if not provided. NOTE: Must be a file name (not a full path).
    rulesFile?: string;
};

export type ProjectConfig =
    | string // Project path (doesn't have to be path/tsconfig.json but is recommended)
    | {
          // Project path (doesn't have to be path/tsconfig.json but is recommended)
          path: string;
          // Do not emit outputs. Default: use tsconfigs option.
          noEmit?: boolean | undefined;
          tslint?: TslintCfg;
          // Path to the executable tsc
          compiler?: string;
      };

// Specific settings win from global settings. Global settings can be seen as default settings for each project.
export type MtscConfig = {
    // Use MTSC Debug for extensive logging of what is happening
    debug?: boolean;
    // Watch project (default value is false)
    watch?: boolean;
    // Do not emit outputs for all projects. Default: use tsconfigs option
    noEmit?: boolean | undefined;
    // Default: false. Options: Enabled | Rulesfile | TslintConfigObject
    tslint?: boolean | string | TslintCfgObject;
    // Same setting as in tslint-language-service (alwaysShowRuleFailuresAsWarnings)
    tslintAlwaysShowAsWarning?: boolean;
    // Default: Path to the executable tsc
    compiler?: string;
    projects: ProjectConfig[];
};
