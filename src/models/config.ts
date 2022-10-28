export interface Config {
    path: string;
    url: string;
    waitFor: string;
    aliases: Aliases;
}

export type Aliases = {
    group: Alias[];
    action: Alias[];
    input: Alias[];
};

export type Alias = {
    name?: string;
    selectors: string[];
};
