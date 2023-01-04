import * as puppeteer from 'puppeteer';

import { Flow, Discovery, Runner, State } from '@marvin/discovery';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const config = {
    path: 'output',
    defaultTimeout: 1000,
    rootUrl: 'http://localhost:4200/',
    aliases: {
      urlReplacers: [
        {
          regex: '/[0-9]+',
          alias: '/:id',
        },
      ],
      info: [
        {
          name: 'Headers',
          selectors: ['.card-title', '.title'],
        },
      ],
      optimizer: {
        priority: ['name', 'placeholder', 'role', 'type', 'href'],
        exclude: [
          {
            type: 'attribute',
            name: 'id',
            regex: [':[a-z0-9]+:'],
          },
          {
            type: 'attribute',
            name: 'id',
            regex: ['mui-[0-9]+'],
          },
        ],
      },
      iterators: [
        {
          name: 'Card Iterator',
          selectors: ['.grid-card'],
          identifier: '.MuiTypography-h5',
          elements: [
            {
              name: 'Open Button',
              selector: 'a',
            },
            {
              name: 'Delete Button',
              selector: 'button',
            },
          ],
        },
      ],
    },
    sequence: [
      'Login as user',
      'Create new list',
      'Add "a" item',
      'Add "b" item',
      'Add "c" item',
      'Save List',
      'Delete Newly Created List',
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
  await flow.discover(page, true);
  await flow.stateScreenshot(page, 'runstate');

  flow.export();
})();
