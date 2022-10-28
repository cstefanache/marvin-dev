import * as puppeteer from 'puppeteer';
import Discovery from './discovery';
import Flow from './flow';
import {Config} from './models/config';
import * as loaders from './utils/loaders';
import {log} from './utils/logger';

(async () => {
    const [, , ...args] = process.argv;
    const config = loaders.loadJSON(`${args[0]}/config.json`) as Config;
    const browser = await puppeteer.launch({headless: true});

    const flow = new Flow(config, browser);
    await flow.discover();
})();
