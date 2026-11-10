import { Construction } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface PagePlaceholderProps {
  planned: string[]
}

export function PagePlaceholder({ planned }: PagePlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex-row items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Construction className="size-[18px]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <CardTitle>Сторінка в розробці</CardTitle>
          <CardDescription>Тут з'явиться:</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1 text-caption text-muted-foreground">
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
