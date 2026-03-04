import { Cairo_400Regular, Cairo_500Medium, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../context/AuthContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Cairo: Cairo_400Regular,
    CairoMedium: Cairo_500Medium,
    CairoBold: Cairo_700Bold,
    'Cairo-Bold': Cairo_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

function RootNavigation() {
  const { token } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in and not already in (auth) group, redirect to landing
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/landing');
    } else if (token && inAuthGroup) {
      // If user is logged in but in auth group, go to home
      router.replace('/(tabs)');
    }
  }, [token, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="emergency" options={{ headerShown: false }} />
      <Stack.Screen name="reminders" options={{ title: 'Reminders' }} />
      <Stack.Screen name="vehicle" options={{ title: 'Vehicle' }} />
      <Stack.Screen name="authority" options={{ title: 'Authority' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
