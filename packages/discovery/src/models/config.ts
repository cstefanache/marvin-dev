import { exitCode } from 'process';

export interface Config {
  path: string;
  defaultTimeout: number;
  
  output: string;
  rootUrl: string;
  waitFor: string;
  aliases: Aliases;
  actions: { [key: string]: Action[] };
  discover: string[][];
  sequence: string[];
}

export type Aliases = {
  urlReplacers: Replacer[];
  optimizer?: Optimizer;
  action: Alias[];
  input: Alias[];
  info: Alias[];
  iterators?: Alias[];
};

export type Replacer = {
  regex: string;
  alias: string;
};

export type Optimizer = {
  exclude: Exclude[];
  priority: string[]
};

export type Exclude = {
  type: string;
  name?: string;
  regex?: string[];
  value?: string[];
};

export type Alias = {
  name?: string;
  uid?: string;
  skipOptimizer?: boolean;
  selectors: string[];
  identifiers?: { name: string; skipOptimizer?: boolean; uid?: string, selector: string }[];
};

export type Action = {
  name: string;
  sequence: Sequence[];
};

export type Sequence = {
  type: string;
  locator: string;
  value: string;
};
