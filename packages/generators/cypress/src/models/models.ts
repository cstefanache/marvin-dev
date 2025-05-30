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

export type StoreValue = {
  key: string;
  value?: string;
};

export type Identifier = {
  key: string;
  value?: string;
  storeName?: string;
  process?: string;
  iterator?: Iterator;
};

export type Iterator = {
  name: string;
  identifier: string;
};

export type Test = {
  name: string;
  store?: StoreValue[];
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
  methods: MethodDefinition[];
};

export type MethodDefinition = {
  name: string;
  parameters?: Identifier[];
  // hasIterator?: boolean;
  hasStore?: boolean;
  body: BodyDefinition[];
};

export type BodyDefinition = {
  element: Identifier;
  // iteratorName?: string;
  // iteratorLocator?: string;
  action: string;
  op?: string;
  isNumber?: boolean;
};
