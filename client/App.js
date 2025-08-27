import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';
import AppStack from './navigation/AppStack';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuProvider } from 'react-native-popup-menu';
import { LightAppTheme, DarkAppTheme } from './theme/navigationTheme';
import { FontSizeProvider } from "./context/FontSizeContext";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { LanguageProvider } from './context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications (remote notifications)',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Invalid credentials',

]);


// ✅ Toast wrapper to centralize config
function ToastWrapper() {
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#4CAF50',
          backgroundColor: '#E8F5E9',
          borderRadius: 12,
          marginHorizontal: 10,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2E7D32',
        }}
        text2Style={{
          fontSize: 14,
          color: '#388E3C',
        }}
        renderLeadingIcon={() => (
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
        )}
      />
    ),

    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: '#FF5252',
          backgroundColor: '#FFEBEE',
          borderRadius: 12,
          marginHorizontal: 10,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#B71C1C',
        }}
        text2Style={{
          fontSize: 14,
          color: '#D32F2F',
        }}
        renderLeadingIcon={() => (
          <Ionicons name="alert-circle" size={28} color="#FF5252" />
        )}
      />
    ),

    info: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#2196F3',
          backgroundColor: '#E3F2FD',
          borderRadius: 12,
          marginHorizontal: 10,
        }}
        text1Style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#0D47A1',
        }}
        text2Style={{
          fontSize: 14,
          color: '#1976D2',
        }}
        renderLeadingIcon={() => (
          <Ionicons name="information-circle" size={28} color="#2196F3" />
        )}
      />
    )
  };

  return <Toast config={toastConfig} />;
}

function AppNavigator({ isLoggedIn, setIsLoggedIn }) {
  const { isDarkMode } = useTheme();

  return (
    <MenuProvider>
      <NavigationContainer theme={isDarkMode ? DarkAppTheme : LightAppTheme}>
        {isLoggedIn
          ? <AppStack setIsLoggedIn={setIsLoggedIn} />
          : <AuthStack setIsLoggedIn={setIsLoggedIn} />}
      </NavigationContainer>
    </MenuProvider>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) setIsLoggedIn(true);
      setLoading(false);
    };
    checkLoginStatus();
  }, []);

  if (loading) return null;

  return (
    <FontSizeProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <ToastWrapper />
        </ThemeProvider>
      </LanguageProvider>
    </FontSizeProvider>
  );
}
