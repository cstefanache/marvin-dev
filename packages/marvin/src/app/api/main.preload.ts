import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version-v2'),
  getWorkspaces: () => ipcRenderer.invoke('get-workspaces'),
  getWorkspace: () => ipcRenderer.invoke('get-workspace'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
  getDiscovered: () => ipcRenderer.invoke('get-discovered'),
  getFlow: () => ipcRenderer.invoke('get-flow'),
  setFlow: (flow: any) => ipcRenderer.invoke('set-flow', flow),
  getMethodsForPath: (path: string) =>
    ipcRenderer.invoke('get-methods-for-path', path),
  deletePath: (path: string) => ipcRenderer.invoke('delete-path', path),
  getDiscoveredPaths: (path: string) =>
    ipcRenderer.invoke('get-discovered-paths', path),
  getDiscoveredForPath: (path: string) =>
    ipcRenderer.invoke('get-discovered-for-path', path),
  saveMethodForUrl: (method: any) =>
    ipcRenderer.invoke('save-method-for-url', method),
  getWorkspacePath: () => ipcRenderer.invoke('get-workspace-path'),
  addBranch: (id: string, data: any) =>
    ipcRenderer.invoke('add-branch', id, data),
  deleteMethod: (id: string) => ipcRenderer.invoke('delete-method', id),
  updateBranch: (data: any) => ipcRenderer.invoke('update-branch', data),
  cutBranch: (id: string) => ipcRenderer.invoke('cut-branch', id),
  runDiscovery: (sequence: any, skipDiscovery: boolean) =>
    ipcRenderer.invoke('run-discovery', sequence, skipDiscovery),
  selectNewWorkspaceFolder: () =>
    ipcRenderer.invoke('select-new-workspace-folder'),
  selectWorkspace: (workspace: any) =>
    ipcRenderer.invoke('select-workspace', workspace),
  generateTests: () => ipcRenderer.invoke('generate-tests-in-folder'),
  getLoggers: () => ipcRenderer.invoke('get-loggers'),
  getLogs: (section: string) => ipcRenderer.invoke('get-logs', section),
  // selectWorkspace: (workspace: { name: string, path: string }) => ipcRenderer.invoke('select-workspace', workspace),
});

// White-listed channels.
const ipc = {
  render: {
    // From render to main.
    send: [],
    // From main to render.
    receive: [
      'action-finished',
      'run-completed',
      'log',
      'config-updated',
      'flow-updated',
      'running-discovery',
    ],
    // From render to main and back again.
    sendReceive: [],
  },
};

contextBridge.exposeInMainWorld(
  // Allowed 'ipcRenderer' methods.
  'ipcRender',
  {
    // From render to main.
    send: (channel, args) => {
      const validChannels = ipc.render.send;
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, args);
      }
    },
    // From main to render.
    receive: (channel, listener) => {
      const validChannels = ipc.render.receive;
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`.
        ipcRenderer.on(channel, (event, ...args) => listener(...args));
      }
    },
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    },
    // From render to main and back again.
    invoke: (channel, args) => {
      const validChannels = ipc.render.sendReceive;
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args);
      }
    },
  }
);
