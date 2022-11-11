import * as fs from 'fs';
import {Browser} from 'puppeteer';
import Discovery from './discovery';
import {Action, Config, Sequence} from './models/config';
import {IdentifiableElement, PageDiscoveryResult} from './models/models';
import {log} from './utils/logger';

export default class Flow {
    private flow: any = {discovered: {}};
    private discovery: Discovery;

    constructor(
        private readonly config: Config,
        private readonly browser: Browser
    ) {
        log('Loading existing flow ...', 'green');
        this.discovery = new Discovery(config);
        if (fs.existsSync(config.output)) {
            this.flow = JSON.parse(fs.readFileSync(config.output, 'utf8'));
        }
    }

    public async discover(page: any): Promise<PageDiscoveryResult> {
        const currentUrl = await page.url();
        const discoveryResults: PageDiscoveryResult =
            await this.discovery.discoverPage(page);
        if (this.flow.discovered[currentUrl]) {
            const mergeObjects = (
                obj1: IdentifiableElement[],
                obj2: IdentifiableElement[]
            ) => {
                for (const item of obj2) {
                    const index = obj1.findIndex(
                        el => el.locator === item.locator
                    );
                    if (index === -1) {
                        obj1.push(item);
                    } else {
                        obj1[index] = item;
                    }
                }
            };

            const {items} = this.flow.discovered[currentUrl];
            const {items: newItems} = discoveryResults;
            Object.keys(items).forEach((key: string) => {
                mergeObjects(items[key], (newItems as any)[key]);
            });
        } else {
            this.flow.discovered[currentUrl] = discoveryResults;
        }
        return discoveryResults;
    }

    public export(path: string) {
        log(`Exporting flow to ${path} ...`, 'green');
        fs.writeFileSync(path, JSON.stringify(this.flow, null, 2));
    }

    public async execute(page: any) {
        const currentUrl = await page.url();
        const actions = this.config.actions[currentUrl];
        const {sequence} = actions[0];

        for (const item of sequence) {
            const {type, locator, value} = item;
            log(`Executing ${type} on ${locator} ...`, 'blue');
            // await page[type](locator, value);
            if (type === 'fill') {
                await page.type(locator, value);
            } else {
                await page.click(locator);
            }
        }

        // await page.waitForSelector('.sidebar__logo');
    }

    public async stateScreenshot(page: any, name = 'snapshot') {
        await page.screenshot({
            path: `${this.config.path}/${name}.png`,
        });
    }

    public async navigateTo(url: string, waitForNetworkIdle = true) {
        log(`Navigating to ${url} ...`, 'blue');
        const page = await this.browser.newPage();
        await page.goto(url);
        // await page.waitForNavigation({waitUntil: 'networkidle2'});
        // page.waitForNetworkIdle();
        // if (this.config.waitFor) {
        //     log(`Waiting for ${this.config.waitFor} ...`, 'blue');
        //     await page.waitForSelector(this.config.waitFor);
        // }
        if (waitForNetworkIdle) {
            await page.waitForNetworkIdle();
        }
        return page;
    }
}
