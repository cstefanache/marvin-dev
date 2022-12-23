import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version-v2'),
  getWorkspaces: () => ipcRenderer.invoke('get-workspaces'),
  getWorkspace: () => ipcRenderer.invoke('get-workspace'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
  getDiscovered: () => ipcRenderer.invoke('get-discovered'),
  getFlow: () => ipcRenderer.invoke('get-flow'),
  runDiscovery: (sequence: any) =>
    ipcRenderer.invoke('run-discovery', sequence),
  selectNewWorkspaceFolder: () =>
    ipcRenderer.invoke('select-new-workspace-folder'),
});

// White-listed channels.
const ipc = {
  render: {
    // From render to main.
    send: [],
    // From main to render.
    receive: [
      'action-finished',
      'run-completed'
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
      let validChannels = ipc.render.send;
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, args);
      }
    },
    // From main to render.
    receive: (channel, listener) => {
      let validChannels = ipc.render.receive;
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`.
        ipcRenderer.on(channel, (event, ...args) => listener(...args));
      }
    },
    // From render to main and back again.
    invoke: (channel, args) => {
      let validChannels = ipc.render.sendReceive;
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args);
      }
    },
  }
);
