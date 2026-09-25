import { ClipboardList } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function DailyReportsPage() {
  return (
    <ComingSoon
      title="Daily Reports"
      icon={ClipboardList}
      description="The field PWA form site supervisors fill in every day: progress, labor, weather, and photos."
    />
  )
}
