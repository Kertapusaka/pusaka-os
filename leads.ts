'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createLead(formData: FormData) {
  const supabase = createClient()

  const payload = {
    client_name: String(formData.get('client_name') || ''),
    whatsapp_number: String(formData.get('whatsapp_number') || ''),
    location: String(formData.get('location') || ''),
    building_type: String(formData.get('building_type') || '') || null,
    land_area: formData.get('land_area') ? Number(formData.get('land_area')) : null,
    building_area: formData.get('building_area') ? Number(formData.get('building_area')) : null,
    budget_estimate: formData.get('budget_estimate') ? Number(formData.get('budget_estimate')) : null,
    source: String(formData.get('source') || '') || null,
    notes: String(formData.get('notes') || '') || null,
  }

  if (!payload.client_name || !payload.whatsapp_number || !payload.location) {
    return { error: 'Client name, WhatsApp number, and location are required.' }
  }

  const { error } = await supabase.from('leads').insert(payload)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/leads')
  return { error: null }
}
