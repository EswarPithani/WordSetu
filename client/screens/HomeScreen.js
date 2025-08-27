import React, { useEffect, useState, useRef, useContext, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  FlatList,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { getDailyWord, getWordsPage, getWordDetails, clearWordsCache, searchWords, getUsefulWords, addWordToHistory } from '../services/api';
import {
  registerForPushNotificationsAsync,
  scheduleDailyWordNotification,
} from '../utils/notifications';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';


const HomeScreen = ({ navigation, setIsLoggedIn }) => {
  const [wordData, setWordData] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('random');
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [ttsLanguage, setTtsLanguage] = useState('en');
  const [ttsModalVisible, setTtsModalVisible] = useState(false);

  const searchTimer = useRef(null);

  const showToast = (type, title, message) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
    });
  };

  const speakWord = (word, languageCode = 'en') => {
    if (!word) return;

    let textToSpeak = word;

    if (selectedWord?.translations) {
      switch (languageCode) {
        case 'hi':
          textToSpeak = selectedWord.translations.hindi || word;
          break;
        case 'te':
          textToSpeak = selectedWord.translations.telugu || word;
          break;
        case 'en':
        default:
          textToSpeak = word;
          break;
      }
    }

    Speech.speak(textToSpeak, {
      language: languageCode,
      pitch: 1,
      rate: 1,
    });
  };



  // Optimized search function with debouncing
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (!text.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchWords(text, 20, 1);

        // Only keep minimal info (word, meaning, partOfSpeech, example)
        const words = (results.words || results || []).map(w => ({
          word: w.word,
          meaning: w.meaning,
          example: w.example,
          phonetic: w.phonetic || '',
          partOfSpeech: w.partOfSpeech || '',
          synonyms: w.synonyms || [],
          antonyms: w.antonyms || [],
          // translations not fetched yet
        }));

        setSearchResults(words);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    }, 300); // 300ms debounce
  };


  const fetchUsefulWords = async () => {
    try {
      setLoading(true);
      const response = await getUsefulWords();

      if (response.words && response.words.length > 0) {
        const formattedWords = response.words.map(word => ({
          word: word.word,
          meaning: word.meaning,
          example: word.example,
          phonetic: word.phonetic || '',
          partOfSpeech: word.partOfSpeech || '',
          synonyms: word.synonyms || [],
          antonyms: word.antonyms || []
        }));

        setAllWords(formattedWords);

        if (formattedWords.length > 0) {
          setWordData(formattedWords[0]);
          await AsyncStorage.setItem('lastWord', JSON.stringify(formattedWords[0]));
        }

        await AsyncStorage.setItem('allWords', JSON.stringify(formattedWords));
        setHasMore(false);
        setCurrentPage(1);
      } else {
        setAllWords([]); // explicitly set empty array if no words
      }
    } catch (error) {
      console.error("Error fetching useful words:", error);
      setAllWords([]); // fallback empty array
    } finally {
      setLoading(false);
    }
  };


  const loadMoreWords = async () => {
    if (loadingMore || !hasMore || isSearching) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await getWordsPage(nextPage, 20, '', 'word');

      if (response.words && response.words.length > 0) {
        setAllWords(prev => [...prev, ...response.words]);
        setCurrentPage(nextPage);
        setHasMore(response.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more words:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };



  const fetchDailyWord = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoading(true);
      }

      await fetchUsefulWords();


      // ✅ Add today's word to history
      if (wordData) {
        try {
          await addWordToHistory(wordData);
          console.log(`✅ Added "${wordData.word}" to history`);
        } catch (err) {
          console.error("❌ Failed to add word to history:", err.message);
        }
      }

      if (wordData) {
        scheduleDailyWordNotification(wordData);
      }


      if (!isRefreshing) {
        showToast('success', '✨ Words Loaded!', 'Vocabulary refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching words:', error);

      // Fallback logic (offline or demo words) remains unchanged
      const cachedWords = await AsyncStorage.getItem('allWords');
      if (cachedWords) {
        const parsedWords = JSON.parse(cachedWords);
        setAllWords(parsedWords);
        if (parsedWords.length > 0) {
          setWordData(parsedWords[0]);

          // ✅ Save cached first word into history too
          try {
            await addWordToHistory(parsedWords[0]);
          } catch (err) {
            console.error("❌ Failed to add cached word to history:", err.message);
          }
        }
        if (!isRefreshing) {
          showToast('info', '📂 Offline Mode', 'Showing cached words');
        }
      } else {
        // Demo fallback
        const mockWords = [
          { word: "Serendipity", meaning: "The occurrence of events by chance in a happy or beneficial way", example: "Finding this book was pure serendipity." },
          { word: "Ephemeral", meaning: "Lasting for a very short time", example: "The ephemeral nature of cherry blossoms makes them special." },
          { word: "Ubiquitous", meaning: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern society." },
        ];
        setAllWords(mockWords);
        setWordData(mockWords[0]);

        // ✅ Save demo word into history too
        try {
          await addWordToHistory(mockWords[0]);
        } catch (err) {
          console.error("❌ Failed to add demo word to history:", err.message);
        }

        if (!isRefreshing) {
          showToast('error', '❌ Connection Error', 'Using demo words');
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      clearWordsCache();
      setCurrentPage(1);
      setHasMore(true);
      await fetchUsefulWords(); // await this to ensure words are loaded
      showToast('success', '🔄 Refreshed', 'Vocabulary updated');
    } catch (error) {
      console.error('Refresh error:', error);
      showToast('error', 'Refresh Failed', 'Could not update words');
    } finally {
      setRefreshing(false);
    }
  };


  const handleWordPress = async (item) => {
    try {
      setLoading(true);

      const fullDetails = await getWordDetails(item.word);

      console.log("🔍 Word Details:", fullDetails); // ← check translations here

      if (!fullDetails) {
        showToast('error', 'Error', 'Could not fetch word details');
        return;
      }

      await addWordToHistory(fullDetails);

      setSelectedWord(fullDetails);
      setModalVisible(true);
    } catch (err) {
      console.error("❌ Failed to fetch word details:", err.message);
    } finally {
      setLoading(false);
    }
  };



  const sortWords = (order) => {
    setSortOrder(order);

    setAllWords(prevWords => {
      const wordsToSort = [...prevWords];
      if (!wordsToSort || wordsToSort.length === 0) return [];

      let sortedWords;

      switch (order) {
        case 'alphabetical':
          sortedWords = wordsToSort.sort((a, b) => a.word.localeCompare(b.word));
          break;
        case 'reverse':
          sortedWords = wordsToSort.sort((a, b) => b.word.localeCompare(a.word));
          break;
        case 'random':
          sortedWords = [...wordsToSort];
          for (let i = sortedWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedWords[i], sortedWords[j]] = [sortedWords[j], sortedWords[i]];
          }
          break;
        default:
          sortedWords = wordsToSort;
      }

      return sortedWords;
    });
  };



  const addToFavorites = async (word) => {
    try {
      const stored = JSON.parse(await AsyncStorage.getItem("favorites") || "[]");
      const alreadyFav = stored.some(fav => fav.word === word.word);

      let newFavorites;
      if (alreadyFav) {
        newFavorites = stored.filter(fav => fav.word !== word.word);
        showToast("info", "Removed", `"${word.word}" removed from favorites`);
      } else {
        newFavorites = [...stored, { ...word, date: new Date().toISOString() }];
        showToast("success", "⭐ Added!", `"${word.word}" added to favorites`);
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
      setFavorites(newFavorites); // update state
    } catch (error) {
      showToast("error", "Error", "Could not update favorites");
    }
  };

  useEffect(() => {
    const loadFavorites = async () => {
      const stored = JSON.parse(await AsyncStorage.getItem("favorites") || "[]");
      setFavorites(stored);
    };
    loadFavorites();
  }, []);



  const renderWordItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.wordItem,
        { backgroundColor: isDarkMode ? '#2A2A2A' : '#FFF' }
      ]}
      onPress={() => handleWordPress(item)}
    >
      <View style={styles.wordItemContent}>
        <Text style={[styles.wordItemText, { color: isDarkMode ? '#FFF' : '#000' }]}>
          {item.word}
        </Text>
        <TouchableOpacity onPress={() => addToFavorites(item)}>
          <Ionicons
            name={
              favorites.some(fav => fav.word === item.word)
                ? "star"
                : "star-outline"
            }
            size={28}
            color={isDarkMode ? '#FFD700' : '#FFA500'}
          />
        </TouchableOpacity>

      </View>
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>

          <Menu>
            <MenuTrigger>
              <Ionicons
                name="filter"
                size={24}
                color={isDarkMode ? '#fff' : '#000'}
                style={{ marginHorizontal: 8 }}
              />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  padding: 5,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                },
              }}
            >
              <MenuOption onSelect={() => sortWords('random')}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', padding: 8 }}>
                  🎲 Random
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => sortWords('alphabetical')}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', padding: 8 }}>
                  A-Z Alphabetical
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => sortWords('reverse')}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', padding: 8 }}>
                  Z-A Reverse
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>

          <TouchableOpacity
            style={{ marginHorizontal: 8 }}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons
              name="person-circle-outline"
              size={30}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>

          <Menu>
            <MenuTrigger>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={isDarkMode ? '#fff' : '#000'}
                style={{ marginHorizontal: 8 }}
              />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  padding: 5,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? '#333' : '#fff',
                },
              }}
            >
              <MenuOption onSelect={() => navigation.navigate('Settings')}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', padding: 8 }}>
                  ⚙️ Settings
                </Text>
              </MenuOption>
              <MenuOption onSelect={toggleTheme}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', padding: 8 }}>
                  {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => navigation.navigate('About')}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', padding: 8 }}>
                  ℹ️ About
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      ),
      headerTitle: 'WordSetu',
      headerStyle: {
        backgroundColor: isDarkMode ? '#121212' : '#F5F5F5',
      },
      headerTitleStyle: {
        color: isDarkMode ? '#fff' : '#000',
      },
    });
  }, [navigation, isDarkMode]);

  useEffect(() => {
    fetchDailyWord();
  }, []);


  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' },
        ]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: isDarkMode ? '#fff' : '#000' }}>
          Loading your vocabulary...
        </Text>
      </View>
    );
  }

  const displayData = isSearching ? searchResults : allWords;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' }]}>
      {/* Featured Word Banner */}
      {wordData && !isSearching && (
        <TouchableOpacity
          style={[
            styles.featuredBanner,
            { backgroundColor: isDarkMode ? '#2E7D32' : '#4CAF50' }
          ]}
          onPress={() => handleWordPress(wordData)}
        >
          <Text style={styles.featuredTitle}>Word of the Day</Text>
          <Text style={styles.featuredWord}>{wordData.word}</Text>
          <Text style={styles.featuredMeaning} numberOfLines={1}>
            {wordData.meaning}
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.searchContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
        <Ionicons
          name="search"
          size={20}
          color={isDarkMode ? '#AAA' : '#666'}
          style={{ marginHorizontal: 8 }}
        />

        <TextInput
          style={[styles.searchInput, { color: isDarkMode ? '#FFF' : '#000' }]}
          placeholder="Search words..."
          placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setIsSearching(false);
              setSearchResults([]);
            }}
            style={{ marginHorizontal: 8 }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={isDarkMode ? '#FFF' : '#666'}
            />
          </TouchableOpacity>
        )}
      </View>




      {/* Words List */}
      <FlatList
        data={displayData}
        renderItem={renderWordItem}
        keyExtractor={(item, index) => `${item.word}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4CAF50"]}
            tintColor={isDarkMode ? "#fff" : "#000"}
          />
        }
        onEndReached={isSearching ? null : loadMoreWords}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={{ color: isDarkMode ? '#CCC' : '#666', marginLeft: 10 }}>
                Loading more words...
              </Text>
            </View>
          ) : !hasMore && allWords.length > 0 && !isSearching ? (
            <View style={styles.noMoreWords}>
              <Text style={{ color: isDarkMode ? '#CCC' : '#666' }}>
                No more words to load
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          isSearching ? (
            <Text style={[styles.listHeader, { color: isDarkMode ? '#FFF' : '#000' }]}>
              Search Results ({searchResults.length} words)
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={isSearching ? "search-outline" : "book-outline"}
              size={50}
              color={isDarkMode ? '#666' : '#999'}
            />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#CCC' : '#666' }]}>
              {isSearching ? 'No words found' : 'No words available'}
            </Text>
          </View>
        }
      />

      {/* Word Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons
                name="close"
                size={28}
                color={isDarkMode ? '#FFF' : '#000'}
              />
            </TouchableOpacity>

            {selectedWord && (
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalWord, { color: isDarkMode ? '#FFF' : '#000' }]}>
                    {selectedWord.word}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Favorite Star */}
                    <TouchableOpacity
                      onPress={() => {
                        addToFavorites(selectedWord);
                        setModalVisible(false);
                      }}
                      style={styles.modalFavoriteButton}
                    >
                      <Ionicons
                        name="star-outline"
                        size={28}
                        color={isDarkMode ? '#FFD700' : '#FFA500'}
                      />
                    </TouchableOpacity>


                    {/* Speaker / TTS Button */}
                    <TouchableOpacity
                      onPress={() => setTtsModalVisible(true)}  // ✅ opens TTS language modal
                      style={{ marginLeft: 12 }}
                    >
                      <Ionicons
                        name="volume-high-outline"
                        size={28}
                        color={isDarkMode ? '#4CAF50' : '#2E7D32'}
                      />
                    </TouchableOpacity>

                  </View>
                </View>


                <View style={styles.modalSection}>
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color={isDarkMode ? '#4CAF50' : '#2E7D32'}
                    style={styles.modalSectionIcon}
                  />
                  <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>
                    {selectedWord.meaning}
                  </Text>
                </View>

                {selectedWord.example && (
                  <View style={styles.modalSection}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={isDarkMode ? '#2196F3' : '#1976D2'}
                      style={styles.modalSectionIcon}
                    />
                    <Text style={[styles.modalExample, { color: isDarkMode ? '#BBB' : '#777' }]}>
                      "{selectedWord.example}"
                    </Text>
                  </View>
                )}

                {selectedWord.phonetic && (
                  <View style={styles.modalSection}>
                    <Ionicons
                      name="mic-outline"
                      size={20}
                      color={isDarkMode ? '#FF5722' : '#F44336'}
                      style={styles.modalSectionIcon}
                    />
                    <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>
                      {selectedWord.phonetic}
                    </Text>
                  </View>
                )}

                {selectedWord.partOfSpeech && (
                  <View style={styles.modalSection}>
                    <Ionicons
                      name="pricetag-outline"
                      size={20}
                      color={isDarkMode ? '#9C27B0' : '#7B1FA2'}
                      style={styles.modalSectionIcon}
                    />
                    <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>
                      {selectedWord.partOfSpeech}
                    </Text>
                  </View>
                )}

                {selectedWord.translations && (
                  <View style={styles.modalSection}>
                    <Ionicons
                      name="globe-outline"
                      size={20}
                      color={isDarkMode ? '#FFA500' : '#FF8C00'}
                      style={styles.modalSectionIcon}
                    />
                    <View>
                      <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                        Translations:
                      </Text>
                      {selectedWord.translations.hindi ? <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>Hindi: {selectedWord.translations.hindi}</Text> : null}
                      {selectedWord.translations.telugu ? <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>Telugu: {selectedWord.translations.telugu}</Text> : null}

                    </View>
                  </View>
                )}


                {(selectedWord.synonyms && selectedWord.synonyms.length > 0) && (
                  <View style={styles.modalSection}>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={20}
                      color={isDarkMode ? '#FF9800' : '#F57C00'}
                      style={styles.modalSectionIcon}
                    />
                    <View>
                      <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                        Synonyms:
                      </Text>
                      <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>
                        {selectedWord.synonyms.join(', ')}
                      </Text>
                    </View>
                  </View>
                )}

                {(selectedWord.antonyms && selectedWord.antonyms.length > 0) && (
                  <View style={styles.modalSection}>
                    <Ionicons
                      name="swap-vertical-outline"
                      size={20}
                      color={isDarkMode ? '#F44336' : '#D32F2F'}
                      style={styles.modalSectionIcon}
                    />
                    <View>
                      <Text style={[styles.modalSectionTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                        Antonyms:
                      </Text>
                      <Text style={[styles.modalText, { color: isDarkMode ? '#DDD' : '#555' }]}>
                        {selectedWord.antonyms.join(', ')}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={ttsModalVisible}
        onRequestClose={() => setTtsModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { padding: 20, alignItems: 'center' }]}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: isDarkMode ? '#FFF' : '#000' }}>
              Select Language
            </Text>

            {['en', 'hi', 'te'].map(lang => (
              <TouchableOpacity
                key={lang}
                onPress={() => {
                  // Determine text to speak immediately
                  let textToSpeak = selectedWord.word; // default English
                  if (selectedWord?.translations) {
                    if (lang === 'hi') textToSpeak = selectedWord.translations.hindi || selectedWord.word;
                    else if (lang === 'te') textToSpeak = selectedWord.translations.telugu || selectedWord.word;
                    else textToSpeak = selectedWord.word;
                  }

                  // Speak the selected text immediately
                  Speech.speak(textToSpeak, { language: lang, pitch: 1, rate: 1 });

                  // Update state if needed
                  setTtsLanguage(lang);
                  setTtsModalVisible(false);
                }}
                style={{
                  padding: 12,
                  width: '80%',
                  marginVertical: 6,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? '#333' : '#EEE',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: isDarkMode ? '#FFF' : '#000', textTransform: 'capitalize' }}>
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Telugu'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setTtsModalVisible(false)}
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: '#F44336', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBanner: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.9,
  },
  featuredWord: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredMeaning: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.9,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 8,
  },
  wordItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wordItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordItemText: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalWord: {
    fontSize: 36,
    fontWeight: 'bold',
    flex: 1,
  },
  modalFavoriteButton: {
    padding: 8,
  },
  modalSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalSectionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  modalExample: {
    fontSize: 16,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 22,
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  noMoreWords: {
    padding: 20,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});

export default HomeScreen;