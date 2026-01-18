-- Update business_offerings table to match new structure
-- Rename kind to type (lowercase values), add new columns, update existing ones

-- First, drop existing constraints if they exist
ALTER TABLE public.business_offerings 
DROP CONSTRAINT IF EXISTS business_offerings_kind_check;

-- Rename kind column to type and update values to lowercase
-- Note: We'll handle data migration if needed
DO $$ 
BEGIN
  -- Rename column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'kind'
  ) THEN
    ALTER TABLE public.business_offerings RENAME COLUMN kind TO type;
  END IF;
END $$;

-- Update type values from uppercase to lowercase if needed
UPDATE public.business_offerings 
SET type = LOWER(type) 
WHERE type IN ('SERVICE', 'PRODUCT');

-- Add new CHECK constraint for lowercase values
ALTER TABLE public.business_offerings 
ADD CONSTRAINT business_offerings_type_check 
CHECK (type IN ('service', 'product'));

-- Rename starting_price to price_from and change to numeric
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'starting_price'
  ) THEN
    -- Convert TEXT to NUMERIC (handle conversion)
    ALTER TABLE public.business_offerings 
    ALTER COLUMN starting_price TYPE NUMERIC USING NULLIF(REGEXP_REPLACE(starting_price, '[^0-9.]', '', 'g'), '')::NUMERIC;
    
    ALTER TABLE public.business_offerings 
    RENAME COLUMN starting_price TO price_from;
  END IF;
END $$;

-- Add price_from if it doesn't exist
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS price_from NUMERIC;

-- Rename short_description to description
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE public.business_offerings 
    RENAME COLUMN short_description TO description;
  END IF;
END $$;

-- Add description if it doesn't exist
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Remove category column if exists (not needed in new structure)
ALTER TABLE public.business_offerings 
DROP COLUMN IF EXISTS category;

-- Add is_active column if it doesn't exist
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Remove updated_at if we don't need it
-- ALTER TABLE public.business_offerings DROP COLUMN IF EXISTS updated_at;
