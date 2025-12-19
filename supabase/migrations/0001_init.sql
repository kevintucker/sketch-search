-- Core tables for Sales Negotiation Assistant

-- deals
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  deal_id VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','won','lost','paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);

-- timeline_entries
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID,
  entry_type VARCHAR(20) CHECK (entry_type IN ('email','note','call_summary','chat_message')),
  content TEXT NOT NULL,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_deal_id ON public.timeline_entries(deal_id);
CREATE INDEX IF NOT EXISTS idx_timeline_entry_date ON public.timeline_entries(entry_date DESC);

-- concessions
CREATE TABLE IF NOT EXISTS public.concessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  concession_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb,
  given_date TIMESTAMPTZ DEFAULT NOW(),
  impact VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_concessions_deal_id ON public.concessions(deal_id);
CREATE INDEX IF NOT EXISTS idx_concessions_given_date ON public.concessions(given_date DESC);

-- objections
CREATE TABLE IF NOT EXISTS public.objections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  objection_text VARCHAR(500) NOT NULL,
  response_attempted TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_objections_deal_id ON public.objections(deal_id);
CREATE INDEX IF NOT EXISTS idx_objections_created_at ON public.objections(created_at DESC);

-- tone_records
CREATE TABLE IF NOT EXISTS public.tone_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  tone_label VARCHAR(50) NOT NULL,
  confidence_score FLOAT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tone_records_deal_id ON public.tone_records(deal_id);
CREATE INDEX IF NOT EXISTS idx_tone_records_recorded_at ON public.tone_records(recorded_at DESC);

