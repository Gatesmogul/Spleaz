import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        // ======================================================
        // HEADER
        // ======================================================

        headerShown: false,

        // ======================================================
        // SCREEN BACKGROUND
        // ======================================================

        contentStyle: {
          backgroundColor: colors.background,
        },

        // ======================================================
        // NAVIGATION ANIMATION
        // ======================================================

        animation: 'slide_from_right',

        // ======================================================
        // HEADER COLORS
        // ======================================================

        headerStyle: {
          backgroundColor: colors.background,
        },

        headerShadowVisible: false,

        // ======================================================
        // HEADER TITLE
        // ======================================================

        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      {/* ======================================================
          LOGIN
          ====================================================== */}

      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />

      {/* ======================================================
          OTP VERIFICATION
          ====================================================== */}

      <Stack.Screen
        name="otp-verify"
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      {/* ======================================================
          REGISTER
          ====================================================== */}

      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}