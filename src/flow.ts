import {Browser} from 'puppeteer';
import Discovery from './discovery';
import {Config} from './models/config';
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
    }

    public async discover() {
        await this.navigateTo(this.config.url);

        console.log(JSON.stringify(this.flow, null, 2));
    }

    private async navigateTo(url: string) {
        log(`Navigating to ${url} ...`, 'blue');
        const page = await this.browser.newPage();
        await page.goto(url);
        await page.waitForNavigation({waitUntil: 'networkidle2'});
        if (this.config.waitFor) {
            log(`Waiting for ${this.config.waitFor} ...`, 'blue');
            await page.waitForSelector(this.config.waitFor);
        }
        const discoveryResults = await this.discovery.discoverPage(page);

        this.flow.discovered[url] = discoveryResults;
    }
}
