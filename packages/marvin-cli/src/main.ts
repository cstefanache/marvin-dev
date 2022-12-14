import * as puppeteer from 'puppeteer';

import { Flow, Discovery, Runner, State } from '@marvin/discovery';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const config = {
    path: 'output',
    rootUrl: 'http://localhost:4200/',
    urlReplacers: [],
    aliases: {
      info: [{ name: 'code', selectors: ['pre'] }],
    },
    sequence: [],
  } as any;
  const flow = new Flow(config, browser);
  const page = await flow.navigateTo(config.rootUrl);
  // const state = new State(page);
  const state = undefined;

  await page.setRequestInterception(true);

  await page.waitForNetworkIdle({ timeout: config.defaultTimeout });

  const runner = new Runner(config, flow, state);
  await runner.run(page, config.sequence);

  // log('Taking screenshot', 'yellow');
  await flow.discover(page, false);
  // await flow.stateScreenshot(page, 'runstate');

  flow.export();
})();
