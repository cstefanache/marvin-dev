import { ElementHandle } from 'puppeteer';

export interface Config {
  name: string;
  rootUrl: string;
  exitUrl?: string;
  path: string;
  defaultTimeout: number;
  output: string;
  outputPath: string;
  waitFor?: string;
  aliases: Aliases;
  actions: { [key: string]: Action[] };
  discover: string[][];
  sequence: string[];
}

export type KeyValuePair = {
  key: string;
  value: string;
};

export type Aliases = {
  urlReplacers: Replacer[];
  optimizer?: Optimizer;
  action: Alias[];
  input: Alias[];
  info: Alias[];
  iterators?: Alias[];
  store: KeyValuePair[];
};

export type Replacer = {
  regex: string;
  alias: string;
};

export type Optimizer = {
  exclude: Exclude[];
  priority: string[];
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
  identifier?: ElementHandle<Element>;
  elements?: {
    name: string;
    skipOptimizer?: boolean;
    uid?: string;
    selector: string;
  }[];
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
