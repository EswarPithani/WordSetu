import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPassword';

const Stack = createStackNavigator();

export default function AuthStack({ setIsLoggedIn }) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login">
                {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>

            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Signup">
                {props => <SignupScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}
