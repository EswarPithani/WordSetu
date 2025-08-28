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
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { resetPassword } from '../services/api';

function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const scheme = useColorScheme(); // light | dark
    const isDark = scheme === 'dark';

    const handleResetPassword = async () => {
        if (!email || !newPassword) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields',
                position: 'bottom',
            });
            return;
        }

        setLoading(true);

        try {
            const data = await resetPassword(email, newPassword);

            if (data.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Password updated!',
                    text2: 'You can now login with your new password',
                    position: 'bottom',
                });
                navigation.navigate('Login');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Reset Failed',
                    text2: data.message || 'Something went wrong',
                    position: 'bottom',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Reset Failed',
                text2: error.response?.data?.message || 'Something went wrong',
                position: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#111827' }]}>
                    Reset Your Password
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        { 
                            backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                            color: isDark ? '#F9FAFB' : '#1F2937',
                            borderColor: isDark ? '#374151' : '#ccc'
                        }
                    ]}
                    placeholder="Email"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <View
                    style={[
                        styles.passwordContainer,
                        { 
                            backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                            borderColor: isDark ? '#374151' : '#ccc'
                        }
                    ]}
                >
                    <TextInput
                        style={[
                            styles.passwordInput,
                            { color: isDark ? '#F9FAFB' : '#1F2937' }
                        ]}
                        placeholder="New Password"
                        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={24}
                            color={isDark ? '#A5B4FC' : '#4F46E5'}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        loading && styles.buttonDisabled,
                        { backgroundColor: loading ? '#9CA3AF' : '#4F46E5' }
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default ForgotPasswordScreen;
