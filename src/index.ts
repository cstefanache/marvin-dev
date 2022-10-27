import * as puppeteer from 'puppeteer';
import Discovery from './discovery';
import {Config} from './models/config';
import * as loaders from './utils/loaders';
import {log} from './utils/logger';

(async () => {
  const [, , ...args] = process.argv;
  const config = loaders.loadJSON(`${args[0]}/config.json`) as Config;
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto(config.url);
  log('Page loaded', 'green');
  await page.waitForNavigation({waitUntil: 'networkidle2'});
  if (config.waitFor) {
    log(`Waiting for ${config.waitFor} ...`, 'blue');
    await page.waitForSelector(config.waitFor);
  }
  log('Page finished loading', 'blue');
  const discovery = new Discovery(config);
  await discovery.discoverPage(page);
})();
