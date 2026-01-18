-- Quick fix for business_offerings table
-- Run this in Supabase SQL Editor to add missing columns

-- Add description column (rename short_description if it exists, or create new)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE public.business_offerings RENAME COLUMN short_description TO description;
  ELSE
    ALTER TABLE public.business_offerings ADD COLUMN description TEXT;
  END IF;
END $$;

-- Ensure description column exists (fallback)
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Handle type column (rename kind if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'kind'
  ) THEN
    ALTER TABLE public.business_offerings RENAME COLUMN kind TO type;
    UPDATE public.business_offerings SET type = LOWER(type) WHERE type IN ('SERVICE', 'PRODUCT');
  END IF;
END $$;

-- Ensure type column exists
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS type TEXT;

-- Update type constraint
ALTER TABLE public.business_offerings 
DROP CONSTRAINT IF EXISTS business_offerings_type_check;

ALTER TABLE public.business_offerings 
DROP CONSTRAINT IF EXISTS business_offerings_kind_check;

ALTER TABLE public.business_offerings 
ADD CONSTRAINT business_offerings_type_check CHECK (type IN ('service', 'product'));

-- Handle price_from (rename starting_price if it exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'starting_price'
  ) THEN
    ALTER TABLE public.business_offerings RENAME COLUMN starting_price TO price_from;
    -- Try to convert to numeric
    BEGIN
      ALTER TABLE public.business_offerings 
      ALTER COLUMN price_from TYPE NUMERIC USING NULLIF(REGEXP_REPLACE(price_from::TEXT, '[^0-9.]', '', 'g'), '')::NUMERIC;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, drop and recreate
      ALTER TABLE public.business_offerings DROP COLUMN price_from;
      ALTER TABLE public.business_offerings ADD COLUMN price_from NUMERIC;
    END;
  END IF;
END $$;

-- Ensure price_from exists
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS price_from NUMERIC;

-- Add is_active column
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_offerings' 
  AND column_name IN ('type', 'description', 'price_from', 'is_active')
ORDER BY column_name;
