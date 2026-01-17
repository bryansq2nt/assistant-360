-- Assistant 360 - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('SERVICE', 'PRODUCT', 'BOTH')),
  offer_type TEXT NOT NULL CHECK (offer_type IN ('SERVICE', 'PRODUCT', 'BOTH')),
  hours TEXT NOT NULL,
  service_area TEXT,
  tagline TEXT,
  about TEXT,
  booking_method TEXT CHECK (booking_method IN ('WALK_IN', 'APPOINTMENT', 'ONLINE', 'PHONE', 'MESSAGE')),
  primary_language TEXT DEFAULT 'es',
  brand_tone TEXT DEFAULT 'FRIENDLY' CHECK (brand_tone IN ('FRIENDLY', 'PROFESSIONAL', 'CASUAL', 'FORMAL')),
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED')),
  plan TEXT DEFAULT 'TRIAL' CHECK (plan IN ('TRIAL', 'BASIC', 'PRO', 'ENTERPRISE')),
  trial_ends_at TIMESTAMPTZ,
  message_limit_per_month INTEGER DEFAULT 500,
  message_count_this_month INTEGER DEFAULT 0,
  public_slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_offerings table
CREATE TABLE IF NOT EXISTS business_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('SERVICE', 'PRODUCT')),
  name TEXT NOT NULL,
  category TEXT,
  starting_price TEXT,
  short_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_owner_id ON business_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_public_slug ON business_profiles(public_slug);
CREATE INDEX IF NOT EXISTS idx_business_offerings_business_id ON business_offerings(business_id);

-- Enable Row Level Security (RLS)
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_offerings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_profiles
-- Users can only see their own businesses
CREATE POLICY "Users can view their own businesses"
  ON business_profiles
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can insert their own businesses
CREATE POLICY "Users can create their own businesses"
  ON business_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own businesses
CREATE POLICY "Users can update their own businesses"
  ON business_profiles
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own businesses
CREATE POLICY "Users can delete their own businesses"
  ON business_profiles
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create RLS policies for business_offerings
-- Users can view offerings of their businesses
CREATE POLICY "Users can view offerings of their businesses"
  ON business_offerings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_offerings.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- Users can insert offerings for their businesses
CREATE POLICY "Users can create offerings for their businesses"
  ON business_offerings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_offerings.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- Users can update offerings of their businesses
CREATE POLICY "Users can update offerings of their businesses"
  ON business_offerings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_offerings.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_offerings.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );

-- Users can delete offerings of their businesses
CREATE POLICY "Users can delete offerings of their businesses"
  ON business_offerings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_offerings.business_id
      AND business_profiles.owner_id = auth.uid()
    )
  );
