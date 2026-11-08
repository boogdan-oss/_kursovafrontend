import { Toaster as Sonner } from 'sonner'

import { useSettingsStore } from '@/store/useSettingsStore'

type ToasterProps = React.ComponentProps<typeof Sonner>

// Тема береться з налаштувань застосунку, а не з next-themes
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useSettingsStore((state) => state.theme)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
