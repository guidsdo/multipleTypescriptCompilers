# Multiple Typescript Compilers
_Run multiple typescript compilers concurrently at the same time. Usage: `mtsc <tsc compiler> [directories...]` Example: `mtsc node_modules/.bin/tsc client server middleware`_

## Usage
### Cli:
`mtsc <tsc compiler> [directories...]`

### Example:
`./node_modules/.bin/mtsc node_modules/.bin/tsc client scripts/ide.tsconfig.json special/location`

## Why?
I began this project because vscode couldn't handle the output of multiple typescript project. If you have multiple projects watched at the same time, only the output of the last compilation will be considered and the other errors of other projects are hidden. This has to do, with the problem matcher vscode uses, explained here: https://code.visualstudio.com/docs/editor/tasks-v1#_background-watching-tasks

### How it was fixed:
This always prints the compilation output of the other projects when a new compilation is done. It also makes sure that the interpreter knows there is still a compilation going on by printing a compilation start message when there is still one running.

## Options
`-d` for debug mode

`--help` for help

## Vscode tasks json example
```json
{
  "version": "0.1.0",
  "tasks": [
    {
      "taskName": "Watch all",
      "command": "./node_modules/.bin/mtsc",
       "windows": {
        "command": ".\\node_modules\\.bin\\mtsc"
      },
      "isBuildCommand": true,
      "isShellCommand": true,
      "args": [
        "${workspaceRoot}/node_modules/.bin/tsc",
        "${workspaceRoot}/itest",
        "${workspaceRoot}/scripts/ts-scripts",
        "${workspaceRoot}/webModeler/server",
        "${workspaceRoot}/webModeler/client"
      ],
      "showOutput": "silent",
      "isBackground": true,
      "problemMatcher": "$tsc-watch"
    }
  ]
}
```

---



<center>
<img src="https://www.mendix.com/styleguide/img/logo-mendix.png" align="center" width="200"/>

__Mtsc is proudly used for development at [Mendix](https://www.mendix.com)__
</center>
