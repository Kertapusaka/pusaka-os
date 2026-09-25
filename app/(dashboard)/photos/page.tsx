import { Image as ImageIcon } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function PhotosPage() {
  return (
    <ComingSoon
      title="Photos"
      icon={ImageIcon}
      description="Every site photo, auto-tagged by AI, with a one-tap approval flow for the marketing team."
    />
  )
}
