import {ElementHandle, Page} from 'puppeteer';
import {Aliases, Config} from './models/config';
import {log} from './utils/logger';

const defaultAliases = {
  group: [],
  action: [
    {
      selectors: ['button', 'a'],
    },
  ],
  input: [
    {
      selectors: ['input'],
    },
  ],
};

export default class Discovery {
  private aliases: Aliases;

  constructor(private readonly config: Config) {
    this.aliases = {
      group: [...defaultAliases.group, ...(config.aliases?.group || [])],
      action: [...defaultAliases.action, ...(config.aliases?.action || [])],
      input: [...defaultAliases.input, ...(config.aliases?.input || [])],
    };

    console.log(this.aliases);
  }

  async discoverGroup(element: ElementHandle<Element>) {
    log('Capturing inputs ...');
    const input: ElementHandle<Element>[] = [];
    const actions: ElementHandle<Element>[] = [];

    for (const inputSelector of this.aliases.input) {
      const elements = await element.$$(inputSelector.selectors.join(', '));
      input.push(...elements);
    }

    for (const actionSelector of this.aliases.action) {
      const elements = await element.$$(actionSelector.selectors.join(', '));
      actions.push(...elements);
    }

    return {
      input,
      actions,
    };
  }

  async discoverPage(page: Page) {
    log('Starting page discovery ...');

    log('Capturing groups ...');

    const allInputs: ElementHandle<Element>[] = [];
    const allActions: ElementHandle<Element>[] = [];
    const groups = [];

    for (const group of this.aliases.group) {
      const elements = await page.$$(group.selectors.join(', '));
      log(`Found ${elements.length} groups`);
      for (const element of elements) {
        const name = group.name || 'Unnamed Group';
        log(`Discovering group: ${name} ...`);
        groups.push(await this.discoverGroup(element));
        await element.screenshot({
          path: `${this.config.path}/group-${name}.png`,
        });
      }
    }

    console.log(groups);
  }
}
