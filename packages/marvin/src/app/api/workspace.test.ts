import Workspace from './workspace';
import * as fs from 'fs';
import { it, describe, expect, beforeAll, afterAll } from '@jest/globals';
const assetsFolder = `${process.cwd()}/packages/marvin/testworkspace`;

describe('Workspace tests', () => {
  let workspace: any;

  beforeAll(async () => {
    workspace = new Workspace();
    await workspace.initialize(
      assetsFolder,
      'Marvin Test Config',
      'https://www.google.com'
    );
  });

  it('Expect to have workspace initialized', async () => {
    const config = workspace.getConfig();
    expect(config.name).toEqual('Marvin Test Config');
    expect(config.rootUrl).toEqual('https://www.google.com');
  });



});
