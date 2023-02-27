import { Config } from '@marvin/discovery';
import { ConfigModel, Iterator } from './models/config';
import {
  Command,
  NewFlowModel,
  BodyDefinition,
  MethodDefinition,
  Selector,
  Functionality,
  Test,
  MethodExecution,
} from './models/models';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { camelCase } from 'lodash';
export default class CypressCodeGenerator {
  private localSupportFolder: string;
  private localTestFolder: string;
  private locatorKeyWord = 'locators';
  private iteratorValueKewWord = 'iteratorValue';
  private storeKeyWord = 'store';

  constructor(private flow: NewFlowModel, private config: ConfigModel) {
    this.localSupportFolder = path.join(
      process.cwd(),
      '/packages/sample-frontend-e2e/src/support'
    );
    this.localTestFolder = path.join(
      process.cwd(),
      '/packages/sample-frontend-e2e/src/e2e'
    );

    if (fs.existsSync(this.localSupportFolder)) {
      fs.rmdirSync(this.localSupportFolder, { recursive: true });
    }

    if (fs.existsSync(this.localTestFolder)) {
      fs.rmdirSync(this.localTestFolder, { recursive: true });
    }

    if (!fs.existsSync(this.localSupportFolder)) {
      fs.mkdirSync(this.localSupportFolder);
      fs.mkdirSync(`${this.localSupportFolder}/commands`);
    }

    if (!fs.existsSync(this.localTestFolder)) {
      fs.mkdirSync(this.localTestFolder);
    }
  }

  private getRelativePath(from: string, to: string): string {
    return `./${path.relative(from, to)}`;
  }

  private getIterator(iteratorName: string): Iterator {
    return this.config.iterators.find((i) => i.name === iteratorName);
  }

