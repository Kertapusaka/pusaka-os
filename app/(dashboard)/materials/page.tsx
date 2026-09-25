import { Boxes } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function MaterialsPage() {
  return (
    <ComingSoon
      title="Materials"
      icon={Boxes}
      description="Track stock per project, log incoming and outgoing material, and get warned before you run out."
    />
  )
}
