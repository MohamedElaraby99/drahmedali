#!/usr/bin/env node

/**
 * Script to run the username index removal migration
 * Usage: node backend/scripts/run-username-migration.js
 */

import removeUsernameIndex from '../migrations/removeUsernameIndex.js';

console.log('🚀 Starting username index removal migration...');
console.log('This will:');
console.log('  1. Remove the username index from the users collection');
console.log('  2. Remove the username field from all user documents');
console.log('  3. Fix the E11000 duplicate key error');
console.log('');

removeUsernameIndex()
    .then(() => {
        console.log('');
        console.log('🎉 Migration completed successfully!');
        console.log('✅ Username index has been removed');
        console.log('✅ Username field has been removed from all documents');
        console.log('✅ E11000 duplicate key error should now be fixed');
        console.log('');
        console.log('You can now create new users without the username field.');
    })
    .catch((error) => {
        console.error('');
        console.error('💥 Migration failed!');
        console.error('Error:', error.message);
        console.error('');
        console.error('Please check your database connection and try again.');
        process.exit(1);
    });
