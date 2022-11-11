import {ElementHandle, Page} from 'puppeteer';
import {Aliases, Config} from './models/config';
import {
    DiscoveryResult,
    IdentifiableElement,
    PageDiscoveryResult,
} from './models/models';
import {log} from './utils/logger';

const defaultAliases = {
    info: [
        // {
        //     name: 'headers',
        //     selectors: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        // },
    ],
    group: [],
    action: [
        {
            selectors: ['button', 'a'],
        },
    ],
    input: [
        {
            selectors: ['input'],
        },
    ],
};

export default class Discovery {
    private aliases: Aliases;

    constructor(private readonly config: Config) {
        this.aliases = {
            info: [...defaultAliases.info, ...(config.aliases?.info || [])],
            group: [...defaultAliases.group, ...(config.aliases?.group || [])],
            action: [
                ...defaultAliases.action,
                ...(config.aliases?.action || []),
            ],
            input: [...defaultAliases.input, ...(config.aliases?.input || [])],
        };
    }

    async getLocator(element: ElementHandle<Element>): Promise<string> {
        const tag = await element.evaluate(el => el.tagName);
        const id = await element.evaluate(el => el.id);
        const classes = Object.values(
            await element.evaluate(el => el.classList)
        );
        const text = await element.evaluate(el => el.textContent);

        let locator = tag.toLowerCase();

        if (id) {
            locator += `#${id}`;
        }

        if (classes.length) {
            locator += `.${classes.join('.')}`;
        }
        if (tag.toLowerCase() === 'input') {
            const type = await element.evaluate(el => el.getAttribute('type'));
            if (type) {
                locator += `[type=${type}]`;
            }
        }

        return locator;
    }

    async discoverGroup(
        element: ElementHandle<Element> | Page
    ): Promise<DiscoveryResult> {
        log('Capturing inputs ...');
        const info: IdentifiableElement[] = [];
        const input: IdentifiableElement[] = [];
        const actions: IdentifiableElement[] = [];

        for (const infoSelector of this.aliases.info) {
            const elements = await element.$$(
                infoSelector.selectors.join(', ')
            );

            for (const element of elements) {
                const text = (await element.evaluate(
                    el => el.textContent
                )) as string;
                info.push({
                    text,
                    details: await element.evaluate(el =>
                        el.textContent?.trim()
                    ),
                    type: await element.evaluate(el => el.getAttribute('type')),
                    locator: await this.getLocator(element),
                    // el: element,
                });
            }
        }

        for (const inputSelector of this.aliases.input) {
            const elements = await element.$$(
                inputSelector.selectors.join(', ')
            );
            // input.push(...elements);
            for (const element of elements) {
                const text = (await element.evaluate(
                    el => el.textContent
                )) as string;
                input.push({
                    text,
                    details: await element.evaluate(el =>
                        el.getAttribute('placeholder')
                    ),
                    type: await element.evaluate(el => el.getAttribute('type')),
                    locator: await this.getLocator(element),
                    // el: element,
                });
            }
        }

        for (const actionSelector of this.aliases.action) {
            const elements = await element.$$(
                actionSelector.selectors.join(', ')
            );

            for (const element of elements) {
                const text = (await element.evaluate(
                    el => el.textContent
                )) as string;
                actions.push({
                    text,
                    locator: await this.getLocator(element),
                    // el: element,
                });
            }
        }

        const result = {
            info,
            input,
            actions,
        };

        if (element.constructor.name === 'ElementHandle') {
            return {
                ...result,
                locator: await this.getLocator(
                    element as ElementHandle<Element>
                ),
            };
        } else {
            return result;
        }
    }

    async discoverPage(page: Page): Promise<PageDiscoveryResult> {
        log('Starting page discovery ...');

        log('Capturing groups ...');

        const items = await this.discoverGroup(page);
        // const groups: DiscoveryResult[] = [];
        // const actions: DiscoveryResult[] = [];

        // for (const group of this.aliases.group) {
        //     const elements = await page.$$(group.selectors.join(', '));
        //     log(`Found ${elements.length} groups`);
        //     for (const element of elements) {
        //         const name = group.name || 'Unnamed Group';
        //         log(`Discovering group: ${name} ...`);
        //         const discoveredGroup = await this.discoverGroup(element);
        //         groups.push(discoveredGroup);
        //         await element.screenshot({
        //             path: `${this.config.path}/group-${name}.png`,
        //         });
        //     }
        // }

        // return {items, groups, actions};
        return {items};
    }
}
