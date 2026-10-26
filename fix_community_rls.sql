-- =========================================================================
-- Smart Crop Advisory System - Community Table & RLS Policy Fix
-- =========================================================================

-- 1. Ensure Table Structure for community_disease_reports
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

-- Index for fast district lookup
CREATE INDEX IF NOT EXISTS idx_community_district_active 
ON public.community_disease_reports(district, is_active, detected_at DESC);

-- 2. ENABLE Row Level Security (RLS) - MUST remain ENABLED
ALTER TABLE public.community_disease_reports ENABLE ROW LEVEL SECURITY;

-- 3. Drop any conflicting legacy policies on community_disease_reports
DROP POLICY IF EXISTS "Allow authenticated farmers to select community warnings" ON public.community_disease_reports;
DROP POLICY IF EXISTS "Allow authenticated farmers to select active community warnings" ON public.community_disease_reports;
DROP POLICY IF EXISTS "Allow authenticated farmers to insert community occurrences" ON public.community_disease_reports;
DROP POLICY IF EXISTS "Allow authenticated farmers to insert community disease reports" ON public.community_disease_reports;

-- 4. RLS Policy 1: Authenticated users can SELECT active Community reports
CREATE POLICY "Allow authenticated farmers to select active community warnings" 
ON public.community_disease_reports
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 5. RLS Policy 2: Authenticated users can INSERT reports ONLY for their own farmer_id (auth.uid() = farmer_id)
CREATE POLICY "Allow authenticated farmers to insert community disease reports" 
ON public.community_disease_reports
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = farmer_id);


-- =========================================================================
-- Ensure RLS Policies for farmer_profiles and disease_knowledge
-- =========================================================================

ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow farmers to select profiles" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Allow farmers to insert/update their profile" ON public.farmer_profiles;

CREATE POLICY "Allow farmers to select profiles" 
ON public.farmer_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow farmers to insert/update their profile" 
ON public.farmer_profiles FOR ALL TO authenticated 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.disease_knowledge ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on disease_knowledge" ON public.disease_knowledge;
DROP POLICY IF EXISTS "Allow authenticated select on disease_knowledge" ON public.disease_knowledge;

CREATE POLICY "Allow authenticated select on disease_knowledge" 
ON public.disease_knowledge FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow public select on disease_knowledge" 
ON public.disease_knowledge FOR SELECT TO public USING (true);
