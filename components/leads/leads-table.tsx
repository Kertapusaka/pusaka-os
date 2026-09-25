import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { formatIDR } from '@/lib/utils'
import type { Lead } from '@/lib/types/database'

export function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        No leads yet. Add your first one above.
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-mono text-xs text-slate-500">{lead.lead_code}</TableCell>
              <TableCell>
                <div className="font-medium text-slate-900">{lead.client_name}</div>
                <div className="text-xs text-slate-500">{lead.whatsapp_number}</div>
              </TableCell>
              <TableCell>{lead.location}</TableCell>
              <TableCell>{lead.budget_estimate ? formatIDR(lead.budget_estimate) : '—'}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
