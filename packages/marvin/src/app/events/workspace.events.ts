/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { ipcMain, dialog } from 'electron';
import { environment } from '../../environments/environment';
import * as Store from 'electron-store';
import * as fs from 'fs';



const store = new Store();

if (!store.get('workspaces')) {
  store.set('workspaces', []);
}

export default class WorkspaceEvents {
  static bootstrapWorkspaceEvents(): Electron.IpcMain {
    return ipcMain;
  }
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
  const workspace = store.get('lastWorkspace');

  if (workspace && fs.existsSync(`${workspace}/config.json`)) {
    return JSON.parse(fs.readFileSync(`${workspace}/config.json`, 'utf8'));
  } else {
    return {};
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
