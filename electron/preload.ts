import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', title, body),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getProxies: () => ipcRenderer.invoke('get-proxies'),
  saveProxies: (proxies: any) => ipcRenderer.invoke('save-proxies', proxies),
  triggerCheck: () => ipcRenderer.invoke('trigger-check'),
  onProxyUpdated: (callback: (proxy: any) => void) => 
    ipcRenderer.on('proxy-updated', (_event, value) => callback(value)),
  onActivityLog: (callback: (log: any) => void) =>
    ipcRenderer.on('activity-log', (_event, value) => callback(value))
})
