-- =========================================================================
-- Smart Crop Advisory System - Community Feature Database Migration
-- =========================================================================

-- 1. Create Community Disease Reports Table
CREATE TABLE IF NOT EXISTS public.community_disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    district TEXT NOT NULL,
    crop_name TEXT NOT NULL DEFAULT 'Tomato',
    disease_name TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    disease_knowledge_id TEXT,
    warning_title TEXT NOT NULL,
    warning_message TEXT NOT NULL,
    what_to_watch TEXT NOT NULL,
    what_to_do TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index for fast district and crop lookup
CREATE INDEX IF NOT EXISTS idx_community_reports_district 
ON public.community_disease_reports(district, crop_name, is_active);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.community_disease_reports ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Authenticated farmers can view active community warnings
CREATE POLICY "Allow authenticated farmers to select community warnings" 
ON public.community_disease_reports
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 5. RLS Policy: Authenticated farmers can insert their own valid disease occurrence
CREATE POLICY "Allow authenticated farmers to insert community occurrences" 
ON public.community_disease_reports
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = farmer_id);
