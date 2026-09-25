import { ShieldCheck } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function QcPage() {
  return (
    <ComingSoon
      title="QC & K3"
      icon={ShieldCheck}
      description="Structured checklists for quality control and safety inspections, signed off by an inspector."
    />
  )
}
