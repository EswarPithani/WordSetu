import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const openLink = (url) => {
    Linking.openURL(url).catch(err =>
      console.error("Couldn't load page", err)
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: isDarkMode ? '#2A2A2A' : '#FFF' }]}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
          />
        </View>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
          WordSetu
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#bbb' : '#666' }]}>
          Bridge Your Vocabulary
        </Text>
        <Text style={[styles.version, { color: isDarkMode ? '#888' : '#999' }]}>
          Version 1.1.0
        </Text>
      </View>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          About WordSetu
        </Text>
        <Text style={[styles.description, { color: isDarkMode ? '#ddd' : '#555' }]}>
          WordSetu is your personal vocabulary builder that helps you learn new words in multiple languages.
          Discover words in English, Hindi, and Telugu with detailed meanings, examples, and pronunciation guides.
        </Text>
      </View>

      {/* Features */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          ✨ Key Features
        </Text>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#2E7D32' : '#4CAF50' }]}>
            <Ionicons name="book-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              Multi-language Support
            </Text>
            <Text style={[styles.featureText, { color: isDarkMode ? '#bbb' : '#666' }]}>
              Learn words in English, Hindi, and Telugu with translations
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#1976D2' : '#2196F3' }]}>
            <Ionicons name="volume-high-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              Text-to-Speech
            </Text>
            <Text style={[styles.featureText, { color: isDarkMode ? '#bbb' : '#666' }]}>
              Hear pronunciations in different languages
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#FFA000' : '#FFC107' }]}>
            <Ionicons name="star-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              Favorites & History
            </Text>
            <Text style={[styles.featureText, { color: isDarkMode ? '#bbb' : '#666' }]}>
              Save words and track your learning progress
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#7B1FA2' : '#9C27B0' }]}>
            <Ionicons name="flame-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              Learning Streak
            </Text>
            <Text style={[styles.featureText, { color: isDarkMode ? '#bbb' : '#666' }]}>
              Build and maintain your daily learning habit
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#D32F2F' : '#F44336' }]}>
            <Ionicons name="search-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
              Smart Search
            </Text>
            <Text style={[styles.featureText, { color: isDarkMode ? '#bbb' : '#666' }]}>
              Quickly find words with advanced search functionality
            </Text>
          </View>
        </View>
      </View>

      {/* How to Use */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          📚 How to Use
        </Text>
        {[
          "Explore the daily word on the home screen",
          "Tap any word to view detailed information and translations",
          "Use the speaker icon to hear pronunciations in different languages",
          "Star words to add them to your favorites for later review",
          "Check your profile to track your learning streak and progress"
        ].map((step, index) => (
          <View style={styles.step} key={index}>
            <View style={[
              styles.stepNumber,
              { backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32' }
            ]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: isDarkMode ? '#ddd' : '#555' }]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Developer Section */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          👨‍💻 Developer
        </Text>
        <Text style={[styles.description, { color: isDarkMode ? '#ddd' : '#555' }]}>
          WordSetu is developed with ❤️ to help language learners build their vocabulary
          across multiple languages. The app is constantly being improved with new features
          and content.
        </Text>

        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: isDarkMode ? '#2E7D32' : '#4CAF50' }]}
            onPress={() => openLink('mailto:eswarpithani268@gmail.com')}
          >
            <Ionicons name="mail-outline" size={18} color="#FFF" />
            <Text style={styles.contactText}>Email Support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: isDarkMode ? '#1976D2' : '#2196F3' }]}
            onPress={() => openLink('https://github.com/EswarPithani')}
          >
            <Ionicons name="logo-github" size={18} color="#FFF" />
            <Text style={styles.contactText}>GitHub</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>
          ℹ️ App Information
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#bbb' : '#666' }]}>Version:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>1.1.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#bbb' : '#666' }]}>Languages:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>English, Hindi, Telugu</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: isDarkMode ? '#bbb' : '#666' }]}>Last Updated:</Text>
          <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#333' }]}>August 2025</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: isDarkMode ? '#888' : '#999' }]}>
          Made with ❤️ for language learners
        </Text>
        <Text style={[styles.footerText, { color: isDarkMode ? '#888' : '#999' }]}>
          © {new Date().getFullYear()} WordSetu. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    padding: 16,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
  },
  contactText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    padding: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default AboutScreen;