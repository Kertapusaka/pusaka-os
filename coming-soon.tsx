import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <Card>
        <CardHeader className="items-center text-center">
          <Icon className="mb-1 h-8 w-8 text-orange-600" />
          <CardTitle>Coming in the next build</CardTitle>
          <CardDescription className="max-w-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
