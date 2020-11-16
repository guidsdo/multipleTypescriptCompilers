export type ProjectConfig =
    | string // Project path (doesn't have to be path/tsconfig.json but is recommended)
    | {
          // Project path (doesn't have to be path/tsconfig.json but is recommended)
          path: string;
          // Do not emit outputs. Default: use tsconfigs option.
          noEmit?: boolean | undefined;
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
    // Default: Path to the executable tsc
    compiler?: string;
    projects: ProjectConfig[];
    // Use yarn workspace directories for projects. You won't be able to have specific project settings this way
    useYarnWorkspaces?: boolean;
};
