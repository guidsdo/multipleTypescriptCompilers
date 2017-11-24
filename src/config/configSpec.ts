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
