/**
 * Simple script to show migration SQL content
 * Usage: node scripts/show-migration.js <migration-file>
 *        node scripts/show-migration.js all  (shows all migrations)
 */

const fs = require('fs')
const path = require('path')

function showMigration(migrationFile) {
  if (migrationFile === 'all') {
    // Show all migrations in order
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    
    if (!fs.existsSync(migrationsDir)) {
      console.error(`❌ Migrations directory not found: ${migrationsDir}`)
      process.exit(1)
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
    
    console.log(`\n📋 Found ${files.length} migration(s) to run:\n`)
    
    files.forEach((file, index) => {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      console.log(`\n${'═'.repeat(70)}`)
      console.log(`Migration ${index + 1}/${files.length}: ${file}`)
      console.log('═'.repeat(70))
      console.log(sql)
      console.log('═'.repeat(70))
      
      if (index < files.length - 1) {
        console.log('\n')
      }
    })
    
    console.log('\n💡 Copy each migration above and run it in Supabase SQL Editor\n')
    return
  }
  
  // Show single migration
  const migrationPath = path.join(__dirname, '..', migrationFile)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`)
    console.error('\nAvailable migrations:')
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    if (fs.existsSync(migrationsDir)) {
      fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
        .forEach(f => console.error(`  - supabase/migrations/${f}`))
    }
    process.exit(1)
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  console.log('\n' + '═'.repeat(70))
  console.log(`📄 Migration: ${migrationFile}`)
  console.log('═'.repeat(70))
  console.log(sql)
  console.log('═'.repeat(70))
  console.log('\n💡 Copy the SQL above and run it in Supabase SQL Editor\n')
}

const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Usage: node scripts/show-migration.js <migration-file> | all')
  console.error('\nExamples:')
  console.error('  node scripts/show-migration.js supabase/migrations/20250101000000_add_address_and_delivery.sql')
  console.error('  node scripts/show-migration.js all  (shows all migrations)\n')
  process.exit(1)
}

showMigration(migrationFile)
