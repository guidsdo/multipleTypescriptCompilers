# Multiple Typescript Compilers <img src="https://github.com/guidojo/multipleTypescriptCompilers/blob/master/images/mtsc_logo_small.png?raw=true" align="right" width="200"/>

_Monorepo solution for multiple typescript projects. Watch multiple typescript compilers concurrently at the same time, without losing output!_

[![Build Status](https://travis-ci.org/guidsdo/multipleTypescriptCompilers.svg?branch=master)](https://travis-ci.org/guidojo/multipleTypescriptCompilers)
[![Coverage Status](https://coveralls.io/repos/github/guidsdo/multipleTypescriptCompilers/badge.svg?branch=master)](https://coveralls.io/github/guidojo/multipleTypescriptCompilers?branch=master)
[![dependencies Status](https://copilot.blackducksoftware.com/github/repos/guidsdo/multipleTypescriptCompilers/branches/master/badge-risk.svg)](https://copilot.blackducksoftware.com/github/repos/guidojo/multipleTypescriptCompilers/branches/master)
[![dependencies Status](https://david-dm.org/guidsdo/multipleTypescriptCompilers/status.svg)](https://david-dm.org/guidojo/multipleTypescriptCompilers)

[![npm version](https://img.shields.io/npm/v/mtsc.svg?colorB=cb3837)](https://www.npmjs.com/package/mtsc)
[![download](https://img.shields.io/npm/dw/mtsc.svg?colorB=cb3837)](https://www.npmjs.com/package/mtsc)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

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

[Config spec can be seen here](https://github.com/guidojo/multipleTypescriptCompilers/blob/master/src/config/configSpec.ts)


## Vscode integration
Set the typescript compiler in vscode by clicking on the compiler version. This is only possible when you open a typescript file. This setting sometimes goes to the builtin vscode compiler, so if you don't see errors; check this first.  
<img src="https://github.com/guidojo/multipleTypescriptCompilers/blob/master/images/ts_switcher.png?raw=true"/>  
  
## Tslint support
Install the right plugin and follow the README: https://github.com/Microsoft/typescript-tslint-plugin

[Tslint section of config spec here](https://github.com/guidojo/multipleTypescriptCompilers/blob/master/src/config/configSpec.ts)

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
            },
            "runOptions": {
                "runOn": "folderOpen"
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
            },
            "runOptions": {
                "runOn": "folderOpen"
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
