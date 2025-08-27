const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true, unique: true, lowercase: true },
    meaning: { type: String, required: true },
    example: { type: String, default: '' },
    phonetic: { type: String, default: '' },
    partOfSpeech: { type: String, default: '' },
    synonyms: [{ type: String }],
    antonyms: [{ type: String }],
    translations: {
        spanish: { type: String, default: '' },
        french: { type: String, default: '' },
        german: { type: String, default: '' },
        hindi: { type: String, default: '' },
        telugu: { type: String, default: '' }
    },
    source: { type: String, default: 'external' }, // 'external' or 'preloaded'
    frequency: { type: Number, default: 1 }, // How common the word is
    lastFetched: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Keep only useful indexes
wordSchema.index({ frequency: -1 });
wordSchema.index({ lastFetched: 1 });

module.exports = mongoose.model('Word', wordSchema);
