import * as puppeteer from 'puppeteer';
import Flow from './flow';
import Runner from './runner';
import {Config} from './models/config';
import * as loaders from './utils/loaders';
import {log} from './utils/logger';

(async () => {
    const [, , ...args] = process.argv;
    const config = loaders.loadJSON(`${args[0]}/config.json`) as Config;
    const browser = await puppeteer.launch({headless: true});

    log('### Starting flow ...', 'yellow');

    const flow = new Flow(config, browser);
    const runner = new Runner(config);

    const page = await flow.navigateTo(config.url);
    await page.waitForNetworkIdle();

    await runner.run(page);
    await flow.stateScreenshot(page, 'runstate');
    await flow.discover(page);

    flow.export(config.output);
})();
