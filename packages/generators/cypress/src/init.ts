import * as fs from 'fs';
import { log } from './utils/logger';
import { FlowModel } from '../../../discovery/src/models/models';
import { Config } from '@marvin/discovery';
import { NewFlowModel } from './models/flow';
import { NewConfigModel } from './models/config';

export default class Init {
  rawFlow: FlowModel;
  rawConfig: Config;
  inputPath: string;
  flow: NewFlowModel;
  config: NewConfigModel;

  constructor() {
    if (fs.existsSync(`${this.inputPath}/flow.json`)) {
      log('Previous flow file found, loading ...', 'green');
      this.rawConfig = JSON.parse(
        fs.readFileSync(`${this.inputPath}/flow.json`, 'utf8')
      );
    } else {
      throw new Error(
        `No flow file was found in the provided path: ${this.inputPath}`
      );
    }

    if (fs.existsSync(`${this.inputPath}/config.json`)) {
      log('The config file found, loading ...', 'green');
      this.rawFlow = JSON.parse(
        fs.readFileSync(`${this.inputPath}/config.json`, 'utf8')
      );
    } else {
      throw new Error(
        `No config file was found in the provided path: ${this.inputPath}`
      );
    }
  }

  public initialize(path: string) {
    console.log(this.rawFlow.actions);
    console.log(this.config.baseUrl);
  }
}
