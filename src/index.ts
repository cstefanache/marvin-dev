import * as puppeteer from 'puppeteer';

import Flow from './flow';
import Runner from './runner';
import {Config} from './models/config';
import {loadJSON} from './utils/loaders';
import {log} from './utils/logger';
import {State} from './state';

(async () => {
    const [, , ...args] = process.argv;
    log('Marvin started', 'yellow');

    log(`Loaded configuration from ${args[0]}`, 'yellow');
    const config = loadJSON(`${args[0]}/config.json`) as Config;

    log('Starting browser', 'yellow');
    const browser = await puppeteer.launch({headless: true});

    // Discover current page
    const flow = new Flow(config, browser);
    const page = await flow.navigateTo(config.rootUrl);
    const state = new State(page);

    await page.setRequestInterception(true);

    await page.waitForNetworkIdle({timeout: config.defaultTimeout});

    const runner = new Runner(config, flow, state);
    await runner.run(page, config.sequence);

    log('Taking screenshot', 'yellow');
    await flow.discover(page, false);
    await flow.stateScreenshot(page, 'runstate');

    flow.export();
})();
