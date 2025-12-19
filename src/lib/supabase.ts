import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  user_id: string
  deal_id: string
  company_name: string
  contact_name: string | null
  status: 'active' | 'won' | 'lost' | 'paused'
  created_at: string
  updated_at: string
}

export interface TimelineEntry {
  id: string
  deal_id: string
  user_id: string
  entry_type: 'email' | 'note' | 'call_summary' | 'chat_message'
  content: string
  entry_date: string
  created_at: string
}

export interface Concession {
  id: string
  deal_id: string
  concession_type: string
  description: string
  conditions: Record<string, any>
  given_date: string
  impact: string
}

export interface Objection {
  id: string
  deal_id: string
  objection_text: string
  response_attempted: string
  resolved: boolean
  created_at: string
}

export interface ToneRecord {
  id: string
  deal_id: string
  tone_label: string
  confidence_score: number
  recorded_at: string
}