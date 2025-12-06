import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import FormStep1Screen from './screens/FormStep1Screen';
import FormStep2Screen from './screens/FormStep2Screen';
import MapScreen from './screens/MapScreen';

const Stack = createStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#e53935',
    secondary: '#1565c0',
    accent: '#ff5722',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#d32f2f',
    text: '#333333',
    disabled: '#bdbdbd',
    placeholder: '#9e9e9e',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#e53935',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Ocorrências CBM-PE' }}
            />
            <Stack.Screen 
              name="FormStep1" 
              component={FormStep1Screen} 
              options={{ title: 'Nova Ocorrência - Etapa 1' }}
            />
            <Stack.Screen 
              name="FormStep2" 
              component={FormStep2Screen} 
              options={{ title: 'Nova Ocorrência - Etapa 2' }}
            />
            <Stack.Screen 
              name="Mapa" 
              component={MapScreen} 
              options={{ title: 'Mapa de Ocorrências' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}