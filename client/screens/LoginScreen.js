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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/api';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = ({ setIsLoggedIn, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
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
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
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
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset success animation
      successScale.setValue(0);
      successOpacity.setValue(0);
    }
  }, [showSuccess]);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please enter both email and password',
        position: 'bottom',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email, password);

      if (response.error) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: response.error,
          position: 'bottom',
        });
        return;
      }

      await AsyncStorage.setItem('token', response.token);

      // Show success animation
      setShowSuccess(true);

      Toast.show({
        type: 'success',
        text1: 'Welcome back! 👋',
        text2: 'Logged in successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });

      // Delay navigation to allow animation to play
      setTimeout(() => {
        setIsLoggedIn(true);
        setShowSuccess(false);
      }, 1500);

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Something went wrong. Please try again.',
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
    borderColor: focusedField === 'email' ? (isDarkMode ? '#60A5FA' : '#4F46E5') : (isDarkMode ? '#475569' : '#E5E7EB'),
  };

  const passwordContainerStyle = {
    backgroundColor: isDarkMode ? '#334155' : '#F9FAFB',
    borderColor: focusedField === 'password' ? (isDarkMode ? '#60A5FA' : '#4F46E5') : (isDarkMode ? '#475569' : '#E5E7EB'),
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
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={[styles.successText, { color: isDarkMode ? '#10B981' : '#059669' }]}>
                Success!
              </Text>
            </Animated.View>
          )}

          <View style={styles.header}>
            <Text style={[styles.title, textColor]}>🔐 Login</Text>
            <Text style={[styles.subtitle, subtitleColor]}>
              Welcome back! Sign in to continue your learning journey
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, textColor]}>Email</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="Enter your email"
                placeholderTextColor={isDarkMode ? '#94A3B8' : '#9CA3AF'}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
                  placeholder="Enter your password"
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
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color={isDarkMode ? '#60A5FA' : '#4F46E5'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
                { backgroundColor: isDarkMode ? '#60A5FA' : '#4F46E5' }
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading}
            >
              <Text style={[styles.forgotPasswordText, { color: isDarkMode ? '#60A5FA' : '#4F46E5' }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, dividerLineStyle]} />
            <Text style={[styles.dividerText, subtitleColor]}>or</Text>
            <View style={[styles.dividerLine, dividerLineStyle]} />
          </View>

          <TouchableOpacity
            style={styles.signupContainer}
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
          >
            <Text style={[styles.switchText, subtitleColor]}>
              Don't have an account?{' '}
              <Text style={[styles.link, { color: isDarkMode ? '#60A5FA' : '#4F46E5' }]}>
                Sign up
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  animationContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  successText: {
    fontSize: 22,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    marginBottom: 30,
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
  passinput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  signupContainer: {
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
  },
  link: {
    fontWeight: '700',
  },
});

export default LoginScreen;