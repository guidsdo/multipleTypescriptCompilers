# Multiple Typescript Compilers <img src="https://github.com/guidojo/multipleTypescriptCompilers/blob/master/images/mtsc_logo_small.png?raw=true" align="right" width="200"/>

_Monorepo solution for multiple typescript projects. Watch multiple typescript compilers concurrently at the same time, without losing output!_

## Usage

**NOTE: Supported versions: Typescript 2.8+. Use Mtsc 1.\* for older versions**

### Cli:

`mtsc [directories/tsconfigs...]`

### Examples:

`./node_modules/.bin/mtsc client scripts/ide.tsconfig.json special/location`

`mtsc client scripts/ide.tsconfig.json special/location -w`

`mtsc -c client/tsconfig.json scripts/ide.tsconfig.json -w`

`mtsc -c node_modules/.bin/tsc client/tsconfig.json scripts/ide.tsconfig.json -w`

## Why?

I began this project because vscode can't handle the output of multiple typescript projects. If you have multiple projects watched at the same time, only the output of the last compilation will be considered and the other errors of other projects are hidden. This has to do, with the problem matcher vscode uses, explained here: https://code.visualstudio.com/docs/editor/tasks-v1#_background-watching-tasks

### How it was fixed:

This always prints the compilation output of the other projects when a new compilation is done. It also makes sure that the interpreter knows there is still a compilation going on by printing a compilation start message when there is still one running.

### Known issues

This package has a peerdependency on tslint. The tool allows you to not use tslint, but will fail if tslint cannot be found. Currently nobody has complained about it (or anything for that matter) so it won't be fixed. Most serious typescript projects have tslint anyway.

## Cli

```
  Usage: mtsc [options] [projects/tsconfigs...]

  Options:
    -d, --debug                       Add way too much logging
    -c, --config [path_to_config]     Path to mtsc config
    -w, --watch                       Watch the given projects (default false)
    -t, --tsc [path_to_tsc]           Path to compiler for all projects (will search in exec dir if not given)
    -l, --lint [path_to_tslintrules]  Path to tslint rules for all projects (will search if not given)
    --noEmit                          Do not emit outputs
    --tslintAlwaysShowAsWarning       Always show tslint output as warning
    -h, --help                        output usage information
```

## mtsc.json spec

[Spec copied from here](https://github.com/guidojo/multipleTypescriptCompilers/blob/master/src/config/configSpec.ts)

```typescript
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
    // watch?: boolean; <-- always true for now
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
```

### For tslint support, see this guide: https://github.com/angelozerr/tslint-language-service

NOTE: Don't forget to set the typescript compiler in vscode (it's in the guide).

```typescript
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
```

## Vscode tasks json examples

### Example using cli only

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "shell",
            "label": "Mtsc",
            "command": "./node_modules/.bin/mtsc -w projectA scripts/projectB projectC/tsconfig.json",
            "isBackground": true,
            "problemMatcher": "$tsc-watch",
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

### Example using CLI + config

`tasks.json`

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "shell",
            "label": "Mtsc",
            "command": "./node_modules/.bin/mtsc",
            "isBackground": true,
            "problemMatcher": "$tsc-watch",
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

`mtsc.json` (will be autodetected)

```json
{
    "debug": false,
    "watch": true,
    "projects": ["projectA", "scripts/projectB", "projectC/tsconfig.json"]
}
```

## Roadmap

-   Allow directories to be ignored, because tslint doesn't always pick them up unfortunately.
-   Any ideas? Let me know :)

---

<center>
<img src="https://www.mendix.com/ui/images/mendix-logo.png" align="center" width="200"/>

**Mtsc is proudly used for development at [Mendix](https://www.mendix.com)**

</center>
