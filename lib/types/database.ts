export type UserRole =
  | 'owner' | 'project_manager' | 'site_supervisor' | 'finance' | 'procurement' | 'marketing'

export type LeadStatus =
  | 'NEW' | 'QUALIFIED' | 'CONSULTATION' | 'SURVEY' | 'RAB'
  | 'QUOTATION' | 'NEGOTIATION' | 'DEAL' | 'LOST'

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type CashType = 'CASH_IN' | 'CASH_OUT'
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone_number: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  lead_code: string
  client_name: string
  whatsapp_number: string
  location: string
  building_type: string | null
  land_area: number | null
  building_area: number | null
  floors: number
  budget_estimate: number | null
  target_start_date: string | null
  notes: string | null
  source: string | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  project_code: string
  lead_id: string | null
  project_name: string
  location: string
  total_budget: number
  start_date: string
  end_date: string
  status: ProjectStatus
  progress_percentage: number
  created_at: string
  updated_at: string
}

export interface RabItem {
  id: string
  project_id: string
  item_category: string
  item_description: string
  volume: number
  unit: string
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  project_id: string
  item_name: string
  category: string
  current_stock: number
  minimum_stock: number
  unit: string
  average_unit_cost: number
  last_updated: string
}

export interface MaterialTransaction {
  id: string
  material_id: string
  project_id: string
  type: 'IN' | 'OUT'
  quantity: number
  vendor_supplier: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface DailyReport {
  id: string
  project_id: string
  report_date: string
  progress_increment: number
  labor_count: number
  weather_condition: string | null
  work_completed_notes: string
  issues_and_obstacles: string | null
  submitted_by: string | null
  created_at: string
}

export interface QcChecklist {
  id: string
  project_id: string
  work_item: string
  checklist_data: { item: string; checked: boolean }[]
  is_passed: boolean
  inspector_id: string | null
  notes: string | null
  created_at: string
}

export interface ProjectPhoto {
  id: string
  project_id: string
  report_id: string | null
  photo_url: string
  ai_tags: string[] | null
  is_approved_for_marketing: boolean
  created_at: string
}

export interface Cashflow {
  id: string
  project_id: string
  type: CashType
  category: string
  amount: number
  receipt_url: string | null
  description: string
  approved_by_owner: boolean
  created_at: string
}

export interface AiAlert {
  id: string
  project_id: string
  module: string
  severity: AlertSeverity
  title: string
  reason: string
  recommended_action: string
  is_resolved: boolean
  created_at: string
}

export interface DailyBriefing {
  id: string
  briefing_date: string
  content_markdown: string
  created_at: string
}

export interface LessonLearned {
  id: string
  project_id: string
  issue_category: string
  problem_description: string
  financial_impact: number
  time_delay_days: number
  root_cause: string
  preventative_solution: string
  created_at: string
}
