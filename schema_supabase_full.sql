-- =========================================================================
-- Smart Crop Advisory System - Complete Supabase Database Schema
-- =========================================================================

-- 1. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    mobile_number TEXT,
    district TEXT NOT NULL DEFAULT 'Kolar',
    main_crop TEXT NOT NULL DEFAULT 'Tomato',
    preferred_language TEXT DEFAULT 'English',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for farmer_profiles
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow farmers to select profiles" 
ON public.farmer_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow farmers to insert/update their profile" 
ON public.farmer_profiles FOR ALL TO authenticated 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- 2. Disease Knowledge Table
CREATE TABLE IF NOT EXISTS public.disease_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name TEXT UNIQUE NOT NULL,
    crop_name TEXT NOT NULL DEFAULT 'Tomato',
    scientific_name TEXT,
    what_is_it TEXT,
    symptoms TEXT,
    why_it_happens TEXT,
    how_it_spreads TEXT,
    favorable_conditions TEXT,
    what_to_do_now TEXT,
    how_to_prevent TEXT,
    management_treatment TEXT,
    when_to_contact_expert TEXT,
    source TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for disease_knowledge
ALTER TABLE public.disease_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on disease_knowledge" 
ON public.disease_knowledge FOR SELECT TO public USING (true);


-- 3. Community Disease Reports Table (ONLY Source of Community Data)
CREATE TABLE IF NOT EXISTS public.community_disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    district TEXT NOT NULL,
    crop_name TEXT NOT NULL DEFAULT 'Tomato',
    disease_name TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    disease_knowledge_id UUID REFERENCES public.disease_knowledge(id) ON DELETE SET NULL,
    warning_title TEXT NOT NULL,
    warning_message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup index for district-level warnings
CREATE INDEX IF NOT EXISTS idx_community_district_active 
ON public.community_disease_reports(district, is_active, detected_at DESC);

-- Enable RLS for community_disease_reports
ALTER TABLE public.community_disease_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated farmers to SELECT active warnings for their district
CREATE POLICY "Allow authenticated farmers to select active community warnings" 
ON public.community_disease_reports FOR SELECT TO authenticated USING (is_active = true);

-- Allow authenticated farmers to INSERT new valid disease reports
CREATE POLICY "Allow authenticated farmers to insert community disease reports" 
ON public.community_disease_reports FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = farmer_id OR farmer_id IS NULL);
