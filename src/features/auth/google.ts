const SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const SCOPE = 'openid email profile'

interface CodeResponse {
  code?: string
  error?: string
  error_description?: string
}

interface CodeClientError {
  type: 'popup_failed_to_open' | 'popup_closed' | 'unknown'
}

interface CodeClient {
  requestCode: () => void
}

interface GoogleAccounts {
  oauth2: {
    initCodeClient: (config: {
      client_id: string
      scope: string
      ux_mode: 'popup'
      callback: (response: CodeResponse) => void
      error_callback?: (error: CodeClientError) => void
    }) => CodeClient
  }
}

declare global {
  interface Window {
    google?: { accounts?: GoogleAccounts }
  }
}

export class GoogleCancelled extends Error {
  constructor() {
    super('Вхід через Google скасовано')
    this.name = 'GoogleCancelled'
  }
}

export function googleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || null
}

let loading: Promise<GoogleAccounts> | null = null

export function loadGoogle(): Promise<GoogleAccounts> {
  const ready = window.google?.accounts
  if (ready) return Promise.resolve(ready)
  loading ??= new Promise<GoogleAccounts>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      const accounts = window.google?.accounts
      if (accounts) resolve(accounts)
      else reject(new Error('Google недоступний'))
    }
    script.onerror = () => {
      loading = null
      script.remove()
      reject(
        new Error('Не вдалося завантажити Google. Перевірте інтернет або блокувальник реклами'),
      )
    }
    document.head.appendChild(script)
  })
  return loading
}

export function requestGoogleCode(accounts: GoogleAccounts, clientId: string) {
  return new Promise<string>((resolve, reject) => {
    const client = accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: SCOPE,
      ux_mode: 'popup',
      callback: (response) => {
        if (response.code) resolve(response.code)
        else if (response.error === 'access_denied') reject(new GoogleCancelled())
        else reject(new Error(response.error_description || 'Google не підтвердив вхід'))
      },
      error_callback: (error) => {
        if (error.type === 'popup_closed') reject(new GoogleCancelled())
        else if (error.type === 'popup_failed_to_open') {
          reject(new Error('Браузер заблокував вікно Google. Дозвольте спливні вікна для сайту'))
        } else reject(new Error('Google не підтвердив вхід'))
      },
    })
    client.requestCode()
  })
}
