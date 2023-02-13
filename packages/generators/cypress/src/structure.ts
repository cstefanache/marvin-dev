import * as fs from 'fs';
import { log } from './utils/logger';
import { ActionItem, FlowModel } from '../../../discovery/src/models/models';
import { Config } from '@marvin/discovery';
import { NewFlowModel, Functionality } from './models/flow';
import { NewConfigModel } from './models/config';

export default class Structure {
  rawFlow: FlowModel;
  rawConfig: Config;
  inputPath: string = '/Users/ralucabrie/Documents/qa_proj/marvin/output';
  flow: NewFlowModel = {
    functionalities: [],
    selectors: [],
    commands: [],
  };
  config: NewConfigModel;

  constructor() {
    if (fs.existsSync(`${this.inputPath}/config.json`)) {
      log('Previous config file found, loading ...', 'green');
      this.rawConfig = JSON.parse(
        fs.readFileSync(`${this.inputPath}/config.json`, 'utf8')
      );
    } else {
      throw new Error(
        `No config file was found in the provided path: ${this.inputPath}`
      );
    }

    if (fs.existsSync(`${this.inputPath}/flow.json`)) {
      log('The flow file found, loading ...', 'green');
      this.rawFlow = JSON.parse(
        fs.readFileSync(`${this.inputPath}/flow.json`, 'utf8')
      );
    } else {
      throw new Error(
        `No flow file was found in the provided path: ${this.inputPath}`
      );
    }
  }

  private formatName(str: String) {
    return str.replace(new RegExp(' ', 'g'), '-');
  }

  private getGroups(graph: ActionItem[], groups: any[] = []) {
    for (const actionItem of graph) {
      if (!actionItem.method) {
        groups.push({
          group: this.formatName(actionItem.sequenceStep),
          specs: [],
        });
      }
      if (actionItem.children.length > 0) {
        this.getGroups(actionItem.children, groups);
      }
    }
    return groups;
  }

  public generate() {
    this.flow.functionalities = this.getGroups(this.rawFlow.graph);

    console.log(this.flow.functionalities);
  }
}
