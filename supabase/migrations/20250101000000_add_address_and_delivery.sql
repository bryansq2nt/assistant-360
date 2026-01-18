-- Add business_address and delivery_area columns to business_profiles
-- This migration adds support for physical location and delivery areas

ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS business_address TEXT;

ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS delivery_area TEXT;

-- No RLS policy changes needed as existing row-based policies will continue to work
