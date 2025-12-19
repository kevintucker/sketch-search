import { supabase } from './supabase'
import type { Deal, TimelineEntry, Concession, Objection, ToneRecord } from './supabase'

export const getDeals = async () => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Deal[]
}

export const getDeal = async (id: string) => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Deal
}

export const createDeal = async (dealData: {
  deal_id: string
  company_name: string
  contact_name?: string
}) => {
  const { data, error } = await supabase
    .from('deals')
    .insert([dealData])
    .select()
    .single()
  
  if (error) throw error
  return data as Deal
}

export const updateDealStatus = async (id: string, status: Deal['status']) => {
  const { data, error } = await supabase
    .from('deals')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Deal
}

export const getTimelineEntries = async (dealId: string) => {
  const { data, error } = await supabase
    .from('timeline_entries')
    .select('*')
    .eq('deal_id', dealId)
    .order('entry_date', { ascending: false })
  
  if (error) throw error
  return data as TimelineEntry[]
}

export const createTimelineEntry = async (entry: {
  deal_id: string
  entry_type: TimelineEntry['entry_type']
  content: string
  entry_date?: string
}) => {
  const { data, error } = await supabase
    .from('timeline_entries')
    .insert([entry])
    .select()
    .single()
  
  if (error) throw error
  return data as TimelineEntry
}

export const getConcessions = async (dealId: string) => {
  const { data, error } = await supabase
    .from('concessions')
    .select('*')
    .eq('deal_id', dealId)
    .order('given_date', { ascending: false })
  
  if (error) throw error
  return data as Concession[]
}

export const createConcession = async (concession: {
  deal_id: string
  concession_type: string
  description: string
  conditions: Record<string, any>
  impact: string
}) => {
  const { data, error } = await supabase
    .from('concessions')
    .insert([concession])
    .select()
    .single()
  
  if (error) throw error
  return data as Concession
}

export const getObjections = async (dealId: string) => {
  const { data, error } = await supabase
    .from('objections')
    .select('*')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Objection[]
}

export const createObjection = async (objection: {
  deal_id: string
  objection_text: string
  response_attempted: string
  resolved: boolean
}) => {
  const { data, error } = await supabase
    .from('objections')
    .insert([objection])
    .select()
    .single()
  
  if (error) throw error
  return data as Objection
}

export const getToneRecords = async (dealId: string) => {
  const { data, error } = await supabase
    .from('tone_records')
    .select('*')
    .eq('deal_id', dealId)
    .order('recorded_at', { ascending: false })
  
  if (error) throw error
  return data as ToneRecord[]
}

export const createToneRecord = async (tone: {
  deal_id: string
  tone_label: string
  confidence_score: number
}) => {
  const { data, error } = await supabase
    .from('tone_records')
    .insert([tone])
    .select()
    .single()
  
  if (error) throw error
  return data as ToneRecord
}