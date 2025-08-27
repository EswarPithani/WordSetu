// server/models/Translation.js - Translation Cache
const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    originalWord: { type: String, required: true, index: true },
    language: { type: String, required: true, index: true }, // es, fr, de, hi, te, etc.
    translatedWord: { type: String, required: true },
    provider: { type: String, default: 'LibreTranslate' },
    lastUpdated: { type: Date, default: Date.now }
});

// Compound index for faster lookups
translationSchema.index({ originalWord: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('Translation', translationSchema);