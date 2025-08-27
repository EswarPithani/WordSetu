// server/scripts/preloadWords.js
require('dotenv').config(); // ADD THIS LINE AT THE TOP
const mongoose = require('mongoose');
const Word = require('../models/Word');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const preloadWords = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGO_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing preloaded words (optional)
    await Word.deleteMany({ source: 'preloaded' });
    console.log('🧹 Cleared existing preloaded words');

    const filePath = path.join(__dirname, '../data/words.txt');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`words.txt file not found at: ${filePath}`);
    }

    console.log('📖 Reading words from file...');

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let count = 0;
    let batch = [];
    const BATCH_SIZE = 100;

    for await (const line of rl) {
      const word = line.trim().toLowerCase();

      // Skip empty lines and very short/long words
      if (!word || word.length < 2 || word.length > 20) continue;

      // Skip words with special characters
      if (!/^[a-z]+$/.test(word)) continue;

      batch.push({
        word: word,
        meaning: `Definition for ${word}`,
        example: `Example sentence with "${word}"`,
        source: 'preloaded',
        frequency: getFrequencyScore(word),
        isActive: true
      });

      if (batch.length >= BATCH_SIZE) {
        try {
          await Word.insertMany(batch, { ordered: false });
          count += batch.length;
          console.log(`✅ Preloaded ${count} words so far...`);
        } catch (batchError) {
          console.log('⚠️ Batch insert error (duplicates?):', batchError.message);
        }
        batch = [];
      }
    }

    // Insert any remaining words
    if (batch.length > 0) {
      try {
        await Word.insertMany(batch, { ordered: false });
        count += batch.length;
      } catch (error) {
        console.log('⚠️ Final batch error:', error.message);
      }
    }

    console.log(`🎉 Successfully preloaded ${count} words into database!`);

    // Verify the import
    const totalWords = await Word.countDocuments();
    const preloadedWords = await Word.countDocuments({ source: 'preloaded' });

    console.log(`📊 Total words in DB: ${totalWords}`);
    console.log(`📦 Preloaded words: ${preloadedWords}`);

    // Show some sample words
    const sampleWords = await Word.find({ source: 'preloaded' })
      .limit(5)
      .select('word frequency');

    console.log('🔍 Sample words:');
    sampleWords.forEach(word => {
      console.log(`   ${word.word} (frequency: ${word.frequency})`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Preload error:', error.message);
    process.exit(1);
  }
};

// Simple frequency scoring
function getFrequencyScore(word) {
  let score = 100;
  score -= word.length * 2;

  const commonEndings = ['ing', 'ed', 'er', 'es', 'ly', 'tion', 'ment', 'ness'];
  if (commonEndings.some(ending => word.endsWith(ending))) {
    score += 20;
  }

  const commonPrefixes = ['un', 're', 'pre', 'dis', 'mis', 'over'];
  if (commonPrefixes.some(prefix => word.startsWith(prefix))) {
    score += 15;
  }

  return Math.max(10, score);
}

preloadWords();