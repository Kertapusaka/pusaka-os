import { Badge } from '@/components/ui/badge'
import type { LeadStatus } from '@/lib/types/database'

const STATUS_STYLE: Record<LeadStatus, { label: string; variant: 'default' | 'orange' | 'green' | 'red' | 'blue' | 'yellow' }> = {
  NEW: { label: 'New', variant: 'blue' },
  QUALIFIED: { label: 'Qualified', variant: 'blue' },
  CONSULTATION: { label: 'Consultation', variant: 'yellow' },
  SURVEY: { label: 'Survey', variant: 'yellow' },
  RAB: { label: 'RAB', variant: 'orange' },
  QUOTATION: { label: 'Quotation', variant: 'orange' },
  NEGOTIATION: { label: 'Negotiation', variant: 'orange' },
  DEAL: { label: 'Deal', variant: 'green' },
  LOST: { label: 'Lost', variant: 'red' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const style = STATUS_STYLE[status]
  return <Badge variant={style.variant}>{style.label}</Badge>
}
