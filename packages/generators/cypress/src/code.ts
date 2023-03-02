import { ConfigModel, Iterator } from './models/config';
import * as constants from './utils/constants';
import * as regex from './utils/regex';
import * as prettier from 'prettier';
import {
  Command,
  NewFlowModel,
  BodyDefinition,
  MethodDefinition,
  Selector,
  Functionality,
  Test,
} from './models/models';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
export default class CypressCodeGenerator {
  private localSupportFolder: string;
  private localTestFolder: string;
  private outputPath: string;

  constructor(
    private flow: NewFlowModel,
    private config: ConfigModel,
    private forcedOutputPath?: string
  ) {
    this.outputPath = forcedOutputPath
      ? forcedOutputPath
      : this.config.outputPath;
    this.localSupportFolder = path.join(
      forcedOutputPath ? '' : process.cwd(),
      `${this.outputPath}/support`
    );

    this.localTestFolder = path.join(
      forcedOutputPath ? '' : process.cwd(),
      `${this.outputPath}/e2e`
    );

    if (!fs.existsSync(this.localTestFolder)) {
      fs.mkdirSync(this.localTestFolder);
    }

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
    value: string = `${constants.ITERATOR_VALUE_KEY_WORD}`
  ): string {
    const parent = this.replaceDoubleQuotes(iterator.parent);
    const identifier = iterator.identifier
      ? this.replaceDoubleQuotes(iterator.identifier)
      : '';
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
    return `  cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
      key
    )}`}).invoke('val').then((val) => {
      if (val.trim() === '') {
        cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
          key
        )}`}).invoke('text').then((text) => {
            expect(text.trim()).to.eq(${this.sanitizeKey(key)});
          });
      } else {
        cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
          key
        )}`}).invoke('val').then((val) => {
            expect(val.trim()).to.eq(${this.sanitizeKey(key)});
          });
        }
    });`;
  }

  private formatFile(file: string) {
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, prettier.format(content, { parser: 'typescript' }));
  }

  private getBody(body: BodyDefinition[]) {
    const bodyContent = body.map((b) => {
      const { element, iteratorName, action } = b;
      const { key, value, storeName } = element;
      if (!iteratorName) {
        if (action === constants.CLICK_ACTION) {
          return `cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
            key
          )}`}).click();
          cy.waitForNetworkIdle(1000);`;
        }

        if (
          action === constants.CLEAR_AND_FILL_ACTION ||
          action === constants.FILL_ACTION
        ) {
          return storeName === null
            ? `cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
                key
              )}`}).clear().type(${this.sanitizeKey(key)});`
            : `cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
                key
              )}`}).clear().type(${this.sanitizeKey(key)});
             ${
               constants.STORE_KEY_WORD
             }["${storeName}"] = ${this.replaceKeyWord(key)};`;
        }

        if (action === constants.CHECK_ACTION) {
          return this.getCheckTextCommand(`${this.replaceKeyWord(key)}`);
        }
      } else {
        if (action === constants.CLICK_ACTION) {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.click()
            cy.waitForNetworkIdle(1000);`
            : `cy.get(${`${constants.LOCATOR_KEY_WORD}.${this.sanitizeKey(
                key
              )}`}).click();
              cy.waitForNetworkIdle(1000);`;
        }

        if (action === constants.CHECK_ACTION) {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.invoke('val').then((val) => {
              if (val.trim() === '') {
                ${this.getIteratorCommand(b)}.invoke('text').then((text) => {
                    expect(text.trim()).to.eq(${this.sanitizeKey(key)});
                  });
              } else {
                ${this.getIteratorCommand(b)}.invoke('val').then((val) => {
                    expect(val.trim()).to.eq(${this.sanitizeKey(key)});
                  });
              }
              });`
            : this.getCheckTextCommand(this.sanitizeKey(key));
        }
      }
    });

    return bodyContent;
  }

  private getParams(method: any) {
    const { parameters, hasStore, hasIterator } = method;
    const paramNames = parameters.map((p) => this.sanitizeKey(p.key));
    let params = paramNames.length > 0 ? paramNames : [];
    if (hasStore) {
      return (params = [...paramNames, constants.STORE_KEY_WORD]);
    }
    if (hasIterator) {
      return (params = [...paramNames, constants.ITERATOR_VALUE_KEY_WORD]);
    }
    if (hasStore && hasIterator) {
      return (params = [
        ...paramNames,
        constants.ITERATOR_VALUE_KEY_WORD,
        constants.STORE_KEY_WORD,
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
    const e2eFile = `${this.localSupportFolder}/e2e.ts`;
    fs.appendFileSync(e2eFile, `import 'cypress-network-idle';`);
    for (const command of commands) {
      const { file, methods } = command;
      const commandFile = `${this.localSupportFolder}/commands/${file}`;

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
      this.formatFile(commandFile);
    }
    this.formatFile(e2eFile);
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

    // for (const selector of filterDuplicateObjects) {
    //   selector.key = this.replaceKeyWord(selector.key);
    // }
    // filterDuplicateObjects.findIndex((v, i, a) => {
    //   if (a.findIndex((t) => t.key === v.key) !== i) {
    //     v.key = `_${v.key}`;
    //   }
    // });

    return filterDuplicateObjects;
  }

  private sanitizeKey(key: string): string {
    let finalKey = key.replace(/\./g, '').replace(/[> \[\]=":\-\(\)]/g, '');

    if (/^\d/.test(finalKey)) {
      finalKey = `_${finalKey}`;
    }

    if (['delete', 'new'].find((k) => k === finalKey)) {
      finalKey = `_${finalKey}`;
    }
    return finalKey;
  }

  private async generateSelectors(selectors: any[]) {
    const selectorFile = `${this.localSupportFolder}/app.po.ts`;
    let fileContent: string = '';
    for (const selector of selectors) {
      fileContent = `
export const ${this.sanitizeKey(selector.key)} = '${selector.value}';
      `;
      console.log('selector', selector, fileContent);
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
        ? (paramValues = [...paramValues, `${constants.STORE_KEY_WORD}`])
        : (paramValues = [...paramValues]);
      const params = paramValues.length > 0 ? paramValues.join(', ') : '';
      return `
      
      it('${name}', () => {
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
        ? (paramValues = [...paramValues, `${constants.STORE_KEY_WORD}`])
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
        let endDescribeCommand = `})`;
        let beforeAllContent = `
        
        before( () => {
          cy.on('uncaught:exception', (err, runnable) => {
            return false;
          });
          cy.on('load', (err, runnable) => {
            return false;
          });
          cy.visit('${this.config.baseUrl}');
          ${this.getBeforeAllBody(beforeAll).join('\r\n')}
        });`;

        const finalOutput =
          startDecribeCommand +
          beforeAllContent +
          this.getTestsBody(tests).join('\r\n') +
          endDescribeCommand;
        fs.writeFileSync(
          specFile,
          prettier.format(finalOutput, { parser: 'typescript' })
        );
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
