/**
 * Script to run Supabase migrations from terminal
 * Usage: node scripts/run-migration.js <migration-file.sql>
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', migrationFile)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  console.log(`📄 Running migration: ${migrationFile}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Use Supabase REST API to execute SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql }),
    })

    if (response.ok) {
      console.log('✅ Migration executed successfully!')
      const result = await response.text()
      if (result) console.log(result)
    } else {
      // Try alternative method - use direct SQL execution via REST
      console.log('⚠️  Trying alternative method...')
      await runSQLDirectly(sql)
    }
  } catch (error) {
    console.error('❌ Error executing migration:', error.message)
    
    // Fallback: Show instructions
    console.log('\n📋 Alternative: Run this SQL directly in Supabase SQL Editor:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(sql)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    process.exit(1)
  }
}

async function runSQLDirectly(sql) {
  // Alternative: Use PostgREST query builder or direct connection
  // This requires the exec_sql function to exist in Supabase
  console.log('ℹ️  Direct SQL execution requires exec_sql function.')
  console.log('   Please run the SQL manually in Supabase SQL Editor.')
}

// Get migration file from command line args
const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Usage: node scripts/run-migration.js <migration-file.sql>')
  console.error('\nExample: node scripts/run-migration.js supabase/migrations/20250101000000_add_address_and_delivery.sql')
  process.exit(1)
}

runMigration(migrationFile)
