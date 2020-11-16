# Multiple Typescript Compilers <img src="https://github.com/guidsdo/multipleTypescriptCompilers/blob/master/images/mtsc_logo_small.png?raw=true" align="right" width="200"/>

_Monorepo solution for multiple typescript projects. Watch multiple typescript compilers concurrently at the same time, without losing output!_

[![Build Status](https://travis-ci.org/guidsdo/multipleTypescriptCompilers.svg?branch=master)](https://travis-ci.org/guidsdo/multipleTypescriptCompilers)
[![Coverage Status](https://coveralls.io/repos/github/guidsdo/multipleTypescriptCompilers/badge.svg?branch=master)](https://coveralls.io/github/guidsdo/multipleTypescriptCompilers?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/guidsdo/multipleTypescriptCompilers/badge.svg)](https://snyk.io/test/github/guidsdo/multipleTypescriptCompilers)
[![dependencies Status](https://david-dm.org/guidsdo/multipleTypescriptCompilers/status.svg)](https://david-dm.org/guidsdo/multipleTypescriptCompilers)

[![npm version](https://img.shields.io/npm/v/mtsc.svg?colorB=cb3837)](https://www.npmjs.com/package/mtsc)
[![download](https://img.shields.io/npm/dw/mtsc.svg?colorB=cb3837)](https://www.npmjs.com/package/mtsc)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Update 18-november-2020
Currently this library is in the process of removing tslint support. For some reasons, tslint is deprecated and this means that you will have to move to eslint for linting. I haven't found a good upgrade path for mono-repositories yet. When one is found, I'll update Mtsc with it. The whole goal of Mtsc is to integrate into vscode (since it has terrible multi-project support). Vscode team 'fixed' this partly with workspaces, but in practise this isn't a full fix and it also makes your dev environment feels like a complete mess.

The vision and goal for Mtsc is, and always has been, the following:
- Be able to lint and ts-compile multiple projects, concurrently whilst keeping all the results (not possible with just `concurrently`)
- Facilitate proper vscode integration which means:
    - See lint and tsc result without having to open a specific file
    - Require the least amount of necessary configurability
- Support mono-repo's natively
- Support the following workflow:
    1. Clone a project
    1. `yarn`
    1. `code .`
    1. `cmd+shift+b`
    1. See what's happening in your whole monorepo and be able to work at the same time (watchmode). :mindblown:

To be honest, I'm not optimistic because it seems that I will have to do a lot of work to make this work for ts-eslint (which itself already feels like a hack). But hey, on the other hand; I love diving in this kind of stuff.  
**For now, please use the latest version with the `-no-tslint` tag.**

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

[Config spec can be seen here](https://github.com/guidsdo/multipleTypescriptCompilers/blob/master/src/config/configSpec.ts)


## Vscode integration
Set the typescript compiler in vscode by clicking on the compiler version. This is only possible when you open a typescript file. This setting sometimes goes to the builtin vscode compiler, so if you don't see errors; check this first.  
<img src="https://github.com/guidsdo/multipleTypescriptCompilers/blob/master/images/ts_switcher.png?raw=true"/>  
  
## Tslint support
Install the right plugin and follow the README: https://github.com/Microsoft/typescript-tslint-plugin

[Tslint section of config spec here](https://github.com/guidsdo/multipleTypescriptCompilers/blob/master/src/config/configSpec.ts)

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
