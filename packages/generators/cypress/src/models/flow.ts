export type NewFlowModel = {
  functionalities: Functionality[];
  selectors: Selector[];
  commands: Command[];
};

export type Functionality = {
  group: string; // the name of each grouping node from the flow.json file
  specs: Spec[]; // a spec per each branch from the grouping node
};

export type Spec = {
  file: string; // a file name generated from each branch from the flow -> grouping node + sequenceSteps???
  variables: KeyValuePair[]; // (param values) per each store type, from a specific branch (spec)
  tests: Test[]; // (sequenceStep, method) from the graph
};

export type KeyValuePair = {
  key: string;
  value: string;
};

export type Test = {
  //from the graph
  name: string; //sequenceStep
  method: MethodExecution;
};

export type MethodExecution = {
  name: string; // the name from the graph method
  paramValues?: string[]; // the values for the params (from the graph from)
};

export type Selector = {
  file: string; // a file name generated for each grouping node from the flow.json
  identifier: KeyValuePair[]; // each (locator, details) from each branch from the grouping node
};

export type Command = {
  file: string; // a file name generated for each grouping node from the flow.json
  method: MethodDefinition;
};

export type MethodDefinition = {
  name: string; //the method name from each action
  parameters?: string[]; //each detail from the action/sequence that has type = cleareAndFill
  body: BodyDefinition[];
};

export type BodyDefinition = {
  locator: string; //pair (locator, action) from each action from each method from the flow - action[]
  action: string;
};
