import { Config } from '@marvin/discovery';
import { ConfigModel } from './models/config';
import { Command, NewFlowModel } from './models/models';
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

  private generateCommands(commands: Command[]) {
    for (const command of commands) {
      const { file, method } = command;
      const commandFile = `${this.localFolder}/commands/${file}`;
      const { name, parameters, hasStore, body } = method;
      console.log('!!!!!');
      console.log(body);
      const paramNames = parameters.map((p) => p.key);
      const params = hasStore ? [...paramNames, 'store'] : paramNames;
      const fileContent = `
Cypress.Commands.add('${name}', (${params.join(', ')}) => {
    ${body.map((b) => {})}            
});
      `;

      fs.writeFileSync(commandFile, fileContent);
    }
  }

  public async generate() {
    //your code here
    await this.generateCommands(this.flow.commands);
  }
}
