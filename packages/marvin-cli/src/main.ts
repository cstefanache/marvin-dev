import * as puppeteer from 'puppeteer';

import { Flow, Discovery, Runner, State } from '@marvin/discovery';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const config = {
    path: 'output',
    defaultTimeout: 1000,
    rootUrl: 'http://localhost:4200/',
    urlReplacers: [{
      regex: '\/[0-9]+',
      alias: '/:id',
    }],
    optimizer: {
      exclude: [
        {
          type: 'attribute',
          name: 'id',
        },
      ],
    },
    aliases: {
      info: [
       
      ],
      iterators: [
        {
          name: 'Card Iterator',
          selectors: ['.grid-card'],
          identifiers: [
            {
              name: 'Card Title',
              selector: '.MuiTypography-h5',
            },
            { name: 'Open Button', selector: 'a' },
            { name: 'Delete Button', selector: 'button' },
          ],
        },
      ],
    },
    sequence: [
      'Login as user@marvinapp.io', 
      'Click on create new list',
      'Add a new list with single item',
      'Add New Item',
      'Save List',
      'Delete Newly Created List'
    ],
  } as any;
  const flow = new Flow(config, browser);
  const page = await flow.navigateTo(config.rootUrl);
  const state = new State(page);
  // const state = undefined;

  await page.setRequestInterception(true);

  await page.waitForNetworkIdle({ timeout: config.defaultTimeout });

  const runner = new Runner(config, flow, state);
  await runner.run(page, config.sequence);

  // log('Taking screenshot', 'yellow');
  await flow.discover(page, false);
  await flow.stateScreenshot(page, 'runstate');

  flow.export();
})();
