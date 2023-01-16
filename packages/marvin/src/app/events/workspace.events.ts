/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { ipcMain, dialog } from 'electron';
import * as Store from 'electron-store';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

import { Flow, Runner, State } from '@marvin/discovery';
import App from '../app';

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
    const config = JSON.parse(fs.readFileSync(`${workspace}/config.json`, 'utf8'));
    if (!config.aliases) {
      config.aliases = {}
    }
    return config
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

ipcMain.handle('get-workspaces', () => {
  return store.get('workspaces');
});

ipcMain.handle('get-workspace', () => {
  return store.get('lastWorkspace');
});

ipcMain.handle('select-new-workspace-folder', async () => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then((data) => {

    if (data.filePaths.length > 0) {
      const workspace = data.filePaths[0];
      const workspaceName = path.dirname(workspace).split('/').pop().replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase());
      const workspaces = store.get('workspaces') as {name: string, path: string}[];

      if (workspaces && workspaces.some(ws => ws.path === workspace)) {
        return;
      }

      workspaces.push({ path: workspace, name: workspaceName });
      store.set('workspaces', workspaces);
      store.set('lastWorkspace', { path: workspace, name: workspaceName });
    }
  });
});

ipcMain.handle('get-config', () => {
  return getConfig();
});

ipcMain.handle('get-workspace-path', (id) => {
  const workspace = store.get('lastWorkspace');
  if (fs.existsSync(`${workspace}`)) {
    return workspace;
  }
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

ipcMain.handle('set-flow', (event, flow) => {
  const workspace = store.get('lastWorkspace');

  if (workspace) {
    fs.writeFileSync(
      `${workspace}/flow.json`,
      JSON.stringify(flow, undefined, 2)
    );
  }
})

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
  await runner.run(page, sequence, (actionId: string) => {
    App.mainWindow.webContents.send('action-finished', actionId);
  });

  App.mainWindow.webContents.send('run-completed')

  await flow.discover(page, true);
  await flow.export();
  // await flow.stateScreenshot(page, 'runstate');

  flow.export();
});
