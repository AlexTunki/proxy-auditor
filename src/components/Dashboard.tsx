import { useEffect, useState } from 'react'
import { Activity, ServerCrash, ShieldAlert, Wifi } from 'lucide-react'
import { ipc } from '../lib/ipc'
import type { StoredProxy } from '../../electron/store'
import { clsx } from 'clsx'

export function Dashboard() {
  const [proxies, setProxies] = useState<StoredProxy[]>([])
  const [logs, setLogs] = useState<{ id: string, timestamp: number, message: string, type: string }[]>([])

  useEffect(() => {
    ipc.getProxies().then(setProxies)
    
    ipc.onProxyUpdated((updatedProxy) => {
      setProxies(prev => {
        const idx = prev.findIndex(p => p.id === updatedProxy.id)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = updatedProxy
          return next
        }
        return [...prev, updatedProxy]
      })
    })

    ipc.onActivityLog((newLog) => {
      setLogs(prev => [newLog, ...prev].slice(0, 50))
    })
  }, [])

  const total = proxies.length
  const onlineFast = proxies.filter(p => p.status === 'online').length
  const deadTimeout = proxies.filter(p => p.status === 'offline' || p.status === 'untested').length
  const highRisk = proxies.filter(p => p.fraudScore !== undefined && p.fraudScore >= 50).length

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Proxies</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Online & Fast</p>
            <p className="text-2xl font-bold">{onlineFast}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
            <ServerCrash className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Dead / Timeout</p>
            <p className="text-2xl font-bold">{deadTimeout}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">High Fraud Score</p>
            <p className="text-2xl font-bold">{highRisk}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col min-h-[300px]">
        <h3 className="text-lg font-semibold mb-4 border-b border-slate-800 pb-2 text-emerald-400">Activity Logs</h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 font-mono text-sm max-h-[300px]">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
               <Activity className="w-10 h-10 mb-2" />
               <p>Waiting for proxy events...</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex gap-3 py-1 border-b border-slate-800/50">
                <span className="text-slate-500 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={clsx(
                  'flex-1',
                  log.type === 'error' && 'text-red-400',
                  log.type === 'success' && 'text-emerald-400',
                  log.type === 'warning' && 'text-amber-400',
                  log.type === 'info' && 'text-slate-300'
                )}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
