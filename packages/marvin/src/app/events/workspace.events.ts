/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { ipcMain, dialog } from 'electron';
import { environment } from '../../environments/environment';
import * as Store from 'electron-store';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';

import { Flow, Discovery, Runner, State } from '@marvin/discovery';

const store = new Store();

if (!store.get('workspaces')) {
  store.set('workspaces', []);
}

export default class WorkspaceEvents {
  static bootstrapWorkspaceEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

function getConfig() {
  const workspace = store.get('lastWorkspace');

  if (workspace && fs.existsSync(`${workspace}/config.json`)) {
    return JSON.parse(fs.readFileSync(`${workspace}/config.json`, 'utf8'));
  } else {
    return {};
  }
}

function getDiscovered() {
  const workspace = store.get('lastWorkspace');

  if (workspace && fs.existsSync(`${workspace}/output.json`)) {
    return JSON.parse(fs.readFileSync(`${workspace}/output.json`, 'utf8'));
  }

  return null;
}

function getFlow() {
  const workspace = store.get('lastWorkspace');

  if (workspace && fs.existsSync(`${workspace}/flow.json`)) {
    return JSON.parse(fs.readFileSync(`${workspace}/flow.json`, 'utf8'));
  }

  return null;
}

ipcMain.handle('get-workspaces', (event) => {
  return store.get('workspaces');
});

ipcMain.handle('get-workspace', (event) => {
  return store.get('lastWorkspace');
});

ipcMain.handle('select-new-workspace-folder', async (event) => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then((data) => {
    if (data.filePaths.length > 0) {
      const workspace = data.filePaths[0];
      const workspaces = store.get('workspaces') as string[];

      if (workspaces.includes(workspace)) {
        return;
      }

      workspaces.push(workspace);
      store.set('workspaces', workspaces);
      store.set('lastWorkspace', workspace);
    }
  });
});

ipcMain.handle('get-config', () => {
  return getConfig();
});

ipcMain.handle('set-config', (event, config) => {
  const workspace = store.get('lastWorkspace');

  if (workspace) {
    fs.writeFileSync(
      `${workspace}/config.json`,
      JSON.stringify(config, undefined, 2)
    );
  }

  return config;
});

ipcMain.handle('get-discovered', () => {
  return getDiscovered();
});

ipcMain.handle('get-flow', () => {
  return getFlow();
});

ipcMain.handle('run-discovery', async (event, sequence: string[]) => {
  const config = getConfig();
  const workspace = store.get('lastWorkspace');
  config.path = workspace;
  if (!fs.existsSync(`${workspace}/screenshots`)) {
    fs.mkdirSync(`${workspace}/screenshots`);
  }
  const browser = await puppeteer.launch({ headless: true });
  const flow = new Flow(config, browser);
  const page = await flow.navigateTo(config.rootUrl);
  const state = new State(page);
  // const state = undefined;

  await page.setRequestInterception(true);

  await page.waitForNetworkIdle({ timeout: config.defaultTimeout });

  const runner = new Runner(config, flow, state);
  await runner.run(page, sequence);

  // // log('Taking screenshot', 'yellow');
  await flow.discover(page, true);
  // await flow.stateScreenshot(page, 'runstate');

  flow.export();
});
