const mongoose = require('mongoose');

const wordHistorySchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        trim: true
    },
    meaning: {
        type: String,
        required: true
    },
    example: {
        type: String,
        default: ''
    },
    isDailyWord: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now,
        index: true // Add index for faster queries
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    streak: {
        type: Number,
        default: 0
    },
    lastWordDate: {
        type: Date,
        default: null
    },
    wordsLearned: {
        type: Number,
        default: 0
    },
    wordHistory: [wordHistorySchema]
}, {
    timestamps: true
});

// Method to update user's streak
userSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.lastWordDate) {
        // First time learning a word
        this.streak = 1;
        this.lastWordDate = today;
        return;
    }

    const lastDate = new Date(this.lastWordDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Already learned today
        return;
    } else if (diffDays === 1) {
        // Consecutive day
        this.streak += 1;
    } else {
        // Broken streak
        this.streak = 1;
    }

    this.lastWordDate = today;
};

module.exports = mongoose.model('User', userSchema);