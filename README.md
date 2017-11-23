# Multiple Typescript Compilers
_Run multiple typescript compilers concurrently at the same time. Usage: `mtsc [directories/tsconfigs...]` Example: `mtsc client server middleware/new_tsconfig.json`_

## Usage
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

## Options
```
-d, --debug
-w, --watch                   Watch the given projects (default false)
-c, --compiler [path_to_tsc]  Path to compiler for all projects (will search in exec dir if not given)
-h, --help                    output usage information
```

## Vscode tasks json example
```json
{
  "version": "2.0.0",
  "tasks": [
      {
          "label": "typescript",
          "type": "shell",
          "command": "./node_modules/.bin/mtsc",
          "windows": {
            "command": ".\\node_modules\\.bin\\mtsc"
          },
          "args": [
            "-w",
            "${workspaceRoot}/projectA",
            "${workspaceRoot}/scripts/projectB",
            "${workspaceRoot}/projectC/tsconfig.json"
          ],
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

## Roadmap
* Add json config option
* ~~Use vscode tasks 2.0 in example~~
* Add tslint option for each project(!)
* Specify specific options per project

---

<center>
<img src="https://www.mendix.com/ui/images/mendix-logo.png" align="center" width="200"/>

__Mtsc is proudly used for development at [Mendix](https://www.mendix.com)__
</center>
