import React, { useLayoutEffect, useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert
} from "react-native";
import { useFontSize } from "../context/FontSizeContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
    const { fontSize, changeFontSize, sizeValue } = useFontSize();
    const { language, changeLanguage, translate } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showFontModal, setShowFontModal] = useState(false);
    const [showLangModal, setShowLangModal] = useState(false);

    // Load saved settings on component mount
    useEffect(() => {
        loadSavedSettings();
    }, []);

    const loadSavedSettings = async () => {
        try {
            // Load notifications setting
            const notifications = await AsyncStorage.getItem('notificationsEnabled');
            if (notifications !== null) {
                setNotificationsEnabled(notifications === 'true');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const showToast = (type, title, message) => {
        Toast.show({
            type,
            text1: title,
            text2: message,
            position: 'bottom',
            visibilityTime: 2500,
        });
    };

    const handleNotificationsToggle = async (value) => {
        setNotificationsEnabled(value);
        if (value) {
            showToast('success', '🔔 ' + translate('enabled'), translate('notificationsOn'));
        } else {
            showToast('info', '🔕 ' + translate('disabled'), translate('notificationsOff'));
        }

        // Save preference
        await AsyncStorage.setItem('notificationsEnabled', value.toString());
    };

    const handleFontSizeChange = async (size) => {
        changeFontSize(size);
        setShowFontModal(false);
        showToast('success', '✅ ' + translate('enabled'), `${translate('fontSizeSet')} ${size}`);

        // Save font size preference
        await AsyncStorage.setItem('fontSize', size);
    };

    const handleLanguageChange = async (langCode, langName) => {
        changeLanguage(langCode);
        setShowLangModal(false);
        showToast('success', '🌎 ' + translate('enabled'), `${translate('languageSet')} ${langName}`);
    };

    const handleClearCache = () => {
        Alert.alert(
            translate('clearCache'),
            "This will remove all cached data including word history and favorites. Continue?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: translate('clearCache'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove([
                                'wordHistory',
                                'favorites',
                                'lastWord'
                            ]);
                            showToast('success', '🗑️ ' + translate('clearCache'), translate('cacheCleared'));
                        } catch (error) {
                            showToast('error', 'Error', 'Failed to clear cache');
                        }
                    }
                }
            ]
        );
    };

    const handleResetSettings = () => {
        Alert.alert(
            translate('resetSettings'),
            "Reset all settings to default values?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: translate('resetSettings'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setNotificationsEnabled(true);
                            changeFontSize("Medium");
                            changeLanguage("en");
                            toggleTheme(false); // Reset to light mode
                            await AsyncStorage.multiRemove([
                                'fontSize',
                                'language',
                                'notificationsEnabled',
                                'isDarkMode'
                            ]);
                            showToast('success', '🔄 ' + translate('resetSettings'), translate('settingsReset'));
                        } catch (error) {
                            showToast('error', 'Error', 'Failed to reset settings');
                        }
                    }
                }
            ]
        );
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
            },
            headerTitleStyle: {
                color: isDarkMode ? "#fff" : "#000",
                fontSize: sizeValue,
            },
            headerTintColor: isDarkMode ? "#fff" : "#000",
            headerTitle: "⚙️ " + translate('settings'),
        });
    }, [navigation, sizeValue, language, isDarkMode]);

    // Language options with code and display name
    const languageOptions = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'te', name: 'Telugu' }
    ];

    // Get current language name for display
    const currentLanguageName = languageOptions.find(lang => lang.code === language)?.name || 'English';

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" },
            ]}
        >
            {/* Appearance Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, {
                    color: isDarkMode ? "#fff" : "#000",
                    fontSize: sizeValue
                }]}>
                    🎨 {translate('appearance')}
                </Text>

                <View style={[styles.settingCard, {
                    backgroundColor: isDarkMode ? "#1E1E1E" : "#fff"
                }]}>


                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setShowFontModal(true)}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons
                                name="text"
                                size={22}
                                color={isDarkMode ? "#03DAC6" : "#00897B"}
                            />
                            <Text style={[styles.settingText, {
                                color: isDarkMode ? "#fff" : "#000",
                                fontSize: sizeValue
                            }]}>
                                {translate('fontSize')}
                            </Text>
                        </View>
                        <View style={styles.optionValue}>
                            <Text style={[styles.optionText, {
                                color: isDarkMode ? "#bbb" : "#555",
                                fontSize: sizeValue
                            }]}>
                                {fontSize}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={isDarkMode ? "#666" : "#999"}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, {
                    color: isDarkMode ? "#fff" : "#000",
                    fontSize: sizeValue
                }]}>
                    ⚡ {translate('preferences')}
                </Text>

                <View style={[styles.settingCard, {
                    backgroundColor: isDarkMode ? "#1E1E1E" : "#fff"
                }]}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons
                                name="notifications"
                                size={22}
                                color={isDarkMode ? "#FFD700" : "#FFA500"}
                            />
                            <Text style={[styles.settingText, {
                                color: isDarkMode ? "#fff" : "#000",
                                fontSize: sizeValue
                            }]}>
                                {translate('notifications')}
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationsToggle}
                            thumbColor={notificationsEnabled ? "#FFD700" : "#f4f3f4"}
                            trackColor={{ false: "#767577", true: "#FFD700" }}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setShowLangModal(true)}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons
                                name="language"
                                size={22}
                                color={isDarkMode ? "#64FFDA" : "#009688"}
                            />
                            <Text style={[styles.settingText, {
                                color: isDarkMode ? "#fff" : "#000",
                                fontSize: sizeValue
                            }]}>
                                {translate('language')}
                            </Text>
                        </View>
                        <View style={styles.optionValue}>
                            <Text style={[styles.optionText, {
                                color: isDarkMode ? "#bbb" : "#555",
                                fontSize: sizeValue
                            }]}>
                                {currentLanguageName}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={isDarkMode ? "#666" : "#999"}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, {
                    color: isDarkMode ? "#fff" : "#000",
                    fontSize: sizeValue
                }]}>
                    💾 {translate('data')}
                </Text>

                <View style={[styles.settingCard, {
                    backgroundColor: isDarkMode ? "#1E1E1E" : "#fff"
                }]}>
                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleClearCache}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons
                                name="trash"
                                size={22}
                                color={isDarkMode ? "#FF5252" : "#F44336"}
                            />
                            <Text style={[styles.settingText, {
                                color: isDarkMode ? "#fff" : "#000",
                                fontSize: sizeValue
                            }]}>
                                {translate('clearCache')}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={isDarkMode ? "#666" : "#999"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleResetSettings}
                    >
                        <View style={styles.settingInfo}>
                            <Ionicons
                                name="refresh"
                                size={22}
                                color={isDarkMode ? "#FF6E40" : "#FF5722"}
                            />
                            <Text style={[styles.settingText, {
                                color: isDarkMode ? "#fff" : "#000",
                                fontSize: sizeValue
                            }]}>
                                {translate('resetSettings')}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={isDarkMode ? "#666" : "#999"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* App Info */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, {
                    color: isDarkMode ? "#666" : "#999",
                    fontSize: sizeValue
                }]}>
                    {translate('appVersion')}
                </Text>
                <Text style={[styles.footerText, {
                    color: isDarkMode ? "#666" : "#999",
                    fontSize: sizeValue
                }]}>
                    {translate('builtWithLove')}
                </Text>
            </View>

            {/* Font Size Modal */}
            <Modal visible={showFontModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFontModal(false)}
                >
                    <View style={[styles.modalContent, {
                        backgroundColor: isDarkMode ? "#1E1E1E" : "#fff"
                    }]}>
                        <Text style={[styles.modalTitle, {
                            color: isDarkMode ? "#fff" : "#000",
                            fontSize: sizeValue
                        }]}>
                            {translate('chooseFontSize')}
                        </Text>
                        {["Small", "Medium", "Large"].map((size) => (
                            <TouchableOpacity
                                key={size}
                                style={[
                                    styles.modalOption,
                                    fontSize === size && styles.modalOptionSelected
                                ]}
                                onPress={() => handleFontSizeChange(size)}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    {
                                        color: isDarkMode ? "#fff" : "#000",
                                        fontSize: size === "Small" ? 14 : size === "Medium" ? 16 : 18
                                    }
                                ]}>
                                    {size}
                                </Text>
                                {fontSize === size && (
                                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Language Modal */}
            <Modal visible={showLangModal} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowLangModal(false)}
                >
                    <View style={[styles.modalContent, {
                        backgroundColor: isDarkMode ? "#1E1E1E" : "#fff"
                    }]}>
                        <Text style={[styles.modalTitle, {
                            color: isDarkMode ? "#fff" : "#000",
                            fontSize: sizeValue
                        }]}>
                            {translate('selectLanguage')}
                        </Text>
                        {languageOptions.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.modalOption,
                                    language === lang.code && styles.modalOptionSelected
                                ]}
                                onPress={() => handleLanguageChange(lang.code, lang.name)}
                            >
                                <Text style={[styles.modalOptionText, {
                                    color: isDarkMode ? "#fff" : "#000",
                                    fontSize: sizeValue
                                }]}>
                                    {lang.name}
                                </Text>
                                {language === lang.code && (
                                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 8,
    },
    settingCard: {
        borderRadius: 16,
        padding: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    settingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    settingInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    settingText: {
        fontWeight: "500"
    },
    optionValue: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    optionText: {
        // Font size is now set dynamically
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    footerText: {
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: "85%",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: {
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalOptionSelected: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: 8,
    },
    modalOptionText: {
        fontWeight: '500',
    },
});

export default SettingsScreen;