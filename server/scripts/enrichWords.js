require('dotenv').config();
const mongoose = require('mongoose');
const Word = require('../models/Word');
const axios = require('axios');

// Rate limiting to avoid API bans
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const enrichWords = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get words that need enrichment (no definition yet)
    const wordsToEnrich = await Word.find({
      $or: [
        { meaning: { $regex: '^Definition for' } }, // Placeholder definitions
        { meaning: { $exists: false } }
      ],
      isActive: true
    }).limit(500); // Process in batches

    console.log(`📝 Found ${wordsToEnrich.length} words to enrich`);

    for (const wordDoc of wordsToEnrich) {
      try {
        console.log(`🔍 Enriching: ${wordDoc.word}`);

        // 1. Get definition from Dictionary API
        const wordDetails = await fetchWordDetails(wordDoc.word);

        // 2. Get translations
        const translations = await fetchTranslations(wordDoc.word);

        // 3. Update the word in database
        await Word.findByIdAndUpdate(wordDoc._id, {
          meaning: wordDetails.meaning,
          example: wordDetails.example,
          phonetic: wordDetails.phonetic,
          partOfSpeech: wordDetails.partOfSpeech,
          synonyms: wordDetails.synonyms,
          antonyms: wordDetails.antonyms,
          translations: {
            spanish: translations.es || '',
            french: translations.fr || '',
            german: translations.de || '',
            hindi: translations.hi || '',
            telugu: translations.te || ''
          },
          lastFetched: new Date(),
          source: 'enriched'
        });

        console.log(`✅ Enriched: ${wordDoc.word}`);

        // Be nice to the APIs - add delay between requests
        await delay(1000); // 1 second delay

      } catch (error) {
        console.error(`❌ Failed to enrich ${wordDoc.word}:`, error.message);
        // Mark as problematic but don't stop
        await Word.findByIdAndUpdate(wordDoc._id, {
          isActive: false,
          lastFetched: new Date()
        });
      }
    }

    console.log('🎉 Enrichment process completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Enrichment error:', error.message);
    process.exit(1);
  }
};

// Fetch word details from Dictionary API
async function fetchWordDetails(word) {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      { timeout: 5000 }
    );

    const wordData = response.data[0];
    const firstMeaning = wordData.meanings[0];
    const firstDefinition = firstMeaning?.definitions[0];

    return {
      meaning: firstDefinition?.definition || `Definition of ${word}`,
      example: firstDefinition?.example || `Example with "${word}"`,
      phonetic: wordData.phonetic || '',
      partOfSpeech: firstMeaning?.partOfSpeech || '',
      synonyms: firstMeaning?.synonyms?.slice(0, 5) || [],
      antonyms: firstMeaning?.antonyms?.slice(0, 5) || []
    };

  } catch (error) {
    console.log(`📡 Dictionary API failed for ${word}, using fallback`);
    return {
      meaning: `Definition of ${word}`,
      example: `Example sentence with "${word}"`,
      phonetic: '',
      partOfSpeech: '',
      synonyms: [],
      antonyms: []
    };
  }
}

// Fetch translations from LibreTranslate
async function fetchTranslations(word) {
  const translations = {};
  const languages = ['es', 'fr', 'de', 'hi', 'te']; // Spanish, French, German, Hindi, Telugu

  for (const lang of languages) {
    try {
      const response = await axios.post('https://libretranslate.com/translate', {
        q: word,
        source: 'en',
        target: lang,
        format: 'text'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      translations[lang] = response.data.translatedText;
    } catch (error) {
      console.log(`🌍 Translation to ${lang} failed for ${word}`);
      translations[lang] = ''; // Empty if failed
    }

    await delay(200); // Small delay between translation requests
  }

  return translations;
}

enrichWords();