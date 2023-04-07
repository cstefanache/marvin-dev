import { ConfigModel, Iterator } from './models/config';
import { Identifier } from './models/models';
import * as constants from './utils/constants';
import { getCheckTextCommand, sanitizeKey } from './utils/utils';
import * as prettier from 'prettier';
import * as shell from 'shelljs';
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
  private workspacePath: string;

  constructor(
    private flow: NewFlowModel,
    private config: ConfigModel,
    private forcedOutputPath?: string
  ) {
    this.outputPath = forcedOutputPath
      ? forcedOutputPath
      : path.join(process.cwd(), this.config.outputPath);

    this.workspacePath = !this.outputPath.includes(
      constants.DEFAULT_OUTPUT_PATH
    )
      ? `${this.outputPath}/cypress`
      : undefined;

    this.localSupportFolder = path.join(
      forcedOutputPath ? '' : '',
      this.workspacePath
        ? `${this.workspacePath}/support`
        : `${this.outputPath}/support`
    );

    this.localTestFolder = path.join(
      forcedOutputPath ? '' : '',
      this.workspacePath
        ? `${this.workspacePath}/e2e`
        : `${this.outputPath}/e2e`
    );

    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath);
    }

    if (this.workspacePath && !fs.existsSync(this.workspacePath)) {
      fs.mkdirSync(this.workspacePath);
    }

    if (fs.existsSync(this.workspacePath)) {
      shell.exec(`cd ${this.outputPath} && npm init -y`);
      if (!fs.existsSync(`${this.outputPath}/node_modules`)) {
        shell.exec(
          `cd ${this.outputPath} && npm install cypress cypress-localstorage-commands cypress-network-idle --save-dev`
        );
        if (!fs.existsSync(`${this.outputPath}/cypress.config.js`)) {
          const cypressConfigContent = `const { defineConfig } = require("cypress");

          module.exports = defineConfig({
            e2e: {
              testIsolation: false,
              setupNodeEvents(on, config) {
                // implement node event listeners here
              },
            },
          });`;
          fs.writeFileSync(
            `${this.outputPath}/cypress.config.js`,
            prettier.format(cypressConfigContent, { parser: 'typescript' })
          );
        }
      }
    }

    if (
      !fs.existsSync(this.localTestFolder) &&
      fs.existsSync(this.outputPath)
    ) {
      fs.mkdirSync(this.localTestFolder);
    }

    if (
      !fs.existsSync(this.localSupportFolder) &&
      fs.existsSync(this.outputPath)
    ) {
      fs.mkdirSync(this.localSupportFolder);
      fs.mkdirSync(`${this.localSupportFolder}/${constants.COMMAND_FOLDER}`);
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

  private replaceSingleQuotes(value: string) {
    return value.replace(/'/g, '"');
  }

  private getIteratorItemCommand(iterator: Iterator, key: string): string {
    const parent = this.replaceDoubleQuotes(iterator.parent);
    const identifier = iterator.identifier
      ? this.replaceDoubleQuotes(iterator.identifier)
      : '';
    const item = `"${parent} ${identifier}"`;
    const command = `cy.contains(${item}, ${sanitizeKey(iterator.name)})`;
    return command;
  }

  private getIteratorParentCommand(iterator: Iterator): string {
    const parent = this.replaceDoubleQuotes(iterator.parent);
    const locator = `"${parent}"`;
    const command = `closest(${locator})`;
    return command;
  }

  private getIteratorCommand(bodyItem: BodyDefinition) {
    const { element, action } = bodyItem;
    const { key, value, storeName, iterator } = element;
    const it: Iterator = this.getIterator(iterator.name);
    const commonPart: string = iterator.identifier
      ? `${this.getIteratorItemCommand(
          it,
          key
        )}.${this.getIteratorParentCommand(
          it
        )}.find("${this.replaceDoubleQuotes(key)}")`
      : undefined;

    return commonPart;
  }

  private formatFile(file: string) {
    const content = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, prettier.format(content, { parser: 'typescript' }));
  }

  private getBody(body: BodyDefinition[]) {
    const bodyContent = body.map((b) => {
      const { element, op, isNumber, action } = b;
      const { key, value, storeName, iterator, process } = element;
      if (!iterator) {
        if (action === constants.CLICK_ACTION) {
          return `cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
            key
          )}`}).click({force: true});
          cy.waitForNetworkIdle(1000);`;
        }

        if (
          action === constants.CLEAR_AND_FILL_ACTION ||
          action === constants.FILL_ACTION
        ) {
          return storeName === null
            ? `cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
                key
              )}`}).clear().type(${sanitizeKey(key)});`
            : `cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
                key
              )}`}).clear().type(${sanitizeKey(key)});
             ${constants.STORE_KEY_WORD}["${storeName}"] = ${sanitizeKey(
                key
              )};`;
        }

        if (action === constants.CHECK_ACTION) {
          return getCheckTextCommand(`${sanitizeKey(key)}`, op, isNumber);
        }
      } else {
        if (action === constants.CLICK_ACTION) {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.click({force: true})
            cy.waitForNetworkIdle(1000);`
            : `cy.get(${`${constants.LOCATOR_KEY_WORD}.${sanitizeKey(
                key
              )}`}).click({force: true});
              cy.waitForNetworkIdle(1000);`;
        }

        if (action === constants.CHECK_ACTION) {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.invoke('val').then((val) => {
              if (val.trim() === '') {
                ${this.getIteratorCommand(b)}.invoke('text').then((text) => {
                    expect(text.trim().replace(/\\n/g, ' ')${process}).to.eq(${sanitizeKey(key)});
                  });
              } else {
                ${this.getIteratorCommand(b)}.invoke('val').then((val) => {
                    expect(val.trim().replace(/\\n/g, ' ')${process}).to.eq(${sanitizeKey(key)});
                  });
              }
              });`
            : getCheckTextCommand(sanitizeKey(key), op, isNumber);
        }
      }
    });

    return bodyContent;
  }

  private getParams(method: any) {
    const { parameters, hasStore, hasIterator } = method;
    console.log('##### ' + method.name);
    const paramNames = parameters.reduce((memo, p) => {
      if (p.iterator) {
        memo.push(sanitizeKey(p.iterator.name));
      }
      memo.push(sanitizeKey(p.key));
      
      return memo;
    }, []);
    let params = paramNames.length > 0 ? paramNames : [];
    if (hasStore) {
      return (params = [...paramNames, constants.STORE_KEY_WORD]);
    }
    console.log(params);
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
    const e2eFile = this.workspacePath
      ? `${this.localSupportFolder}/e2e.js`
      : `${this.localSupportFolder}/e2e.ts`;

    const data = fs.existsSync(e2eFile)
      ? fs.readFileSync(e2eFile, 'utf8')
      : undefined;

    if (data && data.includes(constants.MARVIN_GENERATED_COMMENT)) {
      fs.unlinkSync(e2eFile);
    }

    if (!fs.existsSync(e2eFile)) {
      fs.appendFileSync(e2eFile, `${constants.MARVIN_GENERATED_COMMENT} \r\n`);
      fs.appendFileSync(e2eFile, `import 'cypress-network-idle';`);
      fs.appendFileSync(
        e2eFile,
        `
      Cypress.on('uncaught:exception', (err, runnable) => {
        return false;
      });
      Cypress.on('load', (err, runnable) => {
        return false;
      });
      `
      );
      for (const command of commands) {
        const { file, methods } = command;
        const commandFile = `${this.localSupportFolder}/${constants.COMMAND_FOLDER}/${file}`;
        let importLocation: string = this.getRelativePath(
          `${this.localSupportFolder}/commands`,
          `${this.localSupportFolder}/app.po.ts`
        );
        fs.appendFileSync(
          e2eFile,
          `import './commands/${file}';
          `
        );
        if (methods.length > 0) {
          fs.writeFileSync(
            commandFile,
            `
          ${constants.MARVIN_GENERATED_COMMENT} \n\r
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
    }
  }

  private sanitizeValue(str: string): string {
    return this.replaceSingleQuotes(str);
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
    return filterDuplicateObjects;
  }

  private async generateSelectors(selectors: any[]) {
    const selectorFile = `${this.localSupportFolder}/app.po.${
      this.workspacePath ? 'js' : 'ts'
    }`;
    let fileContent: string = '';

    const data = fs.existsSync(selectorFile)
      ? fs.readFileSync(selectorFile, 'utf8')
      : undefined;
    if (data && data.includes(constants.MARVIN_GENERATED_COMMENT)) {
      fs.unlinkSync(selectorFile);
    }

    const customSelectorFile = `${this.localSupportFolder}/app.custom.po.${
      this.workspacePath ? 'js' : 'ts'
    }`;
    if (!fs.existsSync(customSelectorFile)) {
      fs.writeFileSync(
        customSelectorFile,
        `
        // Add your custom selectors here
      `
      );
    }

    if (!fs.existsSync(selectorFile)) {
      fs.appendFileSync(
        selectorFile,
        `${constants.MARVIN_GENERATED_COMMENT}
        
         export * from './app.custom.po';

        `
      );
      for (const selector of selectors) {
        console.log(selector.value);
        fileContent = `
  export const ${sanitizeKey(selector.key)} = '${this.sanitizeValue(
          selector.value
        )}';
        `;
        fs.appendFileSync(selectorFile, fileContent);
      }
    }

    this.formatFile(selectorFile);
    this.formatFile(customSelectorFile);
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

  private getStoreCommand(tests: Test[]) {
    const storeCommands: string[] = [];
    tests.map((t) => {
      const { method } = t;
      const { name, paramValues } = method;
      for (const p of paramValues) {
        const extractVarName = this.getVariableName(p);
        for (const item of this.config.env) {
          if (item.key === extractVarName) {
            storeCommands.push(`"${extractVarName}": ${`'${item.value}'`},`);
          }
        }
      }
    });
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
        const data = fs.existsSync(specFile)
          ? fs.readFileSync(specFile, 'utf8')
          : undefined;

        if (data && data.includes(constants.MARVIN_GENERATED_COMMENT)) {
          fs.unlinkSync(specFile);
        }
        let startDescribeCommand = `
        
        describe('${file}', () => {
          let store={
          ${this.getStoreCommand(beforeAll)}
          ${this.getStoreCommand(tests)}
          };
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
          cy.getCookies().then((cookies) => {
            cookies.forEach((cookie) => {
              cy.clearCookies(cookie.name);
            });
          });   
          cy.visit('${this.config.baseUrl}');
          ${this.getBeforeAllBody(beforeAll).join('\r\n')}
        });`;

        const finalOutput =
          `${constants.MARVIN_GENERATED_COMMENT}` +
          startDescribeCommand +
          beforeAllContent +
          this.getTestsBody(tests).join('\r\n') +
          endDescribeCommand;
        if (!fs.existsSync(specFile)) {
          try {
            fs.writeFileSync(
              specFile,
              prettier.format(finalOutput, { parser: 'typescript' })
            );
          } catch (err) {
            console.error('Error wring file: ' + specFile);
            fs.writeFileSync(specFile, finalOutput);
          }
        }
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
