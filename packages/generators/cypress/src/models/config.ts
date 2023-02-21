export type ConfigModel = {
  projectName: string;
  baseUrl: string;
  inputPath: string;
  outputPath: string;
  iterators: Iterator[];
  env: KeyValuePair[];
  specsFolder: string;
  selectorsFolder: string;
  commandsFolder: string;
};

export type Iterator = {
  name: string;
  parent: string;
  identifier: string;
  siblings: string[];
};

export type KeyValuePair = {
  key: string;
  value: string;
};
