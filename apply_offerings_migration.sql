-- Migration to update business_offerings table structure
-- Run this in Supabase SQL Editor

-- Step 1: Drop old constraint
ALTER TABLE public.business_offerings 
DROP CONSTRAINT IF EXISTS business_offerings_kind_check;

-- Step 2: Rename kind to type (if column exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'kind'
  ) THEN
    ALTER TABLE public.business_offerings RENAME COLUMN kind TO type;
    -- Update values to lowercase
    UPDATE public.business_offerings SET type = LOWER(type) WHERE type IN ('SERVICE', 'PRODUCT');
  END IF;
END $$;

-- Step 3: Add type column if it doesn't exist
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('service', 'product'));

-- Step 4: Add CHECK constraint for type
ALTER TABLE public.business_offerings 
DROP CONSTRAINT IF EXISTS business_offerings_type_check;

ALTER TABLE public.business_offerings 
ADD CONSTRAINT business_offerings_type_check CHECK (type IN ('service', 'product'));

-- Step 5: Handle price_from (rename starting_price if exists, or add new)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'starting_price'
  ) THEN
    -- Try to convert to numeric, but keep as text if conversion fails
    BEGIN
      ALTER TABLE public.business_offerings 
      ALTER COLUMN starting_price TYPE NUMERIC USING NULLIF(REGEXP_REPLACE(starting_price, '[^0-9.]', '', 'g'), '')::NUMERIC;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, we'll handle it differently
      NULL;
    END;
    ALTER TABLE public.business_offerings RENAME COLUMN starting_price TO price_from;
  END IF;
END $$;

-- Add price_from if it doesn't exist
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS price_from NUMERIC;

-- Step 6: Rename short_description to description
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_offerings' AND column_name = 'short_description'
  ) THEN
    ALTER TABLE public.business_offerings RENAME COLUMN short_description TO description;
  END IF;
END $$;

-- Add description if it doesn't exist
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 7: Add is_active column
ALTER TABLE public.business_offerings 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 8: Remove category column if not needed
-- ALTER TABLE public.business_offerings DROP COLUMN IF EXISTS category;
