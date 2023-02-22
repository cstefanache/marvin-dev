import { Config } from '@marvin/discovery';
import { ConfigModel, Iterator } from './models/config';
import {
  Command,
  NewFlowModel,
  BodyDefinition,
  MethodDefinition,
  Selector,
} from './models/models';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { camelCase } from 'lodash';

export default class CypressCodeGenerator {
  private localFolder: string;
  private locatorKeyWord = 'locators';
  private iteratorValueKewWord = 'iteratorValue';
  private storeKeyWord = 'store';

  constructor(private flow: NewFlowModel, private config: ConfigModel) {
    this.localFolder = path.join(
      process.cwd(),
      '/packages/sample-frontend-e2e/src/support'
    );

    if (fs.existsSync(this.localFolder)) {
      fs.rmdirSync(this.localFolder, { recursive: true });
    }

    if (!fs.existsSync(this.localFolder)) {
      fs.mkdirSync(this.localFolder);
      fs.mkdirSync(`${this.localFolder}/commands`);
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
    const { element, iteratorName, action } = bodyItem;
    const { key, value, storeName } = element;
    const iterator: Iterator = this.getIterator(iteratorName);
    const siblings: string[] = iterator.siblings;
    const siblingElement: string = siblings.find((s) => s === value);
    const commonPart: string = siblingElement
      ? `${this.getIteratorItemCommand(
          iterator
        )}.${this.getIteratorParentCommand(
          iterator
        )}.siblings().find("${this.replaceDoubleQuotes(siblingElement)}")`
      : undefined;

    return commonPart;
  }

  private getBody(body: BodyDefinition[]) {
    const bodyContent = body.map((b) => {
      const { element, iteratorName, action } = b;
      const { key, value, storeName } = element;

      if (!iteratorName) {
        if (action === 'click') {
          return `cy.get(${`${this.locatorKeyWord}.${key}`}).click();`;
        }

        if (action === 'clearAndFill' || action === 'fill') {
          return storeName === null
            ? `cy.get(${`${this.locatorKeyWord}.${key}`}).clear().type(${key});`
            : `cy.get(${`${this.locatorKeyWord}.${key}`}).clear().type(${key});
             ${this.storeKeyWord}.${storeName} = ${key};`;
        }

        if (action === 'check') {
          return `cy.get(${`${this.locatorKeyWord}.${key}`}).should('have.text', ${key} || 'have.value', ${key});`;
        }
      } else {
        if (action === 'click') {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.click()`
            : `cy.get(${`${this.locatorKeyWord}.${key}`}).click();`;
        }

        if (action === 'check') {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(
                b
              )}.should('have.text', ${key} || 'have.value', ${key})`
            : `cy.get(${`${this.locatorKeyWord}.${key}`}).should('have.text', ${key} || 'have.value', ${key});`;
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
      const commandFile = `${this.localFolder}/commands/${file}`;
      let importLocation: string = this.getRelativePath(
        `${this.localFolder}/commands`,
        `${this.localFolder}/app.po.ts`
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
        sel = selector.replace(k, camelCase(`${k} ${k}`));
        break;
      }
    }
    return sel;
  }

  private async getUniqueSelectors(locators: Selector[]) {
    let allSelectors: any[] = [];
    let filterDuplicates: any[] = [];
    for (const locator of locators) {
      const { selectors } = locator;
      for (const selector of selectors) {
        allSelectors.push(selector);
      }
    }
    filterDuplicates = allSelectors.filter(
      (v, i, a) => a.findIndex((t) => t.key === v.key) === i
    );

    for (const selector of filterDuplicates) {
      selector.key = this.replaceKeyWord(selector.key);
    }

    return filterDuplicates;
  }

  private async generateSelectors(selectors: any[]) {
    const selectorFile = `${this.localFolder}/app.po.ts`;
    let fileContent: string = '';
    for (const selector of selectors) {
      fileContent = `
export const ${selector.key} = '${selector.value}';
      `;
      fs.appendFileSync(selectorFile, fileContent);
    }
  }

  public async generate() {
    await this.generateCommands(this.flow.commands);
    await this.generateSelectors(
      await this.getUniqueSelectors(this.flow.selectors)
    );
  }
}
