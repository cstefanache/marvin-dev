import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import * as uuid from 'uuid';
import { Config, Flow, Models, Runner, State } from '@marvin/discovery';
import getLog from './logging';
import App from '../app';
const logger = getLog('Workspace');

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
  public config: Config;
  public flow: Models.FlowModel;

  private folder: string;
  private output: Models.Discovered;

  async initialize(path: string, name: string, url?: string) {
    if (fs.existsSync(path)) {
      logger.log(`Workspace folder already exists at ${path}`);
    } else {
      fs.mkdirSync(path);
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
        outputPath: `${path}/output/e2e`,

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
          store: [],
          hack: {
            pre: '',
          },
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
        actions: [],
        graph: [
          {
            id: uuid.v4(),
            sequenceStep: name,
            children: [],
            url,
          },
        ],
        blocks: [],
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
            actions: [],
            graph: [],
            blocks: [],
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
    return this.flow.actions.filter((a) => a.isGlobal || a.path === path);
  }

  getDiscoveredForPath(path: string): any {
    return this.output.discovered[path];
  }

  getDiscoveredPaths(): string[] {
    return Object.keys(this.output.discovered);
  }

  async run(sequence: string[][], callback: Function, skipDiscovery?: boolean) {
    console.log(`Running sequence`, sequence);
    logger.log(`Skipping discovery: ${skipDiscovery}`);

    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        `--window-size=1920,2080`,
        "--proxy-server='direct://'",
        '--proxy-bypass-list=*',
      ],
      defaultViewport: {
        width: 1920,
        height: 2080,
      },
    });

    const flow = new Flow(this.config, browser);
    const page = await flow.navigateTo(this.config.rootUrl);
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    );
    const state = new State(page);
    await page.setRequestInterception(true);
    await page.waitForNetworkIdle({ timeout: this.config.defaultTimeout });
    // await flow.stateScreenshot(page, 'root');

    callback(undefined);
    const runner = new Runner(this.config, flow, state);

    for (const seq of sequence) {
      await runner.run(page, seq, callback);
    }

    if (!skipDiscovery) {
      logger.log(`Finished running sequence. Discovering...`);
      await flow.discover(page, true);
      logger.log(`Discovery finished.`);
      await runner.performScreenshotForLastAction(page);
      await flow.export();
      logger.log('Export finished.');
      this.flow = flow.flow;
      App.mainWindow.webContents.send('running-discovery', this.flow);

      if (sequence.length === 0) {
        const exitUrl = await page.url();
        this.config.exitUrl = flow.getUrl(exitUrl);
        this.store(true);
      }
      this.syncOutput();
    }
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
    if (flowElement) {
      flowElement.children.push({ id: uuid.v4(), ...branch, children: [] });
    }
    this.store();
  }

  setBlocks(blocks: any): void {
    this.flow.blocks = blocks;
    this.store();
  }

  deleteMethod(id: string): void {
    Object.keys(this.flow.actions).forEach((key) => {
      this.flow.actions = this.flow.actions.filter((item) => {
        return item.uid !== id;
      });
    });

    this.store();
  }

  saveMethodForUrl(method: any): void {
    const methodUid = method.uid || uuid.v4();
    let methodExists = false;
    this.flow.actions = this.flow.actions.reduce((memo: any, item: any) => {
      if (
        (method.uid && item.uid === method.uid) ||
        (!method.uid && method.method === item.method)
      ) {
        memo.push(method);
        methodExists = true;

        const updateWithNewMethod = (children: any[]) => {
          for (const child of children) {
            if (
              (method.uid &&
                child.methodUid &&
                child.methodUid === method.uid) ||
              ((!method.uid || !child.methodUid) &&
                child.method === method.method)
            ) {
              child.method = method.method;
              child.methodUid = methodUid;
            }
            if (child.children) {
              updateWithNewMethod(child.children);
            }
          }
        };

        updateWithNewMethod(this.flow.graph);
      } else {
        memo.push(item);
      }
      return memo;
    }, []);

    method.uid = methodUid;
    if (!methodExists) {
      this.flow.actions.push(method);
    }

    this.store();
  }

  cutBranch(id: string): void {
    const searchInChildren = (children: any[]) => {
      let index = 0;
      for (const child of children) {
        if (child.id === id) {
          children.splice(index, 1);
          return;
        }
        if (child.children) {
          const result = searchInChildren(child.children);
          if (result) {
            return result;
          }
        }
        index++;
      }
    };
    searchInChildren(this.flow.graph);
    this.store();
    App.mainWindow.webContents.send('flow-updated', this.flow);
  }

  updateBranch(data: any) {
    const searchInChildren = (children: any[]) => {
      let index = 0;
      for (const child of children) {
        if (child.id === data.id) {
          children[index] = { ...child, ...data };
          return;
        }
        if (child.children) {
          const result = searchInChildren(child.children);
          if (result) {
            return result;
          }
        }
        index++;
      }
    };
    searchInChildren(this.flow.graph);
    this.store();
    App.mainWindow.webContents.send('flow-updated', this.flow);
  }

  store(skipFlow: boolean = false): void {
    if (this.config) {
      logger.log(`Storing workspace ${this.config.name}`);
      fs.writeFileSync(
        `${this.config.path}/config.json`,
        JSON.stringify(this.config, null, 2)
      );

      if (!skipFlow) {
        fs.writeFileSync(
          `${this.config.path}/flow.json`,
          JSON.stringify(this.flow, null, 2)
        );
      }
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
