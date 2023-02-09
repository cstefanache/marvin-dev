import { ElementHandle } from 'puppeteer';

export type IdentifiableElement = {
  text?: string;
  locator?: string;
  details?: string | null;
  type?: string | null;
  el?: ElementHandle<Element>;
  identifier?: ElementHandle<Element>;
  elements?: IdentifiableElement[];
  iteratorName?: string;
};

export type DiscoveryResult = IdentifiableElement & {
  [index: string]: any;
  info: IdentifiableElement[];
  input: IdentifiableElement[];
  actions: IdentifiableElement[];
  iterable: IdentifiableElement[];
};

export type PageDiscoveryResult = {
  items?: DiscoveryResult;
  groups?: DiscoveryResult[];
  actions?: DiscoveryResult[];
};

export type Discovered = {
  [key: string]: PageDiscoveryResult;
};

export type Output = {
  discovered: Discovered;
};

export type ActionItem = {
  url: string;
  id: string;
  loop?: number;
  methodLoop?: number;
  method?: string;
  sequenceStep: string;
  parameters?: { [key: string]: string };
  children: ActionItem[];
  exitUrl?: string;
};

export type Sequence = {
  type: string;
  uid: string;
  locator: string;
};

export type IdentifiableIterator = {
  name: string;
  identifier: string;
  uid: string;
};

export type Actions = {
  method: string;
  iterator?: IdentifiableIterator;
  sequence: Sequence[];
};

export type FlowModel = {
  graph: ActionItem[];
  actions: { [key: string]: Actions[] };
};
