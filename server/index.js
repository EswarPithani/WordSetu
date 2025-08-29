const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Word = require("./models/Word");  // ✅ Make sure the path is correct

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // or specific frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const userRoutes = require('./routes/user');

// Add this to your server startup code
async function createWordIndex() {
  try {
    await Word.collection.createIndex({ word: 1 }); // ✅ normal ascending index
    console.log("✅ Index created on 'word' for fast search");
  } catch (error) {
    console.log("⚠️ Index may already exist or failed:", error.message);
  }
}


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log("✅ MongoDB connected");
    await createWordIndex(); // create index only after connection
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test route
app.get('/', (req, res) => {
  res.send('Server running');
});



// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const wordRoutes = require('./routes/words');
app.use('/api/word', wordRoutes);

app.use('/api/user', userRoutes);
const wordsRouter = require('./routes/words');
app.use('/api/words', wordsRouter);



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
