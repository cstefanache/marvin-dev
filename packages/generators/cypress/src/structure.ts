import * as fs from 'fs';
import { log } from '../../../discovery/src/utils/logger';
import * as constants from './utils/constants';
import * as regex from './utils/regex';
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
import { ConfigModel } from './models/config';

export default class Structure {
  paramKeys: { [key: string]: string[] } = {};
  rawFlow: FlowModel;
  rawConfig: Config;
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

  constructor(private inputPath: string) {
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

    this.prepareStructure();
  }

  private getNameFromLocator(locator: string) {
    let name: string = locator;
    const reg = RegExp(`${regex.STRING_STARTS_WITH_NUMBERS}`, 'g');
    if (locator.includes('#')) {
      name = locator.split('#')[1];
      if (reg.test(name)) {
        name = name.replace(reg, '_');
      }
    }
    return name;
  }

  private toCamelCase(str: String) {
    return camelCase(str);
  }

  private getParamType(param: any) {
    if (isNaN(param)) {
      if (param.startsWith('$') || param.includes('${library.func')) {
        return 'reference';
      } else {
        return 'string';
      }
    } else {
      return 'number';
    }
  }

  private getTest(actionItem: ActionItem): Test {
    let paramValuesQueue: string[] = [];
    const { method, methodUid } = actionItem;
    const paramOrder = this.paramKeys[methodUid || method];
    if (actionItem.parameters) {
      for (const paramKey of paramOrder || Object.keys(actionItem.parameters)) {
        if (actionItem.parameters[paramKey] === undefined) {
          continue;
        }
        if (
          this.getParamType(actionItem.parameters[paramKey]) === 'reference'
        ) {
          const param = `'${actionItem.parameters[paramKey]}'`;
          paramValuesQueue.push(param.replace(new RegExp("'", 'g'), '`'));
        }
        if (this.getParamType(actionItem.parameters[paramKey]) === 'string') {
          paramValuesQueue.push(`'${actionItem.parameters[paramKey]}'`);
        }

        if (this.getParamType(actionItem.parameters[paramKey]) === 'number') {
          paramValuesQueue.push(`${actionItem.parameters[paramKey]}`);
        }
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
        : `${lastGroupName}/${this.toCamelCase(actionItem.sequenceStep)}`;

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
          step.locator,
          // step.details.trim() === ''
          //   ? this.getNameFromLocator(step.locator)
          //   : this.toCamelCase(step.details),
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
          key: step.locator,
            // step.details.trim() === ''
            //   ? this.getNameFromLocator(step.locator)
            //   : this.toCamelCase(step.details),
          value: step.locator,
          storeName: step.storeName ? step.storeName : null,
        },
        iteratorName: iterator,
        iteratorLocator: iterator ? step.locator : undefined,
        action: step.type,
        op: step.op ? step.op : undefined,
        isNumber: step.isNumber ? step.isNumber : undefined,
      });
    }
    return definitions;
  }

  private getStoreFlagValue(sequence: any) {
    return sequence.find((step: any) => step.store === true) ? true : false;
  }

  private getParameters(action: any) {
    const params: Identifier[] = [];
    const { method, uid: methodUid } = action;
    const paramsOrder: string[] = [];
    for (const step of action.sequence) {
      const { uid, locator, details } = step;
      const keyName = step.locator
        // step.details.trim() === ''
        //   ? this.getNameFromLocator(locator)
        //   : this.toCamelCase(details);
      paramsOrder.push(uid);
      if (
        step.type === constants.CLEAR_AND_FILL_ACTION ||
        step.type === constants.FILL_ACTION ||
        step.type === constants.CHECK_ACTION
      ) {
        step.store
          ? params.push({
              key: keyName,
              storeName: step.storeName ? step.storeName : undefined,
            })
          : params.push({
              key: keyName,
            });
      }
    }
    if (action.iterator) {
      paramsOrder.push(action.iterator.uid);
    }
    this.paramKeys[methodUid || method] = paramsOrder;
    return params;
  }

  private getCommandFileName(key: string): string {
    return key.trim() === '' || key.trim() === '/'
      ? 'rootPage'
      : this.toCamelCase(key);
  }

  private getIteratorLocator(sequence: any[]): string {
    return sequence[0].locator;
  }

  private getMethods(actions: any[]) {
    const methods: MethodDefinition[] = [];
    for (const action of actions) {
      methods.push({
        name: this.toCamelCase(action.method),
        parameters: [...this.getParameters(action)],
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
    for (const sibling of iterator.elements || []) {
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

  public prepareStructure() {
    this.flow.selectors = this.getSelectors();
    this.config.iterators = this.getIterators();
    this.flow.commands = this.getCommands();
    this.flow.functionalities = this.getFunctionalities(this.rawFlow.graph);
    this.config.baseUrl = this.rawConfig.rootUrl;
    this.config.outputPath =
      !this.rawConfig.outputPath || this.rawConfig.outputPath.trim() === ''
        ? constants.DEFAULT_OUTPUT_PATH
        : this.rawConfig.outputPath;
    this.rawConfig.aliases.store && this.rawConfig.aliases.store.length > 0
      ? (this.config.env = this.rawConfig.aliases.store)
      : (this.config.env = []);
  }
}
