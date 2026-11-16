import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        closeButtonAriaLabel: 'Закрити сповіщення',
        classNames: {
          closeButton:
            '!left-auto !right-2 !top-2 ![transform:none] !size-6 !border-border !bg-transparent !text-muted-foreground hover:!bg-muted hover:!text-foreground [&_svg]:size-3.5',
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:rounded-xl group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-action group-[.toast]:text-action-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: '[&_[data-icon]]:text-success',
          error: '[&_[data-icon]]:text-destructive',
          warning: '[&_[data-icon]]:text-warning',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
