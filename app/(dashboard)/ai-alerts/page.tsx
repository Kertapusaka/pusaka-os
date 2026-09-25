import { AlertTriangle } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function AiAlertsPage() {
  return (
    <ComingSoon
      title="AI Alerts"
      icon={AlertTriangle}
      description="The AI watchdog's findings across materials, finance, schedule, QC, and sales, with a recommended action for each."
    />
  )
}
