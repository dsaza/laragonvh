const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('laragonvh', {
  showAddHostWindow: () => {
    ipcRenderer.send('laragonvh:show-add-host-window');
  },
  closeAddHostWindow: () => {
    ipcRenderer.send('laragonvh:close-add-host-window');
  },
  existFolder: async (path) => {
    const exist = await ipcRenderer.invoke('laragonvh:exist-folder', path);
    return exist;
  },
  syncHosts: async (hosts) => {
    const isSynced = await ipcRenderer.invoke('laragonvh:sync-hosts', hosts);
    return isSynced;
  },
  onSyncHosts: (callback) => {
    ipcRenderer.on('laragonvh:on-sync-hosts', callback);
  }
});
