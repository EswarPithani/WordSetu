const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('/api/user/profile error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT to modify profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.name = name;
    await user.save();
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('/api/user/profile PUT error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get user's word history with pagination
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id).select('wordHistory');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Sort by date descending
    const sortedHistory = [...user.wordHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // ✅ Apply pagination
    const paginated = sortedHistory.slice(skip, skip + limit);

    res.json({
      history: paginated,
      pagination: {
        page,
        limit,
        total: sortedHistory.length,
        hasMore: skip + limit < sortedHistory.length
      }
    });
  } catch (err) {
    console.error("Error in /history route:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Add word to history
router.post('/history', auth, async (req, res) => {
  try {
    const { word, meaning, example, isDailyWord } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if word already exists today to prevent duplicates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingWordIndex = user.wordHistory.findIndex(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return item.word === word && itemDate.getTime() === today.getTime();
    });

    if (existingWordIndex !== -1) {
      // Update existing word
      user.wordHistory[existingWordIndex] = {
        word,
        meaning,
        example: example || '',
        isDailyWord: isDailyWord || false,
        date: new Date()
      };
    } else {
      // Add new word
      user.wordHistory.unshift({
        word,
        meaning,
        example: example || '',
        isDailyWord: isDailyWord || false,
        date: new Date()
      });

      // Update streak for new words (only once per day)
      if (isDailyWord || !user.lastWordDate || isNewDay(user.lastWordDate)) {
        user.updateStreak();
      }

      // Update words learned count
      user.wordsLearned += 1;
    }

    await user.save();

    res.json({
      message: 'Word added to history',
      streak: user.streak,
      wordsLearned: user.wordsLearned
    });
  } catch (err) {
    console.error("Error adding word to history:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Clear word history
router.delete('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const deletedCount = user.wordHistory.length;
    user.wordHistory = [];
    user.wordsLearned = 0;

    await user.save();

    res.json({
      message: 'History cleared successfully',
      deletedCount
    });
  } catch (err) {
    console.error("Error clearing history:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Delete specific word from history
router.delete('/history/:wordId', auth, async (req, res) => {
  try {
    const { wordId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the word by ID (MongoDB automatically adds _id to subdocuments)
    const wordIndex = user.wordHistory.findIndex(item => item._id.toString() === wordId);

    if (wordIndex === -1) {
      return res.status(404).json({ error: "Word not found in history" });
    }

    // Remove the word
    user.wordHistory.splice(wordIndex, 1);
    user.wordsLearned = Math.max(0, user.wordsLearned - 1);

    await user.save();

    res.json({ message: 'Word removed from history' });
  } catch (err) {
    console.error("Error deleting word from history:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to check if it's a new day
function isNewDay(lastDate) {
  if (!lastDate) return true;

  const last = new Date(lastDate);
  const now = new Date();

  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return last.getTime() !== now.getTime();
}

module.exports = router;