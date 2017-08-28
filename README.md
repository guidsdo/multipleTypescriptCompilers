# Multiple Typescript Compilers
Run multiple typescript compilers concurrent at the same time. Usage: `mtsc <tsc compiler> [directories...]` Example: `mtsc node_modules/.bin/tsc client server middleware`

## Usage
### Cli:
`mtsc <tsc compiler> [directories...]`

### Example:
`./node_modules/.bin/mtsc node_modules/.bin/tsc client scripts/ide.tsconfig.json special/location`

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
