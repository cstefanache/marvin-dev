import {ElementHandle} from 'puppeteer';

export type IdentifiableElement = {
    text?: string;
    locator?: string;
    details?: string | null;
    type?: string | null;
    el?: ElementHandle<Element>;
};

export type DiscoveryResult = IdentifiableElement & {
    info: IdentifiableElement[];
    input: IdentifiableElement[];
    actions: IdentifiableElement[];
};

export type PageDiscoveryResult = {
    items?: DiscoveryResult;
    groups?: DiscoveryResult[];
    actions?: DiscoveryResult[];
};
