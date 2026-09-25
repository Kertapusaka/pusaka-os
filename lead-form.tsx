'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createLead } from '@/lib/actions/leads'

export function LeadForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createLead(formData)
      if (result.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        setOpen(false)
      }
    })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> New Lead
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>New Lead</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close form">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="client_name">Client name *</Label>
            <Input id="client_name" name="client_name" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="whatsapp_number">WhatsApp number *</Label>
            <Input id="whatsapp_number" name="whatsapp_number" required placeholder="+62..." />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" name="location" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="building_type">Building type</Label>
            <Input id="building_type" name="building_type" placeholder="Rumah tinggal, Ruko, ..." />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="land_area">Land area (m²)</Label>
            <Input id="land_area" name="land_area" type="number" step="0.01" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="building_area">Building area (m²)</Label>
            <Input id="building_area" name="building_area" type="number" step="0.01" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="budget_estimate">Budget estimate (Rp)</Label>
            <Input id="budget_estimate" name="budget_estimate" type="number" step="1000" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" placeholder="Instagram, referral, ..." />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
