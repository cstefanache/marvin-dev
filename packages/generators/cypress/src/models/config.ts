export type NewConfigModel = {
  projectName: string; //name from the rawConfig
  baseUrl: string; // rootUrl from the rawConfig,
  inputPath: string; // path from the rawConfig
  outputPath: string; // where tests are generated
  iterators: Iterator[];
  env: KeyValuePair[];
  specsFolder: string;
  selectorsFolder: string;
  commandsFolder: string;
};

export type Iterator = {
  name: string;
  parents: string[]; //selectors from the iterators raw config
  identifier: string;
  siblings: string[]; // elements from the iterators raw config (only the selectors)
};

export type KeyValuePair = {
  key: string;
  value: string;
};
