/**
 * Run all migrations in order from supabase/migrations directory
 * Usage: node scripts/run-all-migrations.js
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)

// Check if Supabase CLI is available via npx
async function checkSupabaseCLI() {
  try {
    await execPromise('npx supabase --version')
    return true
  } catch {
    return false
  }
}

// Alternative: Use psql if available
async function checkPSQL() {
  try {
    await execPromise('psql --version')
    return true
  } catch {
    return false
  }
}

async function runMigrationsWithNPM() {
  console.log('📦 Running migrations using npx supabase...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  
  console.log(`Found ${migrationFiles.length} migration(s)`)
  
  for (const file of migrationFiles) {
    console.log(`\n📄 ${file}`)
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf8')
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(sql)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Please copy the SQL above and run it in Supabase SQL Editor\n')
  }
}

async function main() {
  const hasCLI = await checkSupabaseCLI()
  
  if (hasCLI) {
    console.log('✅ Supabase CLI found via npx')
    console.log('To link your project: npx supabase link --project-ref YOUR_PROJECT_REF')
    console.log('To push migrations: npx supabase db push\n')
  } else {
    console.log('ℹ️  Supabase CLI not found. Showing migration files to run manually.\n')
  }
  
  await runMigrationsWithNPM()
  
  console.log('\n💡 Tip: Install Supabase CLI for easier migration management:')
  console.log('   Visit: https://github.com/supabase/cli#install-the-cli')
}

main()
