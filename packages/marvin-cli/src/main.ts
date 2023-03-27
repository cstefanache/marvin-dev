import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { Flow, Discovery, Runner, State } from '@marvin/discovery';
import { log } from 'packages/discovery/src/utils/logger';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [`--window-size=1920,2080`],
    defaultViewport: {
      width: 1920,
      height: 2080,
    },
  });

  const config = JSON.parse(
    fs.readFileSync(`./tmp/aboutyou/config.json`, 'utf8')
  );
  const flow = new Flow(config, browser);
  const page = await flow.navigateTo(config.rootUrl);
  const state = new State(page);
  // const state = undefined;

  await page.setRequestInterception(true);

  await page.waitForNetworkIdle({ timeout: config.defaultTimeout });

  const runner = new Runner(config, flow, state);
  const sequences = [
    [
      '8124a3df-42ca-465c-85e3-09545d243fbd',
      '9e0d52dc-05ce-4db2-9c1a-7f4482b24a08',
      '38cd6b18-b901-4d04-a007-23beed128837',
      'e44bb8b2-b912-448d-9fad-f329f12116d8',
    ],
    [
      '8124a3df-42ca-465c-85e3-09545d243fbd',
      '7d07fddf-474f-423d-925a-ed08471b1620',
    ],
  ];

  sequences.forEach(async (sequence) => {
    log(`Running sequence ${sequence}`, 'yellow');
    await runner.run(page, sequence);

  });

  // // log('Taking screenshot', 'yellow');
  // await flow.discover(page, true);
  await flow.stateScreenshot(page, 'runstate');

  // flow.export();
})();
