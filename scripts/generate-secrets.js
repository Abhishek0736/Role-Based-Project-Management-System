#!/usr/bin/env node

import crypto from 'crypto';

console.log('🔐 Generating secure JWT secrets...\n');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy these to your .env file:');
console.log('================================');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${refreshSecret}`);
console.log('================================\n');

console.log('⚠️  IMPORTANT:');
console.log('- Keep these secrets secure');
console.log('- Never commit them to version control');
console.log('- Use different secrets for production');
console.log('- Store them safely in your deployment platform\n');