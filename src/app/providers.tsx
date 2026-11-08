import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLayoutEffect, useState, type ReactNode } from 'react'

import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { useSettingsStore } from '@/store/useSettingsStore'

// Тема з налаштувань → клас `dark` на <html>, від нього залежать CSS-змінні в index.css
function ThemeSync() {
  const theme = useSettingsStore((state) => state.theme)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster position="bottom-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
