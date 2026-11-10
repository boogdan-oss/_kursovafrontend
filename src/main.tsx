import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource-variable/inter'

import { App } from '@/app/App'
import '@/index.css'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'false') return
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

function render() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

enableMocking()
  .catch((error: unknown) => console.warn('MSW не запустився, заглушки вимкнено', error))
  .finally(render)
