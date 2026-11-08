import { Construction } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface PagePlaceholderProps {
  // Що з'явиться на сторінці — коротким списком
  planned: string[]
}

// Тимчасовий вміст сторінки, доки її не реалізовано
export function PagePlaceholder({ planned }: PagePlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Construction className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle>Сторінка в розробці</CardTitle>
          <CardDescription>Тут з'явиться:</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
