export interface Config {
    path: string;
    output: string;
    url: string;
    waitFor: string;
    aliases: Aliases;
    actions: {[key: string]: Action[]};
    discover: string[][];
}

export type Aliases = {
    group: Alias[];
    action: Alias[];
    input: Alias[];
    info: Alias[];
};

export type Alias = {
    name?: string;
    selectors: string[];
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
