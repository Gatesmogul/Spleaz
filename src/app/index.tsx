import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();
  const { theme, isDark } = useTheme();

  // Animation values for smooth branding entry
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Trigger Entrance Animation
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoScale, logoOpacity]);

  useEffect(() => {
    // 2. Auth Guard & Routing Decision Engine
    if (isLoading) return;

    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        if (role === 'DRIVER') {
          router.replace('/(driver)/(drawer)');
        } else {
          router.replace('/(customer)/(drawer)');
        }
      } else {
        router.replace('/(auth)/sign-in');
      }
    }, 1200); // Brief splash display delay for logo presentation

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={[styles.logoText, { color: theme.colors.primary }]}>
          Spleaz
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.text }]}>
          Seamless Mobility & Express Deliveries
        </Text>
      </Animated.View>

      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
});