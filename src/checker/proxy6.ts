import axios from 'axios'

export interface Proxy6Item {
  id: string
  ip: string
  host: string
  port: string
  user: string
  pass: string
  type: string
  date: string
  date_end: string
  active: string
}

export async function fetchProxy6List(apiKey: string): Promise<Proxy6Item[]> {
  try {
    const response = await axios.get(`https://proxy6.net/api/${apiKey}/getproxy`)
    if (response.data && response.data.status === 'yes') {
      const list = response.data.list
      return Object.values(list) as Proxy6Item[]
    }
    throw new Error(response.data?.error || 'Unknown error from Proxy6 API')
  } catch (error: any) {
    throw new Error(`Failed to fetch proxies: ${error.message}`)
  }
}
