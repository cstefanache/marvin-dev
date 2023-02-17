import * as fs from 'fs';
import { log } from './utils/logger';
import {
  ActionItem,
  FlowModel,
  Actions,
  Sequence,
} from '../../../discovery/src/models/models';
import { Config } from '@marvin/discovery';
import {
  NewFlowModel,
  Functionality,
  Test,
  Identifier,
  BodyDefinition,
} from './models/models';
import { NewConfigModel } from './models/config';
import { Action } from 'packages/discovery/src/models/config';
import bodyParser = require('body-parser');

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
    return str
      .toLocaleLowerCase()
      .trim()
      .replace(new RegExp('[ :/\\\\]', 'g'), '-');
  }

  private getTest(actionItem: ActionItem): Test {
    let paramValuesQueue: string[] = [];

    if (actionItem.parameters) {
      for (const paramKey of Object.keys(actionItem.parameters)) {
        paramValuesQueue.push(`${actionItem.parameters[paramKey]}`);
      }
    }
    return {
      name: this.formatName(actionItem.sequenceStep),
      method: {
        name: this.formatName(actionItem.method),
        paramValues: [...paramValuesQueue],
      },
    };
  }

  private getTests(actionItem: ActionItem, parentTests: Test[] = []): Test[] {
    let tests: Test[] = [...parentTests];
    if (actionItem.method) {
      tests.push(this.getTest(actionItem));
    }
    return tests;
  }

  private getFunctionalities(
    graph: ActionItem[],
    groups: Functionality[] = [],
    parentTests: Test[] = [],
    currentTestsFromParent: Test[] = [],
    lastGroupName: string = ''
  ) {
    for (const actionItem of graph) {
      const currentTests: Test[] = [
        ...currentTestsFromParent,
        ...this.getTests(actionItem),
      ];
      const currentLastGroupName = actionItem.method
        ? lastGroupName
        : `${lastGroupName}/${actionItem.sequenceStep}`;

      this.getFunctionalities(
        actionItem.children,
        groups,
        actionItem.method ? parentTests : [...parentTests, ...currentTests],
        actionItem.method ? currentTests : [],
        currentLastGroupName
      );

      if (actionItem.children.length === 0) {
        groups.push({
          group: currentLastGroupName,
          specs: [
            {
              file: this.formatName(actionItem.sequenceStep) + '.spec.cy.ts',
              //variables: [],
              beforeAll: parentTests,
              tests: currentTests,
            },
          ],
        });
      }
    }
    return groups;
  }

  private getSelectorIdentifiers(sequence: any) {
    const identifiers: Identifier[] = [];
    for (const step of sequence) {
      identifiers.push({
        key:
          step.details === ' '
            ? this.formatName(step.locator)
            : this.formatName(step.details),
        value: step.locator,
      });
    }
    return identifiers;
  }

  private getSelectors() {
    const { actions } = this.rawFlow;
    let selectors: any[] = [];
    for (const key of Object.keys(actions)) {
      for (const action of actions[key]) {
        selectors.push({
          file: this.formatName(action.method) + '.po.ts',
          selectors: [...this.getSelectorIdentifiers(action.sequence)],
        });
      }
    }
    return selectors;
  }

  private getBodyDefinitions(sequence: any) {
    const definitions: BodyDefinition[] = [];
    for (const step of sequence) {
      definitions.push({
        element: {
          key:
            step.details === ' '
              ? this.formatName(step.locator)
              : this.formatName(step.details),
          value: step.locator,
          storeName: step.storeName ? step.storeName : null,
        },
        action: step.type,
      });
    }
    return definitions;
  }

  private getStoreFlagValue(sequence: any) {
    for (const step of sequence) {
      if (step.store === 'true') {
        return true;
      }
    }
    return false;
  }

  private getParameters(sequence: any) {
    const params: Identifier[] = [];
    for (const step of sequence) {
      if (step.type === 'clearAndFill') {
        step.store
          ? params.push({
              key:
                step.details === ' '
                  ? this.formatName(step.locator)
                  : this.formatName(step.details),
              storeName: step.storeName ? step.storeName : null,
            })
          : params.push({
              key: step.details
                ? this.formatName(step.details)
                : this.formatName(step.locator),
            });
      }
    }
    return params;
  }

  private getCommands() {
    const { actions } = this.rawFlow;
    let commands: any[] = [];
    for (const key of Object.keys(actions)) {
      for (const action of actions[key]) {
        commands.push({
          file: this.formatName(action.method) + '.commands.ts',
          method: {
            name: this.formatName(action.method),
            parameters: [...this.getParameters(action.sequence)],
            hasStore: this.getStoreFlagValue(action.sequence),
            body: [...this.getBodyDefinitions(action.sequence)],
          },
        });
      }
    }

    return commands;
  }

  public generate() {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    this.flow.functionalities = this.getFunctionalities(this.rawFlow.graph);
    for (const func of this.flow.functionalities) {
      console.log('');
      console.log('++ Folder : ' + func.group);
      for (const spec of func.specs) {
        console.log('FileName: ' + spec.file);
        console.log('Before All:');
        for (const test of spec.beforeAll) {
          console.log(' |- ' + test.name + `(${test.method.name})`);
          console.log(test.method);
        }
        console.log('');
        console.log('Tests:');
        for (const test of spec.tests) {
          console.log(' |- ' + test.name + `(${test.method.name})`);
          console.log(test.method);
        }
      }
    }

    this.flow.selectors = this.getSelectors();
    console.log('>>>>>>>>>>>>> Selectors >>>>>>');
    for (const selector of this.flow.selectors) {
      console.log(selector);
    }

    this.flow.commands = this.getCommands();
    console.log('********** Commands **********');
    for (const command of this.flow.commands) {
      console.log(command.method.body);
    }
  }
}
