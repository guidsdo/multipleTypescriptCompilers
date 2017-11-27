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
  -c, --config [path_to_config]  Path to mtsc config
  -w, --watch                    Watch the given projects (default false)
  -t, --tsc [path_to_tsc]        Path to compiler for all projects (will search in exec dir if not given)
  -h, --help                     output usage information
```

## mtsc.json spec
```typescript
export type ProjectConfig =
    | string
    | {
          path: string;
          watch?: boolean;
          compiler?: string;
      };

export type MtscConfig = {
    debug?: boolean;
    watch?: boolean;
    compiler?: string;
    projects: ProjectConfig[];
};
```

## Vscode tasks json examples
### Example using cli only
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

### Example using CLI + config
`tasks.json`
```json
{
  "version": "2.0.0",
  "tasks": [
      {
          "label": "Typescript watch",
          "command": "./node_modules/.bin/mtsc",
          "windows": {
            "command": ".\\node_modules\\.bin\\mtsc"
          },
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
    "projects": [
        "projectA",
        "scripts/projectB",
        "projectC/tsconfig.json"
    ]
}
```

## Roadmap
* ~~Add json config option~~
* ~~Use vscode tasks 2.0 in example~~
* Add tslint option for each project(!)
* ~~Specify specific options per project~~

---

<center>
<img src="https://www.mendix.com/ui/images/mendix-logo.png" align="center" width="200"/>

__Mtsc is proudly used for development at [Mendix](https://www.mendix.com)__
</center>
