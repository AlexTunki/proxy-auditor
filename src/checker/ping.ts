import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'

export interface ProxyConfig {
  ip: string
  port: number
  username?: string
  password?: string
  protocol?: 'http' | 'socks'
}

export interface PingResult {
  success: boolean
  pingMs?: number
  error?: string
}

const TEST_URL = 'https://www.google.com/generate_204'

export async function pingProxy(proxy: ProxyConfig, timeoutMs = 5000): Promise<PingResult> {
  const authUrlStr = (proxy.username && proxy.password) 
    ? `${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@` 
    : ''
  
  const protocol = proxy.protocol || 'http'
  const proxyUrl = `${protocol}://${authUrlStr}${proxy.ip}:${proxy.port}`
  
  const agent = protocol === 'socks' 
    ? new SocksProxyAgent(proxyUrl) 
    : new HttpsProxyAgent(proxyUrl)

  const startTime = Date.now()
  
  try {
    await axios.get(TEST_URL, {
      httpsAgent: agent,
      timeout: timeoutMs,
      validateStatus: () => true,
    })
    
    const pingMs = Date.now() - startTime
    
    return {
      success: true,
      pingMs
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed/timeout'
    }
  }
}
