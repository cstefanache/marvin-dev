import {ElementHandle} from 'puppeteer';

export type IdentifiableElement = {
    text?: string;
    locator?: string;
    details?: string | null;
    type?: string | null;
    el?: ElementHandle<Element>;
};

export type DiscoveryResult = IdentifiableElement & {
    [index: string]: any;
    info: IdentifiableElement[];
    input: IdentifiableElement[];
    actions: IdentifiableElement[];
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
    method: string;
    sequence_step: string;
    parameters: {[key: string]: string};
    children: ActionItem[];
};

export type Sequence = {
    type: string;
    locator: string;
};

export type Actions = {
    method: string;
    itemRoot: string;
    sequence: Sequence[];
};

export type FlowModel = {
    graph: ActionItem[];
    actions: {[key: string]: Actions[]};
};
