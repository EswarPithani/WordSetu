import React, { useState, useEffect } from 'react';
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
import { signupUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

function SignupScreen({ navigation, setIsLoggedIn }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const { isDarkMode } = useTheme();

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(40))[0];
    const scaleAnim = useState(new Animated.Value(0.9))[0];
    const successScale = useState(new Animated.Value(0))[0];
    const successOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Entry animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.elastic(1)),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        if (showSuccess) {
            // Success animation
            Animated.parallel([
                Animated.timing(successScale, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.back(1.8)),
                    useNativeDriver: true,
                }),
                Animated.timing(successOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Reset success animation
            successScale.setValue(0);
            successOpacity.setValue(0);
        }
    }, [showSuccess]);

    const validateForm = () => {
        if (!name || !email || !password || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Missing Information',
                text2: 'Please complete all required fields',
                position: 'bottom',
            });
            return false;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Your passwords do not match. Please verify and try again.',
                position: 'bottom',
            });
            return false;
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Password Strength',
                text2: 'Password must contain at least 6 characters for security',
                position: 'bottom',
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email Format',
                text2: 'Please enter a valid email address (e.g., name@example.com)',
                position: 'bottom',
            });
            return false;
        }

        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await signupUser(name, email, password);

            if (result.error) {
                throw new Error(result.error || result.message || 'Registration unsuccessful. Please try again.');
            }

            if (result.token) {
                await AsyncStorage.setItem('token', result.token);

                // Show success animation
                setShowSuccess(true);

                Toast.show({
                    type: 'success',
                    text1: 'Welcome to Learn-A-Word! 🎓',
                    text2: 'Your account has been successfully created and you are now logged in.',
                    position: 'bottom',
                    visibilityTime: 3000,
                });

                setTimeout(() => {
                    setShowSuccess(false);
                    if (setIsLoggedIn) {
                        setIsLoggedIn(true);
                    } else {
                        navigation.navigate('Login', {
                            signupSuccess: true,
                            email: email
                        });
                    }
                }, 2500);
            } else {
                throw new Error('Authentication token not received. Please try logging in.');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Registration Failed',
                text2: error.message || 'Unable to complete registration. Please check your connection and try again.',
                position: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    // Theme-based styles
    const backgroundStyle = {
        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
    };

    const textColor = {
        color: isDarkMode ? '#E2E8F0' : '#1F2937',
    };

    const subtitleColor = {
        color: isDarkMode ? '#CBD5E1' : '#6B7280',
    };

    const inputStyle = {
        backgroundColor: isDarkMode ? '#334155' : '#F9FAFB',
        color: isDarkMode ? '#F8FAFC' : '#1F2937',
        borderColor: focusedField ? (isDarkMode ? '#60A5FA' : '#10B981') : (isDarkMode ? '#475569' : '#E5E7EB'),
    };

    const passwordContainerStyle = {
        backgroundColor: isDarkMode ? '#334155' : '#F9FAFB',
        borderColor: focusedField ? (isDarkMode ? '#60A5FA' : '#10B981') : (isDarkMode ? '#475569' : '#E5E7EB'),
    };

    const dividerLineStyle = {
        backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
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
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim }
                            ]
                        }
                    ]}
                >
                    {/* Success Animation */}
                    {showSuccess && (
                        <Animated.View
                            style={[
                                styles.animationContainer,
                                {
                                    opacity: successOpacity,
                                    transform: [{ scale: successScale }]
                                }
                            ]}
                        >
                            <Text style={styles.successEmoji}>🎓✨</Text>
                            <Text style={[styles.successText, { color: isDarkMode ? '#34D399' : '#10B981' }]}>
                                Account Created!
                            </Text>
                        </Animated.View>
                    )}

                    <View style={styles.header}>
                        <Text style={[styles.title, textColor]}>🚀 Create Account</Text>
                        <Text style={[styles.subtitle, subtitleColor]}>
                            Join our learning community and expand your vocabulary every day
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>Full Name</Text>
                            <TextInput
                                style={[styles.input, inputStyle]}
                                placeholder="Enter your full name"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                                value={name}
                                onChangeText={setName}
                                editable={!loading}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>Email Address</Text>
                            <TextInput
                                style={[styles.input, inputStyle]}
                                placeholder="Enter your email address"
                                placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>Password</Text>
                            <View style={[styles.passwordContainer, passwordContainerStyle]}>
                                <TextInput
                                    style={[styles.passinput, { color: isDarkMode ? '#F8FAFC' : '#1F2937' }]}
                                    placeholder="Create a secure password (min. 6 characters)"
                                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    editable={!loading}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={22}
                                        color={isDarkMode ? '#60A5FA' : '#6B7280'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, textColor]}>Confirm Password</Text>
                            <View style={[styles.passwordContainer, passwordContainerStyle]}>
                                <TextInput
                                    style={[styles.passinput, { color: isDarkMode ? '#F8FAFC' : '#1F2937' }]}
                                    placeholder="Re-enter your password for verification"
                                    placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    editable={!loading}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={22}
                                        color={isDarkMode ? '#60A5FA' : '#6B7280'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.signupButton,
                                loading && styles.signupButtonDisabled,
                                { backgroundColor: isDarkMode ? '#34D399' : '#10B981' }
                            ]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signupButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, dividerLineStyle]} />
                            <Text style={[styles.dividerText, subtitleColor]}>Already registered?</Text>
                            <View style={[styles.dividerLine, dividerLineStyle]} />
                        </View>

                        <TouchableOpacity
                            style={styles.loginContainer}
                            onPress={() => navigation.navigate('Login')}
                            disabled={loading}
                        >
                            <Text style={[styles.switchText, subtitleColor]}>
                                Access your existing account{' '}
                                <Text style={[styles.link, { color: isDarkMode ? '#34D399' : '#10B981' }]}>
                                    Sign In
                                </Text>
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
        padding: 24,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    animationContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successEmoji: {
        fontSize: 56,
        marginBottom: 12,
    },
    successText: {
        fontSize: 20,
        fontWeight: '700',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    form: {
        width: '100%',
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: -0.2,
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
    passinput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
    },
    signupButton: {
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
    loginContainer: {
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
        textAlign: 'center',
    },
    link: {
        fontWeight: '700',
    },
});

export default SignupScreen;