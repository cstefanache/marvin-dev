import * as fs from 'fs';
import { log } from '../../../discovery/src/utils/logger';
import { ActionItem, FlowModel } from '../../../discovery/src/models/models';
import { Config } from '@marvin/discovery';
import { camelCase } from 'lodash';
import {
  NewFlowModel,
  Functionality,
  Test,
  Identifier,
  MethodDefinition,
} from './models/models';
import { ConfigModel, Iterator } from './models/config';
export default class Structure {
  rawFlow: FlowModel;
  rawConfig: Config;
  inputPath: string = 'output/marvin2';
  flow: NewFlowModel = {
    functionalities: [],
    selectors: [],
    commands: [],
  };
  config: ConfigModel = {
    projectName: '',
    baseUrl: '',
    inputPath: '',
    outputPath: '',
    iterators: [],
    env: [],
    specsFolder: '',
    selectorsFolder: '',
    commandsFolder: '',
  };

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

  private getNameFromLocator(locator: string) {
    let name: string = '';
    if (locator.includes('#')) {
      name = locator.split('#')[1];
    }
    return name;
  }

  private toCamelCase(str: String) {
    return camelCase(str);
  }

  private getTest(actionItem: ActionItem): Test {
    let paramValuesQueue: string[] = [];

    if (actionItem.parameters) {
      for (const paramKey of Object.keys(actionItem.parameters)) {
        paramValuesQueue.push(`${actionItem.parameters[paramKey]}`);
      }
    }
    return {
      name: this.toCamelCase(actionItem.sequenceStep),
      method: {
        name: this.toCamelCase(actionItem.method),
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
              file: this.toCamelCase(actionItem.sequenceStep) + '.spec.cy.js',
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
          step.details.trim() === ''
            ? this.getNameFromLocator(step.locator)
            : this.toCamelCase(step.details),
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
          file: this.toCamelCase(action.method) + '.po.js',
          selectors: [...this.getSelectorIdentifiers(action.sequence)],
        });
      }
    }
    return selectors;
  }

  private getIteratorFlag(action: any) {
    return action.iterator ? true : false;
  }

  private getBodyDefinitions(sequence: any, iterator: string = undefined) {
    const definitions: any[] = [];
    for (const step of sequence) {
      definitions.push({
        element: {
          key:
            step.details.trim() === ''
              ? this.getNameFromLocator(step.locator)
              : this.toCamelCase(step.details),
          value: step.locator,
          storeName: step.storeName ? step.storeName : null,
        },
        iteratorName: iterator,
        action: step.type,
      });
    }
    return definitions;
  }

  private getStoreFlagValue(sequence: any) {
    return sequence.find((step: any) => step.store === 'true') ? true : false;
  }

  private getParameters(sequence: any) {
    const params: Identifier[] = [];
    for (const step of sequence) {
      if (
        step.type === 'clearAndFill' ||
        step.type === 'fill' ||
        step.type === 'check'
      ) {
        step.store
          ? params.push({
              key:
                step.details.trim() === ''
                  ? this.getNameFromLocator(step.locator)
                  : this.toCamelCase(step.details),
              storeName: step.storeName ? step.storeName : false,
            })
          : params.push({
              key:
                step.details.trim() === ''
                  ? this.getNameFromLocator(step.locator)
                  : this.toCamelCase(step.details),
            });
      }
    }
    return params;
  }

  private getCommandFileName(key: string): string {
    return key.trim() === '' ? 'rootPage' : this.toCamelCase(key);
  }

  private getMethods(actions: any[]) {
    const methods: MethodDefinition[] = [];
    for (const action of actions) {
      methods.push({
        name: this.toCamelCase(action.method),
        parameters: [...this.getParameters(action.sequence)],
        hasIterator: this.getIteratorFlag(action),
        hasStore: this.getStoreFlagValue(action.sequence),
        body: this.getIteratorFlag(action)
          ? [...this.getBodyDefinitions(action.sequence, action.iterator.name)]
          : [...this.getBodyDefinitions(action.sequence)],
      });
    }
    return methods;
  }

  private getCommands() {
    const { actions } = this.rawFlow;
    let commands: any[] = [];
    for (const key of Object.keys(actions)) {
      commands.push({
        file: this.getCommandFileName(key) + '.js',
        methods: [...this.getMethods(actions[key])],
      });
    }
    return commands;
  }

  private getParent(iterator: any) {
    return iterator.selectors.join();
  }

  private getSiblings(iterator: any) {
    const siblings: string[] = [];
    for (const sibling of iterator.elements) {
      siblings.push(sibling.selector);
    }
    return siblings;
  }

  private getIterators() {
    const { iterators } = this.rawConfig.aliases;
    const array: any[] = [];
    for (const iterator of iterators) {
      array.push({
        name: iterator.name,
        parent: this.getParent(iterator),
        identifier: iterator.identifier,
        siblings: [...this.getSiblings(iterator)],
      });
    }
    return array;
  }

  public generate() {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    this.flow.functionalities = this.getFunctionalities(this.rawFlow.graph);
    // for (const func of this.flow.functionalities) {
    //   console.log('');
    //   console.log('++ Folder : ' + func.group);
    //   for (const spec of func.specs) {
    //     console.log('FileName: ' + spec.file);
    //     console.log('Before All:');
    //     for (const test of spec.beforeAll) {
    //       console.log(' |- ' + test.name + `(${test.method.name})`);
    //       console.log(test.method);
    //     }
    //     console.log('');
    //     console.log('Tests:');
    //     for (const test of spec.tests) {
    //       console.log(' |- ' + test.name + `(${test.method.name})`);
    //       console.log(test.method);
    //     }
    //   }
    // }
    this.flow.selectors = this.getSelectors();
    // console.log('>>>>>>>>>>>>> Selectors >>>>>>');
    // for (const selector of this.flow.selectors) {
    //   console.log(selector);
    // }
    this.flow.commands = this.getCommands();
    // console.log('********** Commands **********');
    // for (const command of this.flow.commands) {
    //   console.log(command.file);
    //   for (const method of command.methods) {
    //     console.log(method);
    //   }
    // }

    this.config.iterators = this.getIterators();
    // console.log('>>>>>>>>>>>>> Iterators >>>>>>');
    // for (const iterator of this.config.iterators) {
    //   console.log(iterator);
    // }
  }
}
