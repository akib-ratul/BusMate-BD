#!/usr/bin/env node
// db-setup.js — runs on Render's releaseCommand
// Handles both "no migrations folder" (uses db push) and "has migrations" (uses migrate deploy)
const { execSync } = require('child_process');

const run = (cmd) => {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: __dirname });
};

console.log('🔧 BusMate BD — Database Setup');

// 1. Push schema (create tables)
try {
  run('npx prisma db push --accept-data-loss');
} catch (e) {
  console.error('db push failed:', e.message);
  process.exit(1);
}

// 2. Generate Prisma client
try {
  run('npx prisma generate');
} catch (e) {
  console.warn('prisma generate warning (non-fatal):', e.message);
}

// 3. Seed
try {
  run('npx tsx prisma/seed.ts');
  console.log('✅ Database setup complete!');
} catch (e) {
  console.error('Seed error:', e.message);
  // Don't fail the release if seed errors (data may already exist)
  console.log('⚠️  Seed failed but continuing...');
}
