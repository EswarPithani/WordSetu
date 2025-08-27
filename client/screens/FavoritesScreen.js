import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import Toast from "react-native-toast-message";

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  // Load favorites from storage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = JSON.parse(await AsyncStorage.getItem("favorites") || "[]");
        setFavorites(stored);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadFavorites);
    loadFavorites();

    return unsubscribe;
  }, [navigation]);

  // Remove a word from favorites
  const removeFavorite = async (word) => {
    try {
      const newFavorites = favorites.filter((fav) => fav.word !== word);
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      Toast.show({
        type: "info",
        text1: "Removed",
        text2: `"${word}" removed from favorites`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not remove favorite",
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: isDarkMode ? "#333" : "#fff" }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.word, { color: isDarkMode ? "#fff" : "#000" }]}>
          {item.word}
        </Text>
        {item.meaning ? (
          <Text style={[styles.meaning, { color: isDarkMode ? "#ccc" : "#555" }]}>
            {item.meaning}
          </Text>
        ) : null}
      </View>

      {/* remove star */}
      <TouchableOpacity onPress={() => removeFavorite(item.word)}>
        <Ionicons name="star" size={28} color="#FFD700" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFA500" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: isDarkMode ? "#fff" : "#000" }}>
          ⭐ No favorites yet
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
  },
  meaning: {
    fontSize: 14,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default FavoritesScreen;
