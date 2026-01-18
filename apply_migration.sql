-- Apply this SQL in Supabase SQL Editor
-- This migration adds missing columns and fixes business_type constraint

-- 1. Add business_address and delivery_area columns
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS business_address TEXT;

ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS delivery_area TEXT;

-- 2. Remove the CHECK constraint on business_type
-- This allows storing custom business types like "Comida: Panadería / Repostería"
-- instead of being limited to 'SERVICE', 'PRODUCT', 'BOTH'
ALTER TABLE public.business_profiles 
DROP CONSTRAINT IF EXISTS business_profiles_business_type_check;

-- Verify the changes (optional check)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
  AND column_name IN ('business_address', 'delivery_area');
