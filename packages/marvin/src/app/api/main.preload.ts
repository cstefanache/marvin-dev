import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version-v2'),
  getWorkspaces: () => ipcRenderer.invoke('get-workspaces'),
  getWorkspace: () => ipcRenderer.invoke('get-workspace'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
  selectNewWorkspaceFolder: () => ipcRenderer.invoke('select-new-workspace-folder'),
  platform: process.platform,
});
