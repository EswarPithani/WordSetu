import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';


const Stack = createStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: '📚 Learn A Word A Day' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: '⚙️ Settings' }}
            />

            <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: '📖 Word History' }}
            />
        </Stack.Navigator>
    );
};

export default StackNavigator;
