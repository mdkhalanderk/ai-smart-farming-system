-- =========================================================================
-- KRISHI DRISHTI: SUPABASE DATABASE MIGRATION SCRIPT
-- Tables: farmer_profiles, community_alerts, conversations, messages, notifications
-- Row Level Security (RLS) & Storage Buckets
-- =========================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. FARMER PROFILES TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    full_name TEXT,
    mobile TEXT,
    mobile_number TEXT,
    district TEXT NOT NULL DEFAULT 'Kolar',
    taluk TEXT,
    village TEXT,
    state TEXT DEFAULT 'Karnataka',
    main_crop TEXT NOT NULL DEFAULT 'Tomato',
    primary_crops TEXT DEFAULT 'Tomato',
    language TEXT NOT NULL DEFAULT 'English',
    preferred_language TEXT NOT NULL DEFAULT 'English',
    land_size TEXT DEFAULT '2.5 Acres',
    farming_type TEXT DEFAULT 'Integrated',
    experience_years INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for district-based farmer lookups
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_district ON public.farmer_profiles(district);

-- Enable RLS
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting legacy policies
DROP POLICY IF EXISTS "Allow farmers to select profiles" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Allow farmers to insert/update their profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Public can view basic farmer profiles" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.farmer_profiles;

-- Authenticated users can view profiles (needed to see other farmer names in community alerts and chat)
CREATE POLICY "Authenticated users can view farmer profiles"
ON public.farmer_profiles FOR SELECT TO authenticated
USING (true);

-- Users can only insert their own profile linked to auth.uid()
CREATE POLICY "Users can insert own profile"
ON public.farmer_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.farmer_profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- -------------------------------------------------------------------------
-- 2. COMMUNITY ALERTS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Farmer',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    crop_name TEXT NOT NULL DEFAULT 'Tomato',
    disease_name TEXT,
    district TEXT NOT NULL,
    taluk TEXT,
    village TEXT,
    danger_level TEXT NOT NULL DEFAULT 'Medium' CHECK (danger_level IN ('Low', 'Medium', 'High', 'Critical')),
    photo_url TEXT,
    upvotes INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_community_alerts_district ON public.community_alerts(district, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_alerts_crop ON public.community_alerts(crop_name);
CREATE INDEX IF NOT EXISTS idx_community_alerts_danger ON public.community_alerts(danger_level);

-- Enable RLS
ALTER TABLE public.community_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to read active alerts" ON public.community_alerts;
DROP POLICY IF EXISTS "Allow authenticated to insert alerts" ON public.community_alerts;
DROP POLICY IF EXISTS "Allow creator to update alerts" ON public.community_alerts;

-- Anyone authenticated can view active alerts
CREATE POLICY "Allow authenticated to read active alerts"
ON public.community_alerts FOR SELECT TO authenticated
USING (is_active = true);

-- Allow public read of active alerts (for landing/demo overview)
CREATE POLICY "Allow public to read active alerts"
ON public.community_alerts FOR SELECT TO anon
USING (is_active = true);

-- Authenticated farmers can insert their own alerts
CREATE POLICY "Allow authenticated to insert alerts"
ON public.community_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = farmer_id OR farmer_id IS NULL);

-- Creators can update their own alerts
CREATE POLICY "Allow creator to update alerts"
ON public.community_alerts FOR UPDATE TO authenticated
USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);


-- -------------------------------------------------------------------------
-- 3. CONVERSATIONS TABLE (Farmer-to-Farmer Private Chat)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES public.community_alerts(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_name TEXT NOT NULL DEFAULT 'Alert Creator',
    participant_name TEXT NOT NULL DEFAULT 'Interested Farmer',
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent duplicate conversations for the exact same alert and pair of farmers
    CONSTRAINT unique_alert_conversation UNIQUE(alert_id, creator_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(creator_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_alert ON public.conversations(alert_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

-- Only conversation participants can view the conversation
CREATE POLICY "Participants can view conversations"
ON public.conversations FOR SELECT TO authenticated
USING (auth.uid() = creator_id OR auth.uid() = participant_id);

-- Only participant or creator can create conversation
CREATE POLICY "Participants can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = creator_id OR auth.uid() = participant_id);

-- Only participants can update (e.g. last_message update)
CREATE POLICY "Participants can update conversations"
ON public.conversations FOR UPDATE TO authenticated
USING (auth.uid() = creator_id OR auth.uid() = participant_id)
WITH CHECK (auth.uid() = creator_id OR auth.uid() = participant_id);


-- -------------------------------------------------------------------------
-- 4. MESSAGES TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    message_text TEXT,
    photo_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id, is_read);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conversation participants can read messages" ON public.messages;
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Conversation participants can update read status" ON public.messages;

-- Only authorized conversation participants can read messages
CREATE POLICY "Conversation participants can read messages"
ON public.messages FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (c.creator_id = auth.uid() OR c.participant_id = auth.uid())
    )
);

-- Only authorized conversation participants can insert messages
CREATE POLICY "Conversation participants can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
        AND (c.creator_id = auth.uid() OR c.participant_id = auth.uid())
    )
);

-- Participants can mark messages as read
CREATE POLICY "Conversation participants can update read status"
ON public.messages FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (c.creator_id = auth.uid() OR c.participant_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (c.creator_id = auth.uid() OR c.participant_id = auth.uid())
    )
);


