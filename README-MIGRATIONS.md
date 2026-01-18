# 🗄️ Running Supabase Migrations

## Quick Start

### Option 1: Using npx supabase (Recommended)

1. **Link your Supabase project** (first time only):
   ```bash
   npm run db:link YOUR_PROJECT_REF
   ```
   Get your project ref from: Supabase Dashboard → Settings → General → Reference ID

2. **Push all migrations**:
   ```bash
   npm run db:migrate:apply
   ```

### Option 2: Show SQL and run manually

Show all migrations to copy-paste:
```bash
npm run db:migrate
```

Or show a specific migration:
```bash
node scripts/show-migration.js supabase/migrations/20250101000000_add_address_and_delivery.sql
```

Then copy the SQL and run it in Supabase SQL Editor.

## Available Commands

- `npm run db:migrate` - Shows all migration SQL files
- `npm run db:migrate:apply` - Pushes migrations to remote Supabase (requires linking first)
- `npm run db:link PROJECT_REF` - Links local project to remote Supabase

## Migration Files

All migrations are in `supabase/migrations/`:
- `20250101000000_add_address_and_delivery.sql` - Adds address and delivery columns
- `20250101000001_remove_business_type_constraint.sql` - Removes business_type constraint
- `20250101000002_update_business_offerings.sql` - Updates offerings table structure

## Troubleshooting

If `npx supabase db push` fails:
1. Make sure you've linked your project: `npm run db:link YOUR_PROJECT_REF`
2. Check that you're logged in: `npx supabase login`
3. Use the manual method: `npm run db:migrate` and copy-paste SQL
