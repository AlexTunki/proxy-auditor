import axios from 'axios'

export interface FraudResult {
  score: number
  isProxy: boolean
  isVpn: boolean
  country?: string
  error?: string
}

export async function checkFraudScore(ip: string, apiKey?: string): Promise<FraudResult> {
  const url = `http://proxycheck.io/v2/${ip}?key=${apiKey || ''}&vpn=1`
  
  try {
    const response = await axios.get(url, { timeout: 10000 })
    const data = response.data
    
    if (data.status === 'ok' && data[ip]) {
      const result = data[ip]
      
      let score = 0
      if (result.proxy === 'yes') score += 50
      if (result.type === 'VPN') score += 20
      
      return {
        score,
        isProxy: result.proxy === 'yes',
        isVpn: result.type === 'VPN',
        country: result.isocode
      }
    }
    
    return {
      score: 0,
      isProxy: false,
      isVpn: false,
      error: 'Invalid response from API'
    }
  } catch (error: any) {
    return {
      score: 0,
      isProxy: false,
      isVpn: false,
      error: error.message || 'API request failed'
    }
  }
}
