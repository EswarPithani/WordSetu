// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE_URL = "https://wordsetu.onrender.com";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// ---------------------------------------------
// ✅ Utility: Error logger
// ---------------------------------------------
const logError = (context, error) => {
  console.error(`❌ ${context}:`, {
    message: error.message,
    status: error.response?.status,
    response: error.response?.data,
    url: error.config?.url,
  });
};

// ---------------------------------------------
// ✅ Backend availability
// ---------------------------------------------
let isBackendAvailable = true;

export const testBackendConnection = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/words`, {
      params: { limit: 1 },
      timeout: 5000,
    });
    isBackendAvailable = true;
    console.log('✅ Backend is available');
    return true;
  } catch (error) {
    isBackendAvailable = false;
    console.log('❌ Backend is not available');
    return false;
  }
};

// ---------------------------------------------
// ✅ Words API
// ---------------------------------------------
export const getWordsPage = async (page = 1, limit = 20, search = '', sortBy = 'word') => {
  try {
    console.log(`📖 Fetching page ${page} with ${limit} words (sorted by ${sortBy})`);

    const res = await axios.get(`${BASE_URL}/api/words`, {
      params: { page, limit, search, sortBy },
      timeout: 10000,
    });

    console.log(`✅ Page ${page}/${res.data.totalPages}: ${res.data.words.length} words`);
    return res.data;
  } catch (error) {
    logError('Error fetching words page', error);
    return { words: [], totalPages: 0, currentPage: page };
  }
};

export const getWordDetails = async (word) => {
  try {
    console.log(`🔍 Fetching details for: "${word}"`);
    const res = await axios.get(`${BASE_URL}/api/words/${encodeURIComponent(word)}`, {
      timeout: 10000,
    });
    return res.data;
  } catch (error) {
    logError('Error fetching word details', error);
    return null;
  }
};

// ✅ FIXED SEARCH
export const searchWords = async (q, limit = 20, page = 1) => {
  if (!q || q.trim() === "") return { words: [], hasNextPage: false };

  try {
    console.log(`🌍 Calling search API: ${BASE_URL}/api/words/search?q=${q}&limit=${limit}&page=${page}`);

    console.log(`🔎 Searching "${q}" (page ${page})`);
    const res = await axios.get(`${BASE_URL}/api/words/search`, {
      params: { q: q, limit, page },
      timeout: 8000,
    });
    return Array.isArray(res.data) ? res.data : res.data.words || [];

  } catch (error) {
    logError('Search error', error);
    return { words: [], hasNextPage: false };
  }
};

export const getUsefulWords = async () => {
  const response = await fetch(`${BASE_URL}/api/words/useful`);
  return await response.json();
};

// ---------------------------------------------
// ✅ Categories, Daily Word, User
// ---------------------------------------------
export const getWordsByCategory = async (category, page = 1, limit = 20) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/words/category/${encodeURIComponent(category)}`, {
      params: { page, limit },
      timeout: 10000,
    });
    return res.data;
  } catch (error) {
    logError(`Error getting category ${category}`, error);
    return { words: [], hasNextPage: false };
  }
};

export const getDailyWord = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/word/today`, { timeout: 8000 });
    return res.data;
  } catch (error) {
    logError("Error fetching daily word", error);
    return null;
  }
};

export const getHistory = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error("No token");

    const res = await axios.get(`${BASE_URL}/api/user/history`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return res.data;
  } catch (error) {
    logError("Error fetching history", error);
    return [];
  }
};

export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error("No token");

    const res = await axios.get(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    return res.data.user || res.data.data || res.data;
  } catch (error) {
    logError("Profile fetch error", error);
    return null;
  }
};

// ---------------------------------------------
// ✅ Auth APIs (FRONTEND ONLY - FIXED)
// ---------------------------------------------
export const signupUser = async (name, email, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/signup`, { name, email, password }, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    if (res.data.token) await AsyncStorage.setItem('token', res.data.token);
    return res.data;
  } catch (error) {
    logError("Signup error", error);
    return { error: error.response?.data?.message || "Signup failed" };
  }
};

// ✅ FIXED: Proper frontend login function
export const loginUser = async (email, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password }, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    if (res.data.token) await AsyncStorage.setItem('token', res.data.token);
    return res.data;
  } catch (error) {
    logError("Login error", error);
    return { error: error.response?.data?.message || "Login failed" };
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/reset-password`,
      { email, newPassword },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// ---------------------------------------------
// ✅ Debug & Admin
// ---------------------------------------------
export const clearAuthToken = async () => {
  await AsyncStorage.removeItem('token');
  console.log("🗑️ Token cleared");
};

export const testAllAPIs = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/words`, {
      params: { limit: 5 },
      timeout: 5000,
    });
    console.log("✅ API test success:", res.data);
    return true;
  } catch (error) {
    logError("API test failed", error);
    return false;
  }
};

export const clearWordsCache = async () => {
  try {
    await AsyncStorage.removeItem("allWords");
    await AsyncStorage.removeItem("lastWord");
    console.log("✅ Words cache cleared");
  } catch (error) {
    console.error("❌ Error clearing words cache:", error);
  }
};

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

export const addWordToHistory = (wordData) =>
  api.post('/user/history', wordData).then(res => res.data);

export const clearHistory = () =>
  api.delete('/user/history').then(res => res.data);

export const deleteWordFromHistory = (wordId) =>
  api.delete(`/user/history/${wordId}`).then(res => res.data);