  private replaceDoubleQuotes(value: string) {
    return value.replace(/"/g, "'");
  }

  private getIteratorItemCommand(
    iterator: Iterator,
    value: string = `${this.iteratorValueKewWord}`
  ): string {
    const parent = this.replaceDoubleQuotes(iterator.parent);
    const identifier = this.replaceDoubleQuotes(iterator.identifier);
    const item = `"${parent} ${identifier}"`;
    const command = `cy.contains(${item}, ${value})`;
    return command;
  }

  private getIteratorParentCommand(iterator: Iterator): string {
    const parent = this.replaceDoubleQuotes(iterator.parent);
    const locator = `"${parent}"`;
    const command = `parentsUntil(${locator})`;
    return command;
  }

  private getIteratorCommand(bodyItem: BodyDefinition) {
    const { element, iteratorName, iteratorLocator, action } = bodyItem;
    const { key, value, storeName } = element;
    const iterator: Iterator = this.getIterator(iteratorName);
    const commonPart: string = iteratorLocator
      ? `${this.getIteratorItemCommand(
          iterator
        )}.${this.getIteratorParentCommand(
          iterator
        )}.children("${this.replaceDoubleQuotes(iteratorLocator)}")`
      : undefined;

    return commonPart;
  }

  private getCheckTextCommand(key: string) {
    return `  cy.get(${`${this.locatorKeyWord}.${key}`}).invoke('val').then((val) => {
      if (val.trim() === '') {
        cy.get(${`${this.locatorKeyWord}.${key}`}).invoke('text').then((text) => {
            expect(text.trim()).to.eq(${key});
          });
      } else {
        cy.get(${`${this.locatorKeyWord}.${key}`}).invoke('val').then((val) => {
            expect(val.trim()).to.eq(${key});
          });
        }
    });`;
  }

  private getBody(body: BodyDefinition[]) {
    const bodyContent = body.map((b) => {
      const { element, iteratorName, action } = b;
      const { key, value, storeName } = element;

      if (!iteratorName) {
        if (action === 'click') {
          return `cy.get(${`${this.locatorKeyWord}.${this.replaceKeyWord(
            key
          )}`}).click();`;
        }

        if (action === 'clearAndFill' || action === 'fill') {
          return storeName === null
            ? `cy.get(${`${this.locatorKeyWord}.${this.replaceKeyWord(
                key
              )}`}).clear().type(${this.replaceKeyWord(key)});`
            : `cy.get(${`${this.locatorKeyWord}.${this.replaceKeyWord(
                key
              )}`}).clear().type(${this.replaceKeyWord(key)});
             ${this.storeKeyWord}["${storeName}"] = ${this.replaceKeyWord(
                key
              )};`;
        }

        if (action === 'check') {
          return this.getCheckTextCommand(`${this.replaceKeyWord(key)}`);
        }
      } else {
        if (action === 'click') {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.click()`
            : `cy.get(${`${this.locatorKeyWord}.${this.replaceKeyWord(
                key
              )}`}).click();`;
        }

        if (action === 'check') {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.invoke('val').then((val) => {
              if (val.trim() === '') {
                ${this.getIteratorCommand(b)}.invoke('text').then((text) => {
                    expect(text.trim()).to.eq(${this.replaceKeyWord(key)});
                  });
              } else {
                ${this.getIteratorCommand(b)}.invoke('val').then((val) => {
                    expect(val.trim()).to.eq(${this.replaceKeyWord(key)});
                  });
              }
              });`
            : this.getCheckTextCommand(this.replaceKeyWord(key));
        }
      }
    });

    return bodyContent;
  }

  private getParams(method: any) {
    const { parameters, hasStore, hasIterator } = method;
    const paramNames = parameters.map((p) => p.key);
    let params = paramNames.length > 0 ? paramNames : [];
    if (hasStore) {
      return (params = [...paramNames, this.storeKeyWord]);
    }
    if (hasIterator) {
      return (params = [...paramNames, this.iteratorValueKewWord]);
    }
    if (hasStore && hasIterator) {
      return (params = [
        ...paramNames,
        this.iteratorValueKewWord,
        this.storeKeyWord,
      ]);
    }
    return params;
  }

  private async writeMethod(commandFile: string, method: MethodDefinition) {
    const { name, body } = method;
    const params = this.getParams(method);
    let fileContent: string = '';
    fileContent = `
      Cypress.Commands.add('${name}', (${params.join(', ')}) => {
      ${this.getBody(body).join('\r\n')}
          });
                    `;
    fs.appendFileSync(commandFile, fileContent);
  }

  private async generateCommands(commands: Command[]) {
    for (const command of commands) {
      const { file, methods } = command;
      const commandFile = `${this.localSupportFolder}/commands/${file}`;
      const e2eFile = `${this.localSupportFolder}/e2e.ts`;
      fs.appendFileSync(
        e2eFile,
        `import './commands/${file}';
      `
      );
      let importLocation: string = this.getRelativePath(
        `${this.localSupportFolder}/commands`,
        `${this.localSupportFolder}/app.po.ts`
      );
      fs.writeFileSync(
        commandFile,
        `
  import * as locators from '${importLocation}';
        `
      );
      for (const method of methods) {
        await this.writeMethod(commandFile, method);
      }
    }
  }

  private replaceKeyWord(selector: string): string {
    let sel: string = selector;
    const keyWords = [
      'get',
      'click',
      'fill',
      'check',
      'clear',
      'delete',
      'new',
    ];
    for (const k of keyWords) {
      if (sel.includes(k)) {
        sel = `_${selector}`;
        break;
      }
    }
    return sel;
  }

  private async getUniqueSelectors(locators: Selector[]) {
    let allSelectors: any[] = [];
    let filterDuplicateObjects: any[] = [];
    for (const locator of locators) {
      const { selectors } = locator;
      for (const selector of selectors) {
        allSelectors.push(selector);
      }
    }
    filterDuplicateObjects = allSelectors.filter(
      (v, i, a) =>
        a.findIndex((t) => t.key === v.key && t.value === v.value) === i
    );

    for (const selector of filterDuplicateObjects) {
      selector.key = this.replaceKeyWord(selector.key);
    }
    filterDuplicateObjects.findIndex((v, i, a) => {
      if (a.findIndex((t) => t.key === v.key) !== i) {
        v.key = `_${v.key}`;
      }
    });

    return filterDuplicateObjects;
  }

  private async generateSelectors(selectors: any[]) {
    const selectorFile = `${this.localSupportFolder}/app.po.ts`;
    let fileContent: string = '';
    for (const selector of selectors) {
      fileContent = `
export const ${selector.key} = '${selector.value}';
      `;
      fs.appendFileSync(selectorFile, fileContent);
    }
  }

  private createGroupFolders(group: string) {
    const folderGroup: string = group;
    let basePath = this.localTestFolder;
    const folderArr: string[] = [...folderGroup.split('/')];
    for (const folder of folderArr) {
      if (!fs.existsSync(`${basePath}/${folder}`)) {
        fs.mkdirSync(`${basePath}/${folder}`);
      }
      basePath = `${basePath}/${folder}`;
    }
  }

  private getVariableName(p: string) {
    if (p.includes('${store.')) {
      return p.split('store.')[1].split('}')[0];
    }
    if (p.includes('${store["')) {
      return p.split('store["')[1].split('"]')[0];
    }
    if (p.includes("${store['")) {
      return p.split("store['")[1].split("']")[0];
    }
  }

  private getStoreCommand(params: string[]) {
    const storeCommands: string[] = [];
    for (const p of params) {
      const extractVarName = this.getVariableName(p);
      for (const item of this.config.env) {
        if (item.key === extractVarName) {
          storeCommands.push(
            `store["${extractVarName}"] = ${`'${item.value}'`};`
          );
        }
      }
    }
    return storeCommands.join('\r\n');
  }

  private getTestsBody(tests: Test[]) {
    const fileContent = tests.map((t) => {
      const { method } = t;
      let { name, paramValues } = method;
      this.getMethodDefinitionStoreFlag(name)
        ? (paramValues = [...paramValues, `${this.storeKeyWord}`])
        : (paramValues = [...paramValues]);
      const params = paramValues.length > 0 ? paramValues.join(', ') : '';
      return `it('${name}', () => {
        ${this.getStoreCommand(paramValues)}
        cy.${name}(${params});
      });`;
    });
    return fileContent;
  }

  private getMethodDefinitionStoreFlag(methodName: string) {
    for (const command of this.flow.commands) {
      const { methods } = command;
      for (const method of methods) {
        if (method.name === methodName) {
          return method.hasStore;
        }
      }
    }
  }

  private getBeforeAllBody(beforeAll: Test[]) {
    const fileContent = beforeAll.map((b) => {
      const { method } = b;
      let { name, paramValues } = method;
      this.getMethodDefinitionStoreFlag(name)
        ? (paramValues = [...paramValues, `${this.storeKeyWord}`])
        : (paramValues = [...paramValues]);
      const params = paramValues.length > 0 ? paramValues.join(', ') : '';
      return `
      ${this.getStoreCommand(paramValues)}
      cy.${name}(${`${params}`});`;
    });
    return fileContent;
  }

  private async generateFunctionalities(functionalities: Functionality[]) {
    for (const functionality of functionalities) {
      const { group, specs } = functionality;
      const groupFolder = `${this.localTestFolder}${group}`;
      this.createGroupFolders(group);
      for (const spec of specs) {
        const { file, beforeAll, tests } = spec;
        const specFile = `${groupFolder}/${file}`;
        let startDecribeCommand = `
        describe('${file}', () => {
          let store={};
          let library = {
            func: {
              random: () => {
                return Math.floor(Math.random() * 1000);
              },
            },
          };
          `;
        fs.writeFileSync(specFile, startDecribeCommand);
        let endDescribeCommand = `})`;
        let beforeAllContent = `before( () => {
          cy.visit('${this.config.baseUrl}');
          ${this.getBeforeAllBody(beforeAll).join('\r\n')}
        });`;
        fs.appendFileSync(specFile, beforeAllContent);
        fs.appendFileSync(specFile, this.getTestsBody(tests).join('\r\n'));
        fs.appendFileSync(specFile, endDescribeCommand);
      }
    }
  }

  public async generate() {
    await this.generateSelectors(
      await this.getUniqueSelectors(this.flow.selectors)
    );
    await this.generateCommands(this.flow.commands);
    await this.generateFunctionalities(this.flow.functionalities);
  }
}
