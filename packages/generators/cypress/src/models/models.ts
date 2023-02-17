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
  // variables: string[];
  beforeAll: Test[];
  tests: Test[];
};

export type Identifier = {
  key: string;
  value?: string;
  storeName?: string;
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
  selectors: Identifier[];
};

export type Command = {
  file: string;
  method: MethodDefinition;
};

export type MethodDefinition = {
  name: string;
  parameters?: Identifier[];
  hasStore?: boolean;
  body: BodyDefinition[];
};

export type BodyDefinition = {
  element: Identifier;
  action: string;
};
