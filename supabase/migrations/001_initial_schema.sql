-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timeline_entries table
CREATE TABLE timeline_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type VARCHAR(20) CHECK (entry_type IN ('email', 'note', 'call_summary', 'chat_message')),
    content TEXT NOT NULL,
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create concessions table
CREATE TABLE concessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    concession_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    conditions JSONB DEFAULT '{}',
    given_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    impact VARCHAR(255)
);

-- Create objections table
CREATE TABLE objections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    objection_text TEXT NOT NULL,
    response_attempted TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tone_records table
CREATE TABLE tone_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    tone_label VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX idx_timeline_entries_deal_id ON timeline_entries(deal_id);
CREATE INDEX idx_timeline_entries_entry_date ON timeline_entries(entry_date DESC);
CREATE INDEX idx_concessions_deal_id ON concessions(deal_id);
CREATE INDEX idx_concessions_given_date ON concessions(given_date DESC);
CREATE INDEX idx_objections_deal_id ON objections(deal_id);
CREATE INDEX idx_objections_resolved ON objections(resolved);
CREATE INDEX idx_tone_records_deal_id ON tone_records(deal_id);
CREATE INDEX idx_tone_records_recorded_at ON tone_records(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE concessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tone_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deals
CREATE POLICY "Users can view their own deals" ON deals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" ON deals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" ON deals
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for timeline entries
CREATE POLICY "Users can view timeline entries for their deals" ON timeline_entries
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = timeline_entries.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create timeline entries for their deals" ON timeline_entries
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = timeline_entries.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own timeline entries" ON timeline_entries
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own timeline entries" ON timeline_entries
    FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for concessions
CREATE POLICY "Users can view concessions for their deals" ON concessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = concessions.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create concessions for their deals" ON concessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = concessions.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update concessions for their deals" ON concessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = concessions.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete concessions for their deals" ON concessions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = concessions.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Create RLS policies for objections
CREATE POLICY "Users can view objections for their deals" ON objections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = objections.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create objections for their deals" ON objections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = objections.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update objections for their deals" ON objections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = objections.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete objections for their deals" ON objections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = objections.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Create RLS policies for tone records
CREATE POLICY "Users can view tone records for their deals" ON tone_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = tone_records.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tone records for their deals" ON tone_records
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = tone_records.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tone records for their deals" ON tone_records
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = tone_records.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tone records for their deals" ON tone_records
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM deals 
            WHERE deals.id = tone_records.deal_id 
            AND deals.user_id = auth.uid()
        )
    );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON deals TO anon;
GRANT ALL PRIVILEGES ON deals TO authenticated;
GRANT SELECT ON timeline_entries TO anon;
GRANT ALL PRIVILEGES ON timeline_entries TO authenticated;
GRANT SELECT ON concessions TO anon;
GRANT ALL PRIVILEGES ON concessions TO authenticated;
GRANT SELECT ON objections TO anon;
GRANT ALL PRIVILEGES ON objections TO authenticated;
GRANT SELECT ON tone_records TO anon;
GRANT ALL PRIVILEGES ON tone_records TO authenticated;