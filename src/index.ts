import * as puppeteer from 'puppeteer';

import Flow from './flow';
import Runner from './runner';
import {Config} from './models/config';
import {loadJSON} from './utils/loaders';
import {log} from './utils/logger';

(async () => {
    const [, , ...args] = process.argv;
    const logRequests = false;
    log('Marvin started', 'yellow');

    log(`Loaded configuration from ${args[0]}`, 'yellow');
    const config = loadJSON(`${args[0]}/config.json`) as Config;

    log('Starting browser', 'yellow');
    const browser = await puppeteer.launch({headless: true});

    // Discover current page
    const flow = new Flow(config, browser);
    const page = await flow.navigateTo(config.url);
    await page.setRequestInterception(true);

    if (logRequests) {
        page.on(puppeteer.PageEmittedEvents.Request, interceptedRequest => {
            log(interceptedRequest.url(), 'yellow');
            interceptedRequest.continue();
        });

        page.on(puppeteer.PageEmittedEvents.Response, response => {
            log(response.url(), 'yellow');
        });
    }

    await page.waitForNetworkIdle();

    const runner = new Runner(config, flow);
    await runner.run(page, config.sequence);
    await flow.stateScreenshot(page, 'runstate');
    await flow.discover(page, true);

    flow.export();
})();
