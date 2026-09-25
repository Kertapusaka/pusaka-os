import { Users, Building2, AlertTriangle, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatIDR } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()

  const [{ count: leadCount }, { count: activeProjectCount }, { count: alertCount }, { data: cashRows }] =
    await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS'),
      supabase.from('ai_alerts').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
      supabase.from('cashflows').select('type, amount'),
    ])

  const netCash = (cashRows ?? []).reduce(
    (sum, row) => sum + (row.type === 'CASH_IN' ? Number(row.amount) : -Number(row.amount)),
    0
  )

  const stats = [
    { label: 'Total Leads', value: String(leadCount ?? 0), icon: Users },
    { label: 'Active Projects', value: String(activeProjectCount ?? 0), icon: Building2 },
    { label: 'Open AI Alerts', value: String(alertCount ?? 0), icon: AlertTriangle },
    { label: 'Net Cashflow', value: formatIDR(netCash), icon: Wallet },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">A live snapshot across every project.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
              <Icon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="font-heading text-2xl font-bold text-slate-900">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Next up</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">
          Projects, RAB, Materials, Daily Reports, QC, Finance, Photos, AI Alerts, and the Knowledge Base
          are scaffolded and ready to be built out in the next phase.
        </CardContent>
      </Card>
    </div>
  )
}
