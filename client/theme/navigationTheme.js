import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const LightAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    text: '#000000',
    card: '#F5F5F5',
    primary: '#4CAF50',
  },
};

export const DarkAppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
    text: '#FFFFFF',
    card: '#1E1E1E',
    primary: '#BB86FC',
  },
};
