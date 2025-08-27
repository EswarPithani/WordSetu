// server/scripts/verifyEnrichment.js
require('dotenv').config();
const mongoose = require('mongoose');
const Word = require('../models/Word');

const verifyEnrichment = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const totalWords = await Word.countDocuments();
    const enrichedWords = await Word.countDocuments({
        source: 'enriched',
        meaning: { $not: { $regex: '^Definition for' } }
    });
    const pendingWords = await Word.countDocuments({
        $or: [
            { meaning: { $regex: '^Definition for' } },
            { meaning: { $exists: false } }
        ]
    });

    console.log('📊 Enrichment Status:');
    console.log(`   Total words: ${totalWords}`);
    console.log(`   Enriched words: ${enrichedWords}`);
    console.log(`   Pending enrichment: ${pendingWords}`);
    console.log(`   Completion: ${((enrichedWords / totalWords) * 100).toFixed(1)}%`);

    // Show some enriched words
    const sampleEnriched = await Word.find({ source: 'enriched' })
        .limit(3)
        .select('word meaning example translations');

    console.log('\n🔍 Sample enriched words:');
    sampleEnriched.forEach(word => {
        console.log(`\n   Word: ${word.word}`);
        console.log(`   Meaning: ${word.meaning.substring(0, 60)}...`);
        console.log(`   Example: ${word.example.substring(0, 60)}...`);
        console.log(`   Translations:`, word.translations);
    });

    process.exit(0);
};

verifyEnrichment();