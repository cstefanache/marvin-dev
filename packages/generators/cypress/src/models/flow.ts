export type NewFlowModel = {
  functionalities: Functionality[];
  selectors: Selector[];
  commands: Command[];
};

export type Functionality = {
  group: string;
  specs: Spec[];
};

export type Spec = {
  file: string;
  variables: string[];
  beforeAll: Test[];
  tests: Test[];
};

export type KeyValuePair = {
  key: string;
  value: string;
};

export type Test = {
  name: string;
  method: MethodExecution;
};

export type MethodExecution = {
  name: string;
  paramValues?: string[];
};

export type Selector = {
  file: string;
  identifier: KeyValuePair[];
};

export type Command = {
  file: string;
  method: MethodDefinition;
};

export type MethodDefinition = {
  name: string;
  parameters?: string[];
  body: BodyDefinition[];
};

export type BodyDefinition = {
  locator: string;
  action: string;
};
