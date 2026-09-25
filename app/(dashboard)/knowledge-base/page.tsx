import { BookOpen } from 'lucide-react'
import { ComingSoon } from '@/components/layout/coming-soon'

export default function KnowledgeBasePage() {
  return (
    <ComingSoon
      title="Knowledge Base"
      icon={BookOpen}
      description="Lessons learned from past projects, searchable so the same mistake doesn't happen twice."
    />
  )
}
