import { createClient } from '@/lib/supabase/server'
import { LeadForm } from '@/components/leads/lead-form'
import { LeadsTable } from '@/components/leads/leads-table'

export default async function LeadsPage() {
  const supabase = createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">Leads</h1>
        <p className="text-sm text-slate-500">Every inbound client, from first contact to signed deal.</p>
      </div>
      <LeadForm />
      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
