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
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';  // 👈 Add this
import { signupUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

function SignupScreen({ navigation, setIsLoggedIn }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // 👇 New states for visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        if (!name || !email || !password || !confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Missing Information',
                text2: 'Please fill in all fields',
                position: 'bottom',
            });
            return false;
        }

        if (password !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Passwords do not match',
                position: 'bottom',
            });
            return false;
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must be at least 6 characters',
                position: 'bottom',
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid email address',
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
                throw new Error(result.error || result.message || 'Signup failed');
            }

            if (result.token) {
                await AsyncStorage.setItem('token', result.token);

                // Show success animation
                setShowSuccess(true);

                Toast.show({
                    type: 'success',
                    text1: 'Welcome to Learn-A-Word! 🎉',
                    text2: 'Your account has been created successfully',
                    position: 'bottom',
                    visibilityTime: 2500,
                });

                // Show animation and then navigate or login
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
                }, 2000);
            } else {
                throw new Error('No token received from server');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Signup Failed',
                text2: error.message || 'Something went wrong. Please try again.',
                position: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Success Animation with Emoji */}
                {showSuccess && (
                    <View style={styles.animationContainer}>
                        <Text style={styles.successEmoji}>🎓✨🎉</Text>
                        <Text style={styles.successText}>Account Created!</Text>
                    </View>
                )}

                <Text style={styles.title}>🚀 Create Account</Text>
                <Text style={styles.subtitle}>Join us and start learning new words every day!</Text>

                <TextInput
                    placeholder="Full Name"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                />

                <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />

                {/* Password with eye toggle 👁️ */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        placeholder="Password (min. 6 characters)"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={22}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 16 }} />

                {/* Confirm Password with eye toggle 👁️ */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={22}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 24 }} />

                <TouchableOpacity
                    style={[styles.signupButton, loading && styles.signupButtonDisabled]}
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
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Already have an account?</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={styles.loginContainer}
                    onPress={() => navigation.navigate('Login')}
                    disabled={loading}
                >
                    <Text style={styles.switchText}>
                        Sign in to your account{' '}
                        <Text style={styles.link}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    animationContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    successEmoji: {
        fontSize: 64,
        marginBottom: 10,
    },
    successText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#10B981',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6B7280',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingRight: 12,
    },
    eyeIcon: {
        padding: 8,
    },
    signupButton: {
        backgroundColor: '#10B981',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    signupButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#6B7280',
        fontSize: 14,
    },
    loginContainer: {
        alignItems: 'center',
    },
    switchText: {
        color: '#6B7280',
        fontSize: 14,
        textAlign: 'center',
    },
    link: {
        color: '#10B981',
        fontWeight: '600',
    },
});

export default SignupScreen;
