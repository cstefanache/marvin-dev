import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import * as uuid from 'uuid';
import { Config, Flow, Models, Runner, State } from '@marvin/discovery';
import getLog from './logging';
import App from '../app';
const logger = getLog('marvin:workspace');

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export default class Workspace {
  private folder: string;
  private config: Config;
  private flow: Models.FlowModel;
  private output: Models.Discovered;

  async initialize(path: string, name: string, url?: string) {
    if (fs.existsSync(path)) {
      logger.log(`Workspace folder already exists at ${path}`);
    } else {
      fs.mkdirSync(path);
      fs.mkdirSync(`${path}/output`);
    }

    if (fs.existsSync(`${path}/config.json`)) {
      logger.error(`Workspace config already exists at ${path}/config.json`);
      await this.loadWorkspace(path);
    } else {
      this.config = {
        name,
        rootUrl: url,
        path,
        defaultTimeout: 3000,
        output: `${path}/output`,
        aliases: {
          urlReplacers: [],
          optimizer: {
            exclude: [],
            priority: [],
          },
          action: [],
          input: [],
          info: [],
          iterators: [],
        },
        actions: {},
        discover: [],
        sequence: [],
      };

      fs.writeFileSync(
        `${path}/config.json`,
        JSON.stringify(this.config, null, 2)
      );
    }

    if (!fs.existsSync(`${path}/flow.json`)) {
      this.flow = {
        actions: {},
        graph: [],
      };
      fs.writeFileSync(`${path}/flow.json`, JSON.stringify(this.flow, null, 2));
    }

    logger.log('Watching config file for changes...');
    fs.watchFile(`${path}/config.json`, (curr, prev) => {
      logger.log('Config file changed. Reloading...');
      this.config = JSON.parse(fs.readFileSync(`${path}/config.json`, 'utf8'));
      App.mainWindow.webContents.send('config-updated', this.config);
    });

    // logger.log('Watching flow file for changes...');
    // fs.watchFile(`${path}/flow.json`, (curr, prev) => {
    //   logger.log('Flow file changed. Reloading...');
    //   this.flow = JSON.parse(fs.readFileSync(`${path}/flow.json`, 'utf8'));
    //   App.mainWindow.webContents.send('flow-updated', this.flow);
    // });
  }

  async loadWorkspace(folder: string): Promise<void> {
    if (fs.existsSync(folder)) {
      if (fs.existsSync(`${folder}/config.json`)) {
        logger.log(`Loading config from ${folder}/config.json`);
        this.config = JSON.parse(
          fs.readFileSync(`${folder}/config.json`, 'utf8')
        );

        if (fs.existsSync(`${folder}/flow.json`)) {
          this.flow = JSON.parse(
            fs.readFileSync(`${folder}/flow.json`, 'utf8')
          );
        } else {
          this.flow = {
            actions: {},
            graph: [],
          };
        }

        this.syncOutput();
      } else {
        logger.error(`No config.json found in ${folder}`);
        throw new Error('No config.json found in workspace folder.');
      }
    } else {
      logger.error(`No workspace folder found at ${folder}`);
      throw new Error('No workspace folder found.');
    }
  }

  getConfig(): Config {
    return this.config;
  }

  setConfig(config: Config) {
    this.config = config;
    fs.writeFileSync(
      `${this.config.path}/config.json`,
      JSON.stringify(config, null, 2)
    );
  }

  getFlow(): Models.FlowModel {
    return this.flow;
  }

  getMethodsForPath(path: string): any {
    return this.flow.actions[path];
  }

  getDiscoveredForPath(path: string): any {
    return this.output.discovered[path];
  }

  getDiscoveredPaths(): string[] {
    return Object.keys(this.output.discovered);
  }

  async run(sequence: string[], callback: Function) {
    logger.log(`Running sequence ${sequence.join(',')}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [`--window-size=1920,2080`],
      defaultViewport: {
        width: 1920,
        height: 2080,
      },
    });

    const flow = new Flow(this.config, browser);
    const page = await flow.navigateTo(this.config.rootUrl);
    const state = new State(page);
    await page.setRequestInterception(true);
    await page.waitForNetworkIdle({ timeout: this.config.defaultTimeout });
    await flow.stateScreenshot(page, 'root');

    callback(undefined);
    const runner = new Runner(this.config, flow, state);
    await runner.run(page, sequence, callback);

    logger.log(`Finished running sequence. Discovering...`);
    await flow.discover(page, true);
    logger.log(`Discovery finished.`);
    await flow.export();
    logger.log('Export finished.');
    this.flow = flow.flow;

    if (sequence.length === 0) {
      const exitUrl = await page.url();
      console.log(exitUrl);
      this.config.exitUrl = flow.getUrl(exitUrl);
      this.store();
      
    }
    this.syncOutput();
    App.mainWindow.webContents.send('flow-updated', this.flow);
  }

  close(): void {
    if (this.config) {
      logger.log(`Closing workspace ${this.config.name}`);
      this.config = undefined;
      this.flow = undefined;
      this.output = undefined;
    }
  }

  addBranch(id: string, branch: any): void {
    const searchInChildren = (children: any[]) => {
      for (const child of children) {
        console.log(child.id, id);
        if (child.id === id) {
          return child;
        }
        if (child.children) {
          const result = searchInChildren(child.children);
          if (result) {
            return result;
          }
        }
      }
    };

    let flowElement;
    if (id === 'root') {
      flowElement = { children: this.flow.graph };
    } else {
      flowElement = searchInChildren(this.flow.graph);
    }
    console.log(flowElement);
    if (flowElement) {
      flowElement.children.push({ id: uuid.v4(), ...branch, children: [] });
    }
    this.store();
  }

  saveMethodForUrl(url: string, method: any): void {
    if (!this.flow.actions[url]) {
      this.flow.actions[url] = [];
    }
    this.flow.actions[url].push(method);
    this.store();
  }

  store(): void {
    if (this.config) {
      logger.log(`Storing workspace ${this.config.name}`);
      fs.writeFileSync(
        `${this.config.path}/config.json`,
        JSON.stringify(this.config, null, 2)
      );

      fs.writeFileSync(
        `${this.config.path}/flow.json`,
        JSON.stringify(this.flow, null, 2)
      );
    }
  }

  syncOutput(): void {
    if (fs.existsSync(`${this.config.path}/output.json`)) {
      this.output = JSON.parse(
        fs.readFileSync(`${this.config.path}/output.json`, 'utf8')
      );
    }
  }

  isInitialized(): boolean {
    return this.config !== undefined;
  }
}
