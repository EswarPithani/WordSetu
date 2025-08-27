import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { getProfile } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

function ProfileScreen({ navigation, setIsLoggedIn }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { isDarkMode } = useContext(ThemeContext);
    const [streak, setStreak] = useState(0);
    const [favoritesCount, setFavoritesCount] = useState(0);


    const loadFavoritesCount = async () => {
        try {
            const storedFavorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
            setFavoritesCount(storedFavorites.length);
        } catch (error) {
            console.error("Error loading favorites:", error);
            setFavoritesCount(0);
        }
    };

    useEffect(() => {
        loadFavoritesCount();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfile();
            loadFavoritesCount();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const loadStreak = async () => {
            try {
                const storedStreak = await AsyncStorage.getItem('streak');
                const currentStreak = storedStreak !== null ? parseInt(storedStreak) : 1; // <-- default to 1
                setStreak(currentStreak);
                // Save it to AsyncStorage if it’s new
                if (storedStreak === null) {
                    await AsyncStorage.setItem('streak', '1');
                }
            } catch (error) {
                console.error('Error loading streak:', error);
            }
        };

        loadStreak();
    }, []);

    const showToast = (type, title, message) => {
        Toast.show({
            type,
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    };

    const fetchProfile = async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('Login');
                return;
            }

            const prof = await getProfile();
            setProfile(prof);

            if (isRefreshing) {
                showToast('success', 'Profile Updated', 'Your profile has been refreshed');
            }

        } catch (err) {
            console.error('Profile fetch error', err);

            if (err.message.includes('token') || err.message.includes('auth')) {
                showToast('error', 'Session Expired', 'Please login again');
                handleLogout();
            } else {
                showToast('error', 'Load Failed', 'Could not load profile data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('token');
                            setIsLoggedIn(false);
                            showToast('success', 'Goodbye! 👋', 'Logged out successfully');
                        } catch (error) {
                            showToast('error', 'Logout Failed', 'Please try again');
                        }
                    }
                }
            ]
        );
    };

    const handleRefresh = async () => {
        await fetchProfile(true);
    };

    const getStreakMessage = (streak) => {
        if (streak === 1) return 'Start your learning journey today!';
        if (streak < 7) return `Great start! You're on fire for ${streak} day${streak > 1 ? 's' : ''}!`;
        if (streak < 30) return `Amazing! ${streak} day streak! Keep going!`;
        return `Incredible! ${streak} days of learning! 🏆`;
    };

    const getStreakIcon = (streak) => {
        if (streak === 1) return '⚡';        // new user
        if (streak < 3) return '🔥';         // 2 days
        if (streak < 7) return '🌟';         // 3-6 days
        if (streak < 30) return '🚀';        // 7-29 days
        return '🏆';                          // 30+ days
    };


    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchProfile);
        return unsubscribe;
    }, [navigation]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Loading your profile...
                </Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={[styles.center, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}>
                <Ionicons
                    name="person-circle-outline"
                    size={80}
                    color={isDarkMode ? '#555' : '#ccc'}
                />
                <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#000' }]}>
                    No Profile Data
                </Text>
                <Text style={[styles.errorSubtext, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    Unable to load your profile information
                </Text>

                <TouchableOpacity
                    onPress={fetchProfile}
                    style={[styles.retryButton, { backgroundColor: isDarkMode ? '#4F46E5' : '#4F46E5' }]}
                >
                    <Ionicons name="refresh" size={18} color="#fff" />
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={["#4F46E5"]}
                    tintColor={isDarkMode ? "#fff" : "#000"}
                />
            }
        >
            {/* Profile Header Card */}
            <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' }]}>
                <View style={styles.avatarContainer}>
                    <Ionicons
                        name="person-circle"
                        size={80}
                        color={isDarkMode ? '#4F46E5' : '#4F46E5'}
                    />
                </View>

                <Text style={[styles.greeting, { color: isDarkMode ? '#fff' : '#111827' }]}>
                    👋 Hello, {profile.name || 'User'}
                </Text>

                <View style={styles.emailContainer}>
                    <Ionicons
                        name="mail-outline"
                        size={16}
                        color={isDarkMode ? '#ccc' : '#6B7280'}
                    />
                    <Text style={[styles.email, { color: isDarkMode ? '#ccc' : '#6B7280' }]}>
                        {profile.email}
                    </Text>
                </View>

                <View style={styles.streakContainer}>
                    <Text style={styles.streakIcon}>
                        {getStreakIcon(profile.streak || 0)}
                    </Text>
                    <Text style={styles.streak}>
                        {profile.streak || 0} day streak
                    </Text>
                </View>

                <Text style={[styles.streakMessage, { color: isDarkMode ? '#aaa' : '#888' }]}>
                    {getStreakMessage(profile.streak || 0)}
                </Text>
            </View>

            {/* Stats Section */}
            <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' }]}>
                <Text style={[styles.statsTitle, { color: isDarkMode ? '#fff' : '#111827' }]}>
                    📊 Learning Stats
                </Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Ionicons
                            name="time"
                            size={24}
                            color={isDarkMode ? '#4CAF50' : '#2E7D32'}
                        />
                        <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>
                            {profile.streak || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                            Days
                        </Text>
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons
                            name="book"
                            size={24}
                            color={isDarkMode ? '#2196F3' : '#1976D2'}
                        />
                        <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>
                            {profile.wordsLearned || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                            Words
                        </Text>
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons
                            name="star"
                            size={24}
                            color={isDarkMode ? '#FFD700' : '#FFA500'}
                        />
                        <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>
                            {favoritesCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                            Favorites
                        </Text>
                    </View>

                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.buttonPrimary, { backgroundColor: isDarkMode ? '#4F46E5' : '#4F46E5' }]}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Ionicons name="star" size={20} color="#fff" />
                    <Text style={styles.buttonText}>⭐ My Favorites</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonSecondary, { backgroundColor: isDarkMode ? '#3B82F6' : '#2563EB' }]}
                    onPress={() => navigation.navigate('History')}
                >
                    <Ionicons name="time" size={20} color="#fff" />
                    <Text style={styles.buttonText}>📚 Learning History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.buttonDanger, { backgroundColor: isDarkMode ? '#EF4444' : '#DC2626' }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out" size={20} color="#fff" />
                    <Text style={styles.buttonText}>🚪 Logout</Text>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' }]}>
                <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    Learn A Word • v1.0.0
                </Text>
                <Text style={[styles.infoText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    Keep learning every day! 📚
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    profileCard: {
        padding: 24,
        borderRadius: 20,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    email: {
        fontSize: 16,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    streakIcon: {
        fontSize: 24,
    },
    streak: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F59E0B',
    },
    streakMessage: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    statsCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    actionsContainer: {
        gap: 12,
        marginBottom: 20,
    },
    buttonPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
    },
    buttonSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
    },
    buttonDanger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 12,
        marginBottom: 4,
    },
});

export default ProfileScreen;