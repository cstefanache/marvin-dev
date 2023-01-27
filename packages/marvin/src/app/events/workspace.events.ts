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
let workspace: Workspace;

if (!store.get('workspaces')) {
  store.set('workspaces', []);
}

const lastWorkspace: any = store.get('lastWorkspace');
if (lastWorkspace) {
  workspace = new Workspace();
  workspace.initialize(lastWorkspace.path, lastWorkspace.name);
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
  return workspace.getFlow();
});

ipcMain.handle('get-methods-for-path', (_, path) => {
  return workspace.getMethodsForPath(path);
});

ipcMain.handle('save-method-for-url', (_, url, method) => {
  return workspace.saveMethodForUrl(url, method);
});

ipcMain.handle('add-branch', (_, id, data) => { 
  return workspace.addBranch(id, data);
})

ipcMain.handle('get-discovered-for-path', (_, path) => {
  return workspace.getDiscoveredForPath(path);
});

ipcMain.handle('get-config', () => {
  return workspace.getConfig();
});

ipcMain.handle('run-discovery', async (event, sequence: string[]) => {
  await workspace.run(sequence, (actionId: string) => {
    console.log('sending back', actionId);
    App.mainWindow.webContents.send('action-finished', actionId);
  });
  App.mainWindow.webContents.send('run-completed');
});

ipcMain.handle('get-discovered-paths', () => {
  return workspace.getDiscoveredPaths()
})

ipcMain.handle('select-workspace', async (event, data) => {
  store.set('lastWorkspace', { path: data.path, name: data.name });
  logger.log('Workspace selected ' + data.path);
  workspace = new Workspace();
  workspace.initialize(data.path, data.name);
});

ipcMain.handle('select-new-workspace-folder', async (data) => {
  dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'],  }).then((data) => {
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

      if (!fs.existsSync(`${workspace}/screenshots`)) {
        fs.mkdirSync(`${workspace}/screenshots`);
      }

      workspaces.push({ path: workspace, name: workspaceName });
      store.set('workspaces', workspaces);
      store.set('lastWorkspace', { path: workspace, name: workspaceName });
    }
  });
});
