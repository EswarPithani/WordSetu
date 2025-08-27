# 📚 WordSetu – Learn a Word a Day

WordSetu is a cross-platform **language learning app** built with **React Native** and a **MERN backend**.  
It helps users learn **Hindi, Telugu, and English** words every day with meanings, translations, pronunciation, and history tracking.

---

## ✨ Features

- 🔤 **Daily Word Feed** – Learn a new word each day in Hindi, Telugu, and English  
- ⭐ **Favorites & History** – Save and review words anytime  
- 🔔 **Push Notifications** – Daily reminder to learn your word  
- 🗣️ **Text-to-Speech** – Hear pronunciation in supported languages  
- 🎨 **Dark/Light Theme** – Auto adapts to system theme  
- 🌍 **Multi-language Support** – UI and dictionary data  

---

## 🏗️ Tech Stack

**Frontend (client):**
- React Native (Expo SDK 53)
- React Navigation
- AsyncStorage
- Lottie Animations
- Expo Notifications & Speech

**Backend (server):**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt.js for password hashing

---

## 📂 Project Structure

```bash
Learn-a-word/
├── client/               # React Native (Expo) app
│   ├── assets/           # App icons, splash, animations
│   ├── screens/          # App screens (Home, Favorites, History, Profile, About)
│   ├── components/       # Reusable UI components
│   ├── context/          # Theme + Auth contexts
│   ├── services/         # API service (Axios calls)
│   ├── App.js            # Entry point
│   └── package.json
│
├── server/               # Backend (Express + MongoDB)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes (auth, words, history)
│   ├── controllers/      # Business logic
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md


🚀 Getting Started
1️⃣ Clone the repo
git clone https://github.com/yourusername/wordsetu.git
cd wordsetu

2️⃣ Setup Backend (server)
cd server
npm install
npm run dev   # starts Express server (nodemon)


Make sure you set your MongoDB URI in .env file:

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/wordsetu
JWT_SECRET=your-secret-key

3️⃣ Setup Frontend (client)
cd ../client
npm install
npx expo start   # or 'npm run android' / 'npm run ios'

4️⃣ Build App with EAS
cd client
eas build -p android   # Android build
eas build -p ios       # iOS build


🛠️ Scripts

Client:

npm run start      # start Expo dev server
npm run android    # run app on Android
npm run ios        # run app on iOS
npm run web        # run app in browser


Server:

npm run dev        # start backend in dev mode
npm run start      # start backend in production

🌟 Future Improvements

📖 Word of the Day streak system

📊 User progress tracking dashboard

🤝 Social sharing & leaderboard

📜 License

This project is licensed under the MIT License.
