import {ElementHandle} from 'puppeteer';

export type DiscoveryResult = IdentifiableElement & {
    actions: IdentifiableElement[];
    input: IdentifiableElement[];
};

export type IdentifiableElement = {
    text?: string;
    locator?: string;
    details?: string | null;
    type?: string | null;
    el?: ElementHandle<Element>;
};

export type PageDiscoveryResult = {
    items: DiscoveryResult;
    groups: DiscoveryResult[];
};
