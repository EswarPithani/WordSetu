// server/routes/words.js
const express = require("express");
const router = express.Router();
const Word = require("../models/Word");
const axios = require("axios");
require("dotenv").config();

/**
 * ✅ 1. Get paginated words
 * Example: GET /api/words?limit=20&page=2&sortBy=word
 */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "word"; // default alphabetical

    // Build query
    let query = { isActive: true };
    if (search) {
      query.word = { $regex: search, $options: "i" };
    }

    // Sorting logic
    let sortOptions = { word: 1 };
    if (sortBy === "frequency") {
      sortOptions = { frequency: -1, word: 1 };
    } else if (sortBy === "reverse") {
      sortOptions = { word: -1 };
    }

    const words = await Word.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "word meaning example phonetic partOfSpeech synonyms antonyms translations frequency"
      );

    const totalWords = await Word.countDocuments(query);

    res.json({
      words,
      currentPage: page,
      totalPages: Math.ceil(totalWords / limit),
      totalWords,
      hasNextPage: page < Math.ceil(totalWords / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("❌ Error fetching words:", error);
    res.status(500).json({ message: "Failed to fetch words" });
  }
});

let cachedUsefulWords = null;
let lastGeneratedDate = null;

/**
 * ✅ 2. Get useful words (500 words)
 * Example: GET /api/words/useful
 */
router.get("/useful", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    if (lastGeneratedDate !== today || !cachedUsefulWords) {
      const limit = 500;
      cachedUsefulWords = await Word.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: limit } }
      ]);
      lastGeneratedDate = today;
    }

    res.json({ words: cachedUsefulWords });
  } catch (error) {
    console.error("❌ Useful words fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch useful words" });
  }
});


/**
 * ✅ 3. Fast search (prefix + regex)
 * Example: GET /api/words/search?q=apple
 */
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 20;

    if (!query.trim()) {
      return res.json({ words: [] });
    }

    const results = [];

    // Exact match
    const exact = await Word.findOne({ word: query.toLowerCase(), isActive: true })
      .select("word meaning example phonetic partOfSpeech synonyms antonyms translations frequency");

    if (exact) results.push(exact);

    // Related words (prefix search)
    const related = await Word.find({
      word: { $regex: `^${query}`, $options: "i" },
      isActive: true,
      _id: { $ne: exact?._id },
    })
      .sort({ word: 1 })
      .limit(limit)
      .select("word meaning example phonetic partOfSpeech synonyms antonyms translations frequency");

    results.push(...related);

    // ⚡ Don't fetch translations here! Only provide existing DB translations
    // On click, frontend will call /words/:word to get translations if missing

    res.json({ words: results });
  } catch (error) {
    console.error("❌ Search error:", error.message);
    res.status(500).json({ message: "Search failed" });
  }
});


/**
 * ✅ 4. Get word details (with enrichment + translations)
 * Example: GET /api/words/apple
 */
router.get("/:word", async (req, res) => {
  try {
    const wordText = req.params.word.toLowerCase();

    // 1️⃣ Try DB first
    let wordData = await Word.findOne({ word: wordText, isActive: true });

    // 2️⃣ Enrich if missing meaning/example
    if (!wordData || needsEnrichment(wordData)) {
      wordData = await fetchWordFromAPIAndSave(wordText);
    }

    if (!wordData) {
      return res.status(404).json({ message: "Word not found" });
    }

    // 3️⃣ Fetch translations if missing
    if (
      !wordData.translations?.english ||
      !wordData.translations?.hindi ||
      !wordData.translations?.telugu
    ) {
      const translations = await getTranslationsMyMemory(wordData.word, ["es", "hi", "te"]);

      await Word.findByIdAndUpdate(wordData._id, {
        translations: {
          english: translations.en || "",
          hindi: translations.hi || "",
          telugu: translations.te || "",
        },
        lastFetched: new Date(),
      });

      wordData.translations = {
        english: translations.en || "",
        hindi: translations.hi || "",
        telugu: translations.te || "",
      };
    }

    res.json(wordData);
  } catch (error) {
    console.error("❌ Error fetching word:", error);
    res.status(500).json({ message: "Failed to fetch word details" });
  }
});

/* -----------------------
   🔧 Helper Functions
-------------------------*/
function needsEnrichment(wordData) {
  return (
    !wordData.meaning ||
    wordData.meaning.startsWith("Definition for ") ||
    !wordData.example ||
    wordData.example.startsWith("Example with ") ||
    !wordData.partOfSpeech ||
    Object.values(wordData.translations || {}).every((t) => !t)
  );
}

async function fetchWordFromAPIAndSave(wordText) {
  try {
    const wordDetails = await fetchWordDetails(wordText);

    const wordData = await Word.findOneAndUpdate(
      { word: wordText },
      {
        word: wordText,
        meaning: wordDetails.meaning,
        example: wordDetails.example,
        phonetic: wordDetails.phonetic,
        partOfSpeech: wordDetails.partOfSpeech,
        synonyms: wordDetails.synonyms,
        antonyms: wordDetails.antonyms,
        source: "enriched",
        lastFetched: new Date(),
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`💾 Saved/updated word: ${wordText}`);
    return wordData;
  } catch (error) {
    console.error(`❌ Could not fetch word: ${wordText}`, error);
    return null;
  }
}

async function fetchWordDetails(word) {
  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const wordData = res.data[0];
    const firstMeaning = wordData.meanings?.[0];
    const firstDef = firstMeaning?.definitions?.[0];

    return {
      meaning: firstDef?.definition || `Definition of ${word}`,
      example: firstDef?.example || `Example with "${word}"`,
      phonetic: wordData.phonetic || "",
      partOfSpeech: firstMeaning?.partOfSpeech || "",
      synonyms: firstMeaning?.synonyms?.slice(0, 5) || [],
      antonyms: firstMeaning?.antonyms?.slice(0, 5) || [],
    };
  } catch {
    return {
      meaning: `Definition of ${word}`,
      example: `Example with "${word}"`,
      phonetic: "",
      partOfSpeech: "",
      synonyms: [],
      antonyms: [],
    };
  }
}

/* -----------------------
   🔧 MyMemory Translations
-------------------------*/
async function getTranslationsMyMemory(word) {
  const langs = ["es", "hi", "te"];
  const promises = langs.map(lang =>
    axios.get("https://api.mymemory.translated.net/get", { params: { q: word, langpair: `en|${lang}` } })
      .then(res => ({ lang, text: res.data.responseData.translatedText }))
      .catch(() => ({ lang, text: "" }))
  );

  const results = await Promise.all(promises);
  const translations = {};
  results.forEach(r => translations[r.lang] = r.text);
  return translations;
}


module.exports = router;
