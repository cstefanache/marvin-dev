import { ElementHandle, KeyInput } from 'puppeteer';

export type IdentifiableElement = {
  text?: string;
  locator?: string;
  details?: string | null;
  base64Image?: string;
  type?: string | null;
  el?: ElementHandle<Element>;
  identifier?: ElementHandle<Element> | string;
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
  methodUid?: string;
  sequenceStep: string;
  parameters?: { [key: string]: string };
  children: ActionItem[];
  exitUrl?: string;
  fullUrl?: string;
  forEach?: string;
  postDelay?: number;
  condition?: string;
};

export type Sequence = {
  type: string;
  uid: string;
  op?: string;
  process?: string;
  isNumber?: boolean;
  press?: KeyInput;
  store?: boolean;
  storeName?: string;
  locator: string;
  iterator?: IdentifiableIterator;
};

export type IdentifiableIterator = {
  name: string;
  identifier: string;
  uid: string;
};

export type Actions = {
  method: string;
  uid: string;
  methodUid: string;
  sequence: Sequence[];
  path: string;
  isGlobal?: boolean;
};

export type FlowModel = {
  graph: ActionItem[];
  actions: Actions[];
};
