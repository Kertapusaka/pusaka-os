import { Wallet } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function FinancePage() {
  return (
    <ComingSoon
      title="Finance"
      icon={Wallet}
      description="Cash in and cash out per project, receipts attached, with owner approval before it counts."
    />
  )
}
