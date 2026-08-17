import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootLayoutNav() {
  const { isDark, theme } = useTheme();
  useEffect(() => { void SplashScreen.hideAsync().catch(() => undefined); }, []);
  return <>
    <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(driver)" />
    </Stack>
  </>;
}

export default function RootLayout() {
  return <SafeAreaProvider>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LocationProvider>
            <RootLayoutNav />
          </LocationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </SafeAreaProvider>;
}