-- -------------------------------------------------------------------------
-- 5. NOTIFICATIONS TABLE (Targeted Community Alerts & Message Alerts)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('alert', 'message', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_id UUID REFERENCES public.community_alerts(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    danger_level TEXT DEFAULT 'Medium',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;

CREATE POLICY "Users can read their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);


-- -------------------------------------------------------------------------
-- 6. ENABLE SUPABASE REALTIME REPLICATION
-- -------------------------------------------------------------------------
DO $$
BEGIN
    -- Add tables to realtime publication if not already added
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.community_alerts;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;


-- -------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKETS (alert-photos, chat-photos)
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('alert-photos', 'alert-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-photos', 'chat-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public access to alert photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to alert photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to chat photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read chat photos" ON storage.objects;

CREATE POLICY "Public access to alert photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'alert-photos');

CREATE POLICY "Authenticated upload to alert photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'alert-photos');

CREATE POLICY "Authenticated read chat photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'chat-photos');

CREATE POLICY "Authenticated upload to chat photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-photos');


-- -------------------------------------------------------------------------
-- 8. SEED VERIFIED KARNATAKA COMMUNITY ALERTS (If Table is Empty)
-- -------------------------------------------------------------------------
INSERT INTO public.community_alerts (author_name, district, taluk, village, crop_name, disease_name, title, description, danger_level, upvotes)
SELECT
    'KVK Pathologist', 'Kolar', 'Srinivaspur', 'Ronur', 'Tomato', 'Early Blight',
    'Early Blight Cluster Detected in Solanaceous Plots',
    'Target-spot concentric rings observed on lower leaves of hybrid tomato crops following high humidity mornings. Preventive Mancozeb 75 WP (2g/L) recommended.',
    'High', 14
WHERE NOT EXISTS (SELECT 1 FROM public.community_alerts LIMIT 1);

INSERT INTO public.community_alerts (author_name, district, taluk, village, crop_name, disease_name, title, description, danger_level, upvotes)
SELECT
    'District Agronomist', 'Mandya', 'Maddur', 'Koppa', 'Sugarcane', 'Woolly Aphid',
    'Sugarcane Woolly Aphid (Ceratovacuna lanigera) Flare-up',
    'White waxy colonies observed on lower leaf surface under Shimsha canal belt. Release Encarsia flavoscutellum parasitoids or spray Chlorpyrifos 20 EC (2ml/L).',
    'Medium', 9
WHERE NOT EXISTS (SELECT 1 FROM public.community_alerts WHERE district = 'Mandya');

INSERT INTO public.community_alerts (author_name, district, taluk, village, crop_name, disease_name, title, description, danger_level, upvotes)
SELECT
    'Horticulture Officer', 'Mysuru', 'Nanjangud', 'Biligere', 'Banana', 'Sigatoka Leaf Spot',
    'Yellow Sigatoka Leaf Streaks Observed on Kapila River Plots',
    'Spindle and mature leaves showing dark brown necrotic streaks with grey centers. De-leaf infected foliage and spray Propiconazole 25 EC (1ml/L).',
    'High', 12
WHERE NOT EXISTS (SELECT 1 FROM public.community_alerts WHERE district = 'Mysuru');

INSERT INTO public.community_alerts (author_name, district, taluk, village, crop_name, disease_name, title, description, danger_level, upvotes)
SELECT
    'KVK Agronomist', 'Davangere', 'Harihara', 'Malebennur', 'Maize', 'Fall Armyworm',
    'Fall Armyworm (Spodoptera frugiperda) Whorl Damage Notice',
    'Pinholes and sawdust frass found inside central whorls of 25-day-old hybrid maize. Apply Chlorantraniliprole 18.5 SC (0.4ml/L) whorl direct spray.',
    'Critical', 21
WHERE NOT EXISTS (SELECT 1 FROM public.community_alerts WHERE district = 'Davangere');

INSERT INTO public.community_alerts (author_name, district, taluk, village, crop_name, disease_name, title, description, danger_level, upvotes)
SELECT
    'Senior Extension Specialist', 'Hassan', 'Channarayapatna', 'Shravanabelagola', 'Potato', 'Late Blight',
    'Late Blight Pre-warning for Kharif Table Potato',
    'Cool misty morning conditions favor Phytophthora infestans zoospore germination. Apply prophylactic Mancozeb or Cymoxanil + Mancozeb if dew persists.',
    'High', 16
WHERE NOT EXISTS (SELECT 1 FROM public.community_alerts WHERE district = 'Hassan');

INSERT INTO public.community_alerts (author_name, district, taluk, village, crop_name, disease_name, title, description, danger_level, upvotes)
SELECT
    'District Biosecurity Desk', 'Belagavi', 'Chikkodi', 'Nipani', 'Soybean', 'Soybean Rust',
    'Soybean Rust (Phakopsora pachyrhizi) Vigilance Alert',
    'Brown-tan pustules recorded on bottom canopy leaves in Krishna basin. Hexaconazole 5 EC (1ml/L) advised at flowering stage.',
    'Medium', 7
WHERE NOT EXISTS (SELECT 1 FROM public.community_alerts WHERE district = 'Belagavi');
