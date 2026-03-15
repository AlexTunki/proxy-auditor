import type { AppSettings, StoredProxy } from '../../electron/store'

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>
      showNotification: (title: string, body: string) => void
      getSettings: () => Promise<AppSettings>
      saveSettings: (settings: AppSettings) => Promise<boolean>
      getProxies: () => Promise<StoredProxy[]>
      saveProxies: (proxies: StoredProxy[]) => Promise<boolean>
      triggerCheck: () => Promise<boolean>
      onProxyUpdated: (callback: (proxy: StoredProxy) => void) => void
      onActivityLog: (callback: (log: { id: string, timestamp: number, message: string, type: 'info' | 'success' | 'warning' | 'error' }) => void) => void
    }
  }
}

export const ipc = window.electronAPI
