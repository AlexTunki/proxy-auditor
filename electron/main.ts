import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { store, AppSettings, StoredProxy } from './store'
import { pingProxy } from '../src/checker/ping'
import { checkFraudScore } from '../src/checker/fraud'
import { fetchProxy6List } from '../src/checker/proxy6'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null
let checkIntervalTimer: NodeJS.Timeout | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.setMenu(null)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function startBackgroundCheck() {
  if (checkIntervalTimer) clearInterval(checkIntervalTimer)
  
  const settings = store.get('settings')
  const intervalMs = (settings.checkInterval || 15) * 60 * 1000

  const runCheck = async () => {
    const proxies = store.get('proxies') || []
    let updated = false

    for (const proxy of proxies) {
      const pingRes = await pingProxy(proxy as any)
      proxy.lastChecked = Date.now()
      
      if (pingRes.success) {
        if (proxy.status === 'offline') {
          if (store.get('settings').notificationsEnabled) {
            new Notification({ title: 'Proxy Restored', body: `${proxy.ip}:${proxy.port} is back online` }).show()
          }
          const sendLog = store.get('sendLog') as any
          if (sendLog) sendLog(`Proxy ${proxy.ip}:${proxy.port} is back online (${pingRes.pingMs}ms)!`, 'success')
        }
        proxy.status = 'online'
        proxy.pingMs = pingRes.pingMs
        
        if (proxy.fraudScore === undefined) {
          const fraudRes = await checkFraudScore(proxy.ip, store.get('settings').fraudApiKey)
          if (!fraudRes.error) {
            proxy.fraudScore = fraudRes.score
          }
        }
      } else {
        if (proxy.status === 'online') {
          if (store.get('settings').notificationsEnabled) {
            new Notification({ title: 'Proxy Down!', body: `${proxy.ip}:${proxy.port} is offline` }).show()
          }
          const sendLog = store.get('sendLog') as any
          if (sendLog) sendLog(`Proxy ${proxy.ip}:${proxy.port} went offline (Timeout/Error)`, 'error')
        }
        proxy.status = 'offline'
        proxy.pingMs = undefined
      }
      updated = true
      
      if (mainWindow) {
        mainWindow.webContents.send('proxy-updated', proxy)
      }
    }
    
    if (updated) {
      store.set('proxies', proxies)
    }
  }

  runCheck()
  checkIntervalTimer = setInterval(runCheck, intervalMs)
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('get-settings', () => store.get('settings'))
  ipcMain.handle('save-settings', (_, settings: AppSettings) => {
    store.set('settings', settings)
    startBackgroundCheck()
    return true
  })
  
  ipcMain.handle('get-proxies', () => store.get('proxies'))
  ipcMain.handle('save-proxies', (_, proxies: StoredProxy[]) => {
    store.set('proxies', proxies)
    return true
  })
  
  ipcMain.handle('trigger-check', () => {
    startBackgroundCheck()
    return true
  })

  ipcMain.on('show-notification', (event, title, body) => {
    if (store.get('settings').notificationsEnabled) {
      new Notification({ title, body }).show()
    }
  })
  
  const sendActivityLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (mainWindow) {
      mainWindow.webContents.send('activity-log', {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        message,
        type
      })
    }
  }

  store.set('sendLog', sendActivityLog as any)

  startBackgroundCheck()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
