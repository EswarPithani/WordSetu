import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Easing,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { resetPassword } from '../services/api'; // Import the actual API function

function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const { isDarkMode } = useTheme();
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleResetPassword = async () => {
        // Validation
        if (!email || !newPassword || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Missing Information',
                text2: 'Please fill in all fields',
                position: 'bottom',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'New password and confirmation do not match',
                position: 'bottom',
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must be at least 6 characters long',
                position: 'bottom',
            });
            return;
        }

        setLoading(true);

        try {
            console.log('Attempting password reset for:', email);
            const data = await resetPassword(email, newPassword);
            console.log('API Response:', data);

            // Check if the API call was successful
            if (data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Password Updated!',
                    text2: 'You can now login with your new password',
                    position: 'bottom',
                });

                // Clear form fields
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');

                // Navigate back after a short delay
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 1500);
            } else {
                // API returned success: false
                Toast.show({
                    type: 'error',
                    text1: 'Reset Failed',
                    text2: data.message || 'Failed to reset password. Please try again.',
                    position: 'bottom',
                });
            }
        } catch (error) {
            console.error('Password reset error:', error);
            // Network errors or unexpected errors
            Toast.show({
                type: 'error',
                text1: 'Reset Failed',
                text2: error.message || 'Network error occurred. Please check your connection.',
                position: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    const backgroundStyle = {
        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
    };

    const cardStyle = {
        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
        shadowColor: isDarkMode ? '#000' : '#64748B',
    };

    const textColor = {
        color: isDarkMode ? '#E2E8F0' : '#334155',
    };

    const inputStyle = {
        backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
        color: isDarkMode ? '#F8FAFC' : '#0F172A',
        borderColor: focusedField === 'email' ? (isDarkMode ? '#60A5FA' : '#3B82F6') : 'transparent',
    };

    const passwordInputStyle = {
        backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
        color: isDarkMode ? '#F8FAFC' : '#0F172A',
        borderColor: focusedField === 'password' ? (isDarkMode ? '#60A5FA' : '#3B82F6') : 'transparent',
    };

    const confirmPasswordInputStyle = {
        backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
        color: isDarkMode ? '#F8FAFC' : '#0F172A',
        borderColor: focusedField === 'confirmPassword' ? (isDarkMode ? '#60A5FA' : '#3B82F6') : 'transparent',
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, backgroundStyle]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={[styles.card, cardStyle]}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="lock-closed"
                                size={40}
                                color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                            />
                        </View>

                        <Text style={[styles.title, textColor]}>
                            Reset Your Password
                        </Text>

                        <Text style={[styles.subtitle, { color: isDarkMode ? '#CBD5E1' : '#64748B' }]}>
                            Enter your email and new password to reset your account
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>Email</Text>
                            <TextInput
                                style={[styles.input, inputStyle]}
                                placeholder="Enter your email"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>New Password</Text>
                            <View style={[styles.passwordContainer, passwordInputStyle]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}
                                    placeholder="Enter new password"
                                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={22}
                                        color={isDarkMode ? '#94A3B8' : '#64748B'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>Confirm Password</Text>
                            <View style={[styles.passwordContainer, confirmPasswordInputStyle]}>
                                <TextInput
                                    style={[styles.passwordInput, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={22}
                                        color={isDarkMode ? '#94A3B8' : '#64748B'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading && styles.buttonDisabled,
                                { backgroundColor: isDarkMode ? '#60A5FA' : '#3B82F6' }
                            ]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.backButton, loading && styles.buttonDisabled]}
                            onPress={() => navigation.goBack()}
                            disabled={loading}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={18}
                                color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                            />
                            <Text style={[styles.backText, { color: isDarkMode ? '#60A5FA' : '#3B82F6' }]}>
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    card: {
        width: width > 500 ? 450 : '100%',
        alignSelf: 'center',
        borderRadius: 16,
        padding: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
    },
    button: {
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    backButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    backText: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ForgotPasswordScreen;