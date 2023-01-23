/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { ipcMain, dialog } from 'electron';
import * as Store from 'electron-store';
import * as fs from 'fs';
import * as path from 'path';


import App from '../app';
import Workspace from '../api/workspace';
import getLog from '../api/logging';

const logger = getLog('marvin:workspace');

const store = new Store();
let workpace: Workspace;

if (!store.get('workspaces')) {
  store.set('workspaces', []);
}

const lastWorkspace: any = store.get('lastWorkspace');
if (lastWorkspace) {
  workpace = new Workspace();
  workpace.initialize(lastWorkspace.path, lastWorkspace.name);
}

export default class WorkspaceEvents {
  static bootstrapWorkspaceEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

ipcMain.handle('get-workspace-path', (id) => {
  const workspace: any = store.get('lastWorkspace');

  if (fs.existsSync(`${workspace.path}`)) {
    return workspace.path;
  }
});

ipcMain.handle('get-workspaces', () => {
  return store.get('workspaces');
});

ipcMain.handle('get-workspace', () => {
  return lastWorkspace;
});

ipcMain.handle('get-flow', () => {
  return workpace.getFlow();
});

ipcMain.handle('get-methods-for-path', (_, path) => {
  return workpace.getMethodsForPath(path);
});

ipcMain.handle('get-discovered-for-path', (_, path) => {
  return workpace.getDiscoveredForPath(path);
});

ipcMain.handle('get-config', () => {
  return workpace.getConfig();
});

ipcMain.handle('run-discovery', async (event, sequence: string[]) => {
  await workpace.run(sequence, (actionId: string) => {
    console.log('sending back', actionId);
    App.mainWindow.webContents.send('action-finished', actionId);
  });
  App.mainWindow.webContents.send('run-completed');
});

ipcMain.handle('select-workspace', async (event, data) => {
  store.set('lastWorkspace', { path: data.path, name: data.name });
  logger.log('Workspace selected ' + data.path);
  workpace = new Workspace();
  workpace.initialize(data.path, data.name);
});

ipcMain.handle('select-new-workspace-folder', async (data) => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then((data) => {
    console.log('>>>> ', data);
    if (data.filePaths.length > 0) {
      const workspace = data.filePaths[0];

      const workspaceName = path
        .dirname(workspace)
        .split('/')
        .pop()
        .replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) =>
          letter.toUpperCase()
        );
      const workspaces = store.get('workspaces') as {
        name: string;
        path: string;
      }[];

      if (workspaces && workspaces.some((ws) => ws.path === workspace)) {
        return;
      }

      workspaces.push({ path: workspace, name: workspaceName });
      store.set('workspaces', workspaces);
      store.set('lastWorkspace', { path: workspace, name: workspaceName });
    }
  });
});
