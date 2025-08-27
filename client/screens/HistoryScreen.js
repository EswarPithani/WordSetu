import React, { useEffect, useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { getHistory, clearHistory, deleteWordFromHistory } from "../services/api";
import Toast from 'react-native-toast-message';

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { isDarkMode } = useContext(ThemeContext);

    const showToast = (type, title, message) => {
        Toast.show({
            type,
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    };

    const loadHistoryData = async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setPage(1);
                setHasMore(true);
            }

            // Try to get from API first
            const data = await getHistory(page, 20);

            if (isRefreshing) {
                setHistory(data.history || []);
            } else {
                setHistory(prev => [...prev, ...(data.history || [])]);
            }

            setHasMore(data.pagination?.hasMore || false);

            // Cache to local storage for offline access
            await AsyncStorage.setItem("wordHistory", JSON.stringify(data.history || []));

            if (data.history?.length > 0 && isRefreshing) {
                showToast('success', 'History Updated', `Loaded ${data.history.length} words`);
            }
        } catch (err) {
            console.error("Error loading history:", err);

            // Fallback to offline storage
            try {
                const stored = await AsyncStorage.getItem("wordHistory");
                if (stored) {
                    const parsedHistory = JSON.parse(stored);
                    setHistory(parsedHistory);
                    if (parsedHistory.length > 0 && isRefreshing) {
                        showToast('info', 'Offline Mode', 'Showing cached history');
                    }
                }
            } catch (cacheError) {
                console.error("Cache error:", cacheError);
            }

            if (err.message?.includes('token') || err.message?.includes('login')) {
                showToast('error', 'Authentication Required', 'Please login to view your history');
            } else {
                showToast('error', 'Network Error', 'Could not load history');
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistoryData(true);
        setRefreshing(false);
    };

    const loadMore = async () => {
        if (!hasMore || loading) return;

        const nextPage = page + 1;
        setPage(nextPage);
        await loadHistoryData();
    };

    const handleClearHistory = async () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to clear all your word history? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await clearHistory();
                            setHistory([]);
                            await AsyncStorage.removeItem("wordHistory");
                            showToast('success', 'History Cleared', 'All words removed from history');
                        } catch (error) {
                            console.error("Error clearing history:", error);
                            showToast('error', 'Error', 'Failed to clear history');
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteWord = async (wordId, word) => {
        Alert.alert(
            "Remove Word",
            `Are you sure you want to remove "${word}" from your history?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteWordFromHistory(wordId);
                            setHistory(prev => prev.filter(item => item._id !== wordId));
                            showToast('success', 'Word Removed', `"${word}" removed from history`);
                        } catch (error) {
                            console.error("Error deleting word:", error);
                            showToast('error', 'Error', 'Failed to remove word');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            await loadHistoryData(true);
            setLoading(false);
        };

        loadHistory();
    }, []);

    if (loading && history.length === 0) {
        return (
            <View style={[styles.centered, { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" }]}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={{ marginTop: 10, color: isDarkMode ? "#fff" : "#000" }}>
                    Loading word history...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" }]}>
            {/* Header with Stats and Clear Button */}
            <View style={styles.header}>
                <View style={styles.statsContainer}>
                    <Ionicons
                        name="time"
                        size={20}
                        color={isDarkMode ? "#4CAF50" : "#2E7D32"}
                    />
                    <Text style={[
                        styles.statsText,
                        { color: isDarkMode ? "#fff" : "#000" }
                    ]}>
                        {history.length} word{history.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                {history.length > 0 && (
                    <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
                        <Ionicons
                            name="trash-outline"
                            size={18}
                            color={isDarkMode ? "#ff6b6b" : "#d32f2f"}
                        />
                        <Text style={[
                            styles.clearText,
                            { color: isDarkMode ? "#ff6b6b" : "#d32f2f" }
                        ]}>
                            Clear All
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {history.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons
                        name="time-outline"
                        size={80}
                        color={isDarkMode ? "#555" : "#aaa"}
                    />
                    <Text style={[
                        styles.emptyTitle,
                        { color: isDarkMode ? "#fff" : "#000" }
                    ]}>
                        No History Yet
                    </Text>
                    <Text style={[
                        styles.emptySubtitle,
                        { color: isDarkMode ? "#ccc" : "#555" }
                    ]}>
                        Your word history will appear here{'\n'}after you learn new words!
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.refreshButton,
                            { backgroundColor: isDarkMode ? "#4CAF50" : "#2E7D32" }
                        ]}
                        onPress={onRefresh}
                    >
                        <Ionicons name="refresh" size={18} color="#fff" />
                        <Text style={styles.refreshText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item._id || `${item.word}-${item.date}-${Math.random()}`}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#4CAF50"]}
                            tintColor={isDarkMode ? "#fff" : "#000"}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        hasMore ? (
                            <View style={styles.loadingMore}>
                                <ActivityIndicator size="small" color="#4CAF50" />
                                <Text style={[styles.loadingText, { color: isDarkMode ? "#ccc" : "#666" }]}>
                                    Loading more...
                                </Text>
                            </View>
                        ) : history.length > 10 ? (
                            <Text style={[styles.endText, { color: isDarkMode ? "#ccc" : "#666" }]}>
                                You've reached the end of your history
                            </Text>
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <View
                            style={[
                                styles.card,
                                {
                                    backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                                    borderColor: isDarkMode ? "#333" : "#ddd",
                                },
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[
                                    styles.wordNumber,
                                    { color: isDarkMode ? "#4CAF50" : "#2E7D32" }
                                ]}>
                                    #{history.length - index}
                                </Text>

                                {item.isDailyWord && (
                                    <View style={styles.dailyBadge}>
                                        <Ionicons name="star" size={12} color="#FFD700" />
                                        <Text style={styles.dailyBadgeText}>Daily</Text>
                                    </View>
                                )}

                                <Text style={[
                                    styles.word,
                                    { color: isDarkMode ? "#fff" : "#000" }
                                ]}>
                                    {item.word}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleDeleteWord(item._id, item.word)}
                                    style={styles.deleteButton}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={20}
                                        color={isDarkMode ? "#666" : "#999"}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={[
                                styles.meaning,
                                { color: isDarkMode ? "#ccc" : "#555" }
                            ]}>
                                {item.meaning}
                            </Text>

                            {item.example && (
                                <View style={styles.exampleContainer}>
                                    <Ionicons
                                        name="chatbubble-outline"
                                        size={14}
                                        color={isDarkMode ? "#aaa" : "#666"}
                                        style={styles.exampleIcon}
                                    />
                                    <Text style={[
                                        styles.example,
                                        { color: isDarkMode ? "#aaa" : "#666" }
                                    ]}>
                                        "{item.example}"
                                    </Text>
                                </View>
                            )}

                            <View style={styles.dateContainer}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={14}
                                    color={isDarkMode ? "#999" : "#888"}
                                />
                                <Text style={[
                                    styles.date,
                                    { color: isDarkMode ? "#999" : "#888" }
                                ]}>
                                    {new Date(item.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statsText: {
        fontSize: 16,
        fontWeight: "600",
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 8,
        borderRadius: 8,
    },
    clearText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    refreshText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    wordNumber: {
        fontSize: 12,
        fontWeight: '700',
        opacity: 0.7,
    },
    dailyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    dailyBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFD700',
    },
    word: {
        fontSize: 20,
        fontWeight: "bold",
        flex: 1,
    },
    deleteButton: {
        padding: 4,
    },
    meaning: {
        fontSize: 16,
        marginTop: 4,
        lineHeight: 22,
    },
    exampleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
    },
    exampleIcon: {
        marginTop: 2,
    },
    example: {
        fontSize: 14,
        fontStyle: "italic",
        flex: 1,
        lineHeight: 18,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    date: {
        fontSize: 12,
        opacity: 0.8,
    },
    loadingMore: {
        padding: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
    },
    endText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default HistoryScreen;