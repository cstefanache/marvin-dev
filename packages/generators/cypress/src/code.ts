import { Config } from '@marvin/discovery';
import { ConfigModel, Iterator } from './models/config';
import {
  Command,
  NewFlowModel,
  BodyDefinition,
  MethodDefinition,
} from './models/models';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';

export default class CypressCodeGenerator {
  private localFolder: string;

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

  private getIterator(iteratorName: string): Iterator {
    return this.config.iterators.find((i) => i.name === iteratorName);
  }

  private replaceDoubleQuotes(value: string) {
    return value.replace(/"/g, "'");
  }

  private getIteratorItemCommand(
    iterator: Iterator,
    value: string = '`${iteratorValue}`'
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
          return `cy.get('${value}').click();`;
        }

        if (action === 'clearAndFill' || action === 'fill') {
          return storeName === null
            ? `cy.get('${value}').clear().type(${key});`
            : `cy.get('${value}').clear().type(${key});
             store.${storeName} = ${key};`;
        }

        if (action === 'check') {
          return `cy.get('${value}').should('have.text', ${key} || 'have.value', ${key});`;
        }
      } else {
        if (action === 'click') {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(b)}.click()`
            : `cy.get('${value}').click();`;
        }

        if (action === 'check') {
          return this.getIteratorCommand(b)
            ? `${this.getIteratorCommand(
                b
              )}.should('have.text', ${key} || 'have.value', ${key})`
            : `cy.get('${value}').should('have.text', ${key} || 'have.value', ${key});`;
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
      return (params = [...paramNames, 'store']);
    }
    if (hasIterator) {
      return (params = [...paramNames, 'iteratorValue']);
    }
    if (hasStore && hasIterator) {
      return (params = [...paramNames, 'iteratorValue', 'store']);
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
      for (const method of methods) {
        await this.writeMethod(commandFile, method);
      }
    }
  }

  public async generate() {
    await this.generateCommands(this.flow.commands);
  }
}
