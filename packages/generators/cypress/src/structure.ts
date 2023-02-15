import * as fs from 'fs';
import { log } from './utils/logger';
import { ActionItem, FlowModel } from '../../../discovery/src/models/models';
import { Config } from '@marvin/discovery';
import { NewFlowModel, Functionality, Test } from './models/flow';
import { NewConfigModel } from './models/config';

export default class Structure {
  rawFlow: FlowModel;
  rawConfig: Config;
  inputPath: string = 'output/marvin2';
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

  private getTest(actionItem: ActionItem): Test {
    return {
      name: this.formatName(actionItem.sequenceStep),
      method: {
        name: actionItem.method,
        paramValues: [],
      },
    };
  }

  private getTests(actionItem: ActionItem, parentTests: Test[] = []) {
    let tests: Test[] = [...parentTests];
    if (actionItem.method) {
      tests.push(this.getTest(actionItem));
    }
    return tests;
  }

  private getGroups(
    graph: ActionItem[],
    groups: Functionality[] = [],
    parentTests: Test[] = [],
    lastGroupName: string = ''
  ) {
    for (const actionItem of graph) {
      const currentTests = this.getTests(actionItem);
      const currentLastGroupName = actionItem.method
        ? lastGroupName
        : actionItem.sequenceStep;
      if (actionItem.children.length > 0) {
        this.getGroups(
          actionItem.children,
          groups,
          [...parentTests, ...currentTests],
          currentLastGroupName
        );
      }

      if (
        (!actionItem.method || actionItem.children.length === 0) &&
        currentTests.length > 0
      ) {
        groups.push({
          group: lastGroupName,
          name: this.formatName(actionItem.sequenceStep),
          specs: [
            {
              file: this.formatName(actionItem.sequenceStep) + '.spec.cy.ts',
              variables: [],
              beforeAll: parentTests,
              tests: currentTests,
            },
          ],
        });
      }
    }
    return groups;
  }

  public generate() {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    this.flow.functionalities = this.getGroups(this.rawFlow.graph);
    for (const func of this.flow.functionalities) {
      console.log('');
      console.log('++ Folder : ' + func.group);
      for (const spec of func.specs) {
        console.log('FileName: ' + spec.file)
        console.log('Before All:');
        for (const test of spec.beforeAll) {
          console.log(' | ' + test.name);
        }
        console.log('');
        console.log('Tests:');
        for (const test of spec.tests) {
          console.log(' | ' + test.name);
        }
      }
    }
  }
}
