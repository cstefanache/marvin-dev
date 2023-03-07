import * as fs from 'fs';
import { Browser, Page } from 'puppeteer';
import Discovery from './discovery';
import { Action, Config, Sequence } from './models/config';
import {
  IdentifiableElement,
  Output,
  PageDiscoveryResult,
  FlowModel,
  ActionItem,
} from './models/models';
import { log } from './utils/logger';
import { processUrl } from './utils/processes';

export default class Flow {
  public flow: FlowModel;
  private output: Output;
  private discovery: Discovery;

  constructor(
    private readonly config: Config,
    private readonly browser: Browser
  ) {
    this.discovery = new Discovery(config);
    if (fs.existsSync(`${config.path}/output.json`)) {
      log('Previous output file found, loading ...', 'green');
      this.output = JSON.parse(
        fs.readFileSync(`${config.path}/output.json`, 'utf8')
      );
    } else {
      log('No previous output file found, creating new one', 'red');
      this.output = { discovered: {} };
    }

    if (fs.existsSync(`${config.path}/flow.json`)) {
      log('Previous flow file found, loading ...', 'green');
      this.flow = JSON.parse(
        fs.readFileSync(`${config.path}/flow.json`, 'utf8')
      );
    } else {
      this.flow = { graph: [], actions: [] };
    }
  }

  public getUrl(url: string): string {
    return processUrl(
      url,
      this.config.aliases.urlReplacers || [],
      this.config.rootUrl
    );
  }

  /**
   * Discover elements in the current page and merge them in the output
   * @param page Puppeteer page object
   * @returns the discovered elements
   */
  public async discover(
    page: Page,
    overwrite = false
  ): Promise<PageDiscoveryResult> {
    let currentUrl = page.url();
    currentUrl = processUrl(
      currentUrl,
      this.config.aliases.urlReplacers || [],
      this.config.rootUrl
    );
    const discoveryResults: PageDiscoveryResult =
      await this.discovery.discoverPage(page);
    if (this.output.discovered[currentUrl] && !overwrite) {
      const { items } = this.output.discovered[currentUrl];
      const { items: newItems } = discoveryResults;
      if (items && newItems) {
        [...new Set([...Object.keys(items), ...Object.keys(newItems)])].forEach(
          (key: string) => {
            items[key] = this.mergeObjects(
              items[key] || [],
              newItems[key] || []
            );
          }
        );
      }
    } else {
      this.output.discovered[currentUrl] = discoveryResults;
    }
    return discoveryResults;
  }

  /**
   * Save current discovered flow to file
   * @param path path to save
   */
  public export(): void {
    log(`Exporting output ...`, 'yellow');
    fs.writeFileSync(
      `${this.config.path}/output.json`,
      JSON.stringify(this.output, null, 2)
    );

    log(`Exporting graph ...`, 'yellow');
    fs.writeFileSync(
      `${this.config.path}/flow.json`,
      JSON.stringify(this.flow, null, 2)
    );
  }

  public async execute(page: any) {
    const currentUrl = await page.url();
    const actions = this.config.actions[currentUrl];
    const { sequence } = actions[0];

    for (const item of sequence) {
      const { type, locator, value } = item;
      log(`Executing ${type} on ${locator} ...`, 'blue');
      if (type === 'fill') {
        await page.type(locator, value);
      } else {
        await page.click(locator);
      }
    }
  }

  /**
   * Save a snapshot of the current page state
   * @param page the Puppeteer page object
   * @param name name of the file to save
   */
  public async stateScreenshot(page: Page, name = 'snapshot'): Promise<void> {
    await page.screenshot({
      path: `${this.config.path}/screenshots/${name}.png`,
    });
  }

  /**
   * Navigate to a page and wait for it to load
   * @param url url to load
   * @param waitForNetworkIdle flag to wait for the page to load
   * @returns page object
   */
  public async navigateTo(
    url: string,
    waitForNetworkIdle = true
  ): Promise<Page> {
    log(`Navigating to ${url} ...`, 'blue');
    const page = await this.browser.newPage();
    await page.goto(url);
    if (waitForNetworkIdle) {
      await page.waitForNetworkIdle({
        timeout: this.config.defaultTimeout,
      });
    }
    return page;
  }

  /**
   * Merge the items in two objects based on the locator
   * @param obj1 merge into this object
   * @param obj2 merge from this object
   */
  private mergeObjects(
    obj1: IdentifiableElement[],
    obj2: IdentifiableElement[]
  ) {
    for (const item of obj2) {
      const index = obj1.findIndex((el) => el.locator === item.locator);
      if (index === -1) {
        obj1.push(item);
      } else {
        obj1[index] = item;
      }
    }
    return obj1;
  }
}
