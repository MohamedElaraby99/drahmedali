#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
mongoose.set('strictQuery', false);

const maskCredentials = (uri) => {
    if (!uri) return uri;
    return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
};

const resolveMongoUri = () => {
    const direct = process.env.MONGODB_URI || process.env.MONGO_URL;
    if (direct) return direct;

    const dbType = (process.env.DB_TYPE || 'atlas').toLowerCase();
    const map = {
        atlas: process.env.MONGO_URI_ATLAS,
        compass: process.env.MONGO_URI_COMPASS,
        community: process.env.MONGO_URI_COMMUNITY,
    };
    if (map[dbType]) return map[dbType];

    return 'mongodb://localhost:27017/theeagle';
};

const parseArgs = () => {
    const raw = process.argv.slice(2);
    const flags = new Set(raw.filter((a) => a.startsWith('-')));
    const getVal = (key) => {
        const idx = raw.findIndex((a) => a === key);
        return idx !== -1 ? raw[idx + 1] : undefined;
    };
    const csvToSet = (s) => new Set((s || '').split(',').map((x) => x.trim()).filter(Boolean));

    return {
        yes: flags.has('--yes') || flags.has('-y') || flags.has('--force'),
        only: csvToSet(getVal('--only')),
        keep: csvToSet(getVal('--keep')),
    };
};

const printUsage = (uri) => {
    console.log('\nThis script deletes ALL DOCUMENTS from collections without dropping them.');
    console.log('Indexes and collection definitions are preserved.');
    console.log('\nResolved connection string:');
    console.log(`  ${maskCredentials(uri)}`);
    console.log('\nUsage:');
    console.log('  node scripts/clear-collections.js --yes [--only col1,col2] [--keep colA,colB]');
};

const listCollectionsWithCounts = async () => {
    const cols = await mongoose.connection.db.listCollections().toArray();
    const details = [];
    for (const col of cols) {
        if (col.name.startsWith('system.')) continue;
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        details.push({ name: col.name, count });
    }
    return details.sort((a, b) => a.name.localeCompare(b.name));
};

const clearCollections = async ({ only, keep }) => {
    const cols = await mongoose.connection.db.listCollections().toArray();
    let totalDeleted = 0;
    for (const { name } of cols) {
        if (name.startsWith('system.')) continue;
        if (only.size && !only.has(name)) continue;
        if (keep.has(name)) continue;

        try {
            const res = await mongoose.connection.db.collection(name).deleteMany({});
            const deleted = res.deletedCount || 0;
            totalDeleted += deleted;
            console.log(`  Cleared '${name}': deleted ${deleted}`);
        } catch (err) {
            console.log(`  Skipped '${name}' due to error: ${err.message}`);
        }
    }
    return totalDeleted;
};

const run = async () => {
    const args = parseArgs();
    const uri = resolveMongoUri();

    if (!args.yes) {
        printUsage(uri);
        console.log('\nRefusing to proceed without --yes flag.');
        process.exit(1);
    }

    if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
        console.log('\nRefusing to clear collections in production without explicit --force.');
        process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log(`URI: ${maskCredentials(uri)}`);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    console.log(`✅ Connected. DB: ${mongoose.connection.name} @ ${mongoose.connection.host}`);

    const before = await listCollectionsWithCounts();
    console.log('\nCollections before:');
    if (before.length === 0) {
        console.log('  (none)');
    } else {
        for (const { name, count } of before) console.log(`  - ${name}: ${count}`);
    }

    console.log('\nDeleting documents...');
    const total = await clearCollections({ only: args.only, keep: args.keep });
    console.log(`\n✅ Done. Total documents deleted: ${total}`);

    const after = await listCollectionsWithCounts();
    console.log('\nCollections after:');
    if (after.length === 0) {
        console.log('  (none)');
    } else {
        for (const { name, count } of after) console.log(`  - ${name}: ${count}`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
};

run();


