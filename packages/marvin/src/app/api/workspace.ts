import * as fs from 'fs';
import { Config, Models } from '@marvin/discovery';
import getLog from './logging';

const logger = getLog('marvin:workspace');

export default class Workspace {
  private folder: string;
  private config: Config;
  private flow: Models.FlowModel;
  private output: Models.Discovered;

  async initialize(path: string, name: string, url: string) {
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
            store: {},
          };
        }
      } else {
        logger.error(`No config.json found in ${folder}`);
        throw new Error('No config.json found in workspace folder.');
      }
    } else {
      logger.error(`No workspace folder found at ${folder}`);
      throw new Error('No workspace folder found.');
    }

    this.folder = folder;
  }

  getConfig(): Config {
    return this.config;
  }

  close(): void {
    if (this.config) {
      logger.log(`Closing workspace ${this.config.name}`);
      this.config = undefined;
      this.flow = undefined;
    }
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

  isInitialized(): boolean {
    return this.config !== undefined;
  }
}
