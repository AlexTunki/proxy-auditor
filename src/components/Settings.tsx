import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { ipc } from '../lib/ipc'

export function Settings() {
  const [proxy6Key, setProxy6Key] = useState('')
  const [fraudApiProvider, setFraudApiProvider] = useState('ipqualityscore')
  const [fraudApiKey, setFraudApiKey] = useState('')
  const [checkInterval, setCheckInterval] = useState('15')
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    ipc.getSettings().then(settings => {
      if (settings) {
        setProxy6Key(settings.proxy6Key || '')
        setFraudApiProvider(settings.fraudApiProvider || 'ipqualityscore')
        setFraudApiKey(settings.fraudApiKey || '')
        setCheckInterval(settings.checkInterval?.toString() || '15')
        setNotifications(settings.notificationsEnabled ?? true)
      }
    })
  }, [])
  
  const handleSave = () => {
    ipc.saveSettings({
      proxy6Key,
      fraudApiProvider,
      fraudApiKey,
      checkInterval: parseInt(checkInterval, 10),
      notificationsEnabled: notifications
    }).then(() => {
      ipc.showNotification('Success', 'Settings saved')
    })
  }

  return (
    <div className="flex flex-col gap-6 text-slate-200 max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-colors text-white font-medium"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">API Integrations</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Proxy6 API Key (Optional)
              </label>
              <input
                type="password"
                value={proxy6Key}
                onChange={e => setProxy6Key(e.target.value)}
                placeholder="Enter key for auto-sync"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Allows automatically fetching your proxies from your Proxy6 account.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Fraud Score Provider
              </label>
              <select
                value={fraudApiProvider}
                onChange={e => setFraudApiProvider(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ipqualityscore">IPQualityScore (Recommended)</option>
                <option value="proxycheck">Proxycheck.io</option>
                <option value="scamalytics">Scamalytics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                API Key (Fraud Score)
              </label>
              <input
                type="password"
                value={fraudApiKey}
                onChange={e => setFraudApiKey(e.target.value)}
                placeholder="Enter provider API key"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">Engine Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Background Check Interval (minutes)
              </label>
              <select
                value={checkInterval}
                onChange={e => setCheckInterval(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Push Notifications</p>
                <p className="text-xs text-slate-500">Show desktop notifications when a proxy goes offline</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications} 
                  onChange={e => setNotifications(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
