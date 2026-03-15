import Store from 'electron-store'

export interface AppSettings {
  proxy6Key: string
  fraudApiProvider: string
  fraudApiKey: string
  checkInterval: number
  notificationsEnabled: boolean
}

export interface StoredProxy {
  id: string
  ip: string
  port: number
  username?: string
  password?: string
  status: 'online' | 'offline' | 'untested' | 'checking'
  pingMs?: number
  fraudScore?: number
  lastChecked?: number
  isProxy6?: boolean
}

interface SchemaType {
  settings: AppSettings
  proxies: StoredProxy[]
}

export const store = new Store<SchemaType>({
  defaults: {
    settings: {
      proxy6Key: '',
      fraudApiProvider: 'ipqualityscore',
      fraudApiKey: '',
      checkInterval: 15,
      notificationsEnabled: true,
    },
    proxies: []
  }
})
