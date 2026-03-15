import { useState, useEffect } from 'react'
import { Plus, Trash2, Play, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { ipc } from '../lib/ipc'
import type { StoredProxy } from '../../electron/store'

export function ProxyList() {
  const [proxies, setProxies] = useState<StoredProxy[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [rawProxyInput, setRawProxyInput] = useState('')

  useEffect(() => {
    ipc.getProxies().then(setProxies)

    ipc.onProxyUpdated((updatedProxy) => {
      setProxies(prev => prev.map(p => p.id === updatedProxy.id ? updatedProxy : p))
    })
  }, [])

  const handleAddProxies = () => {
    const lines = rawProxyInput.split('\n').map(l => l.trim()).filter(Boolean)
    const newProxies: StoredProxy[] = lines.map(line => {
      const parts = line.split(':')
      return {
        id: crypto.randomUUID(),
        ip: parts[0] || '',
        port: parseInt(parts[1] || '0', 10),
        username: parts[2] || undefined,
        password: parts[3] || undefined,
        status: 'untested' as const,
      }
    }).filter(p => p.ip && p.port)

    const updated = [...proxies, ...newProxies]
    setProxies(updated)
    ipc.saveProxies(updated)
    ipc.triggerCheck()
    setShowAddModal(false)
    setRawProxyInput('')
  }

  const handleDelete = (id: string) => {
    const updated = proxies.filter(p => p.id !== id)
    setProxies(updated)
    ipc.saveProxies(updated)
  }

  const handleCheckAll = () => {
    ipc.triggerCheck()
  }

  const getStatusIcon = (status: StoredProxy['status']) => {
    switch(status) {
      case 'online': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case 'offline': return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default: return <AlertTriangle className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="flex flex-col h-full gap-6 text-slate-200">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proxy Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleCheckAll}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Check All</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-colors text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Add Proxies</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-sm">
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">IP:Port</th>
                <th className="p-4 font-medium">Auth</th>
                <th className="p-4 font-medium">Ping</th>
                <th className="p-4 font-medium">Fraud Score</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proxies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No proxies added yet. Click "Add Proxies" to get started.
                  </td>
                </tr>
              ) : (
                proxies.map(proxy => (
                  <tr key={proxy.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proxy.status)}
                        <span className="capitalize text-sm">{proxy.status}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{proxy.ip}:{proxy.port}</td>
                    <td className="p-4 text-slate-400 text-sm">
                      {proxy.username ? 'Yes' : 'No'}
                    </td>
                    <td className="p-4">
                      {proxy.pingMs ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          proxy.pingMs < 100 ? 'bg-emerald-500/10 text-emerald-400' :
                          proxy.pingMs < 300 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {proxy.pingMs} ms
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {proxy.fraudScore !== undefined ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          proxy.fraudScore < 30 ? 'bg-emerald-500/10 text-emerald-400' :
                          proxy.fraudScore < 75 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {proxy.fraudScore}/100
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(proxy.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Proxies</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-400 mb-4">
                Paste your proxies below. Format: <code className="bg-slate-800 px-1 py-0.5 rounded">IP:PORT</code> or <code className="bg-slate-800 px-1 py-0.5 rounded">IP:PORT:USER:PASS</code>. One per line.
              </p>
              <textarea
                value={rawProxyInput}
                onChange={e => setRawProxyInput(e.target.value)}
                className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                placeholder="192.168.1.1:8080&#10;10.0.0.1:3128:user:pass"
              />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProxies}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                disabled={!rawProxyInput.trim()}
              >
                Add Targets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
