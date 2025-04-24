import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  claimCookie: () => ipcRenderer.invoke('claim-cookie')
});
