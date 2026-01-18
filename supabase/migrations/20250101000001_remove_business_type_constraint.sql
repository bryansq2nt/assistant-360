-- Remove the CHECK constraint on business_type column
-- This allows storing custom business types like "Comida: Panadería / Repostería"
-- instead of being limited to 'SERVICE', 'PRODUCT', 'BOTH'

-- Drop the constraint if it exists
ALTER TABLE public.business_profiles 
DROP CONSTRAINT IF EXISTS business_profiles_business_type_check;

-- The business_type column remains as TEXT, but now without restrictions
-- This allows flexible storage of category:subcategory format
