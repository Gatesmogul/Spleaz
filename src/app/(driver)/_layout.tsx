import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function DriverRootLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      {/* 1. DRAWER ROUTE GROUP (Dashboard Map, Completed Trips, Profile) */}
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
        }}
      />

      {/* 2. LIVE CHAT WITH PASSENGER */}
      <Stack.Screen
        name="chat/[rideId]"
        options={{
          headerShown: false,
          animation: 'simple_push',
        }}
      />

      {/* 3. COMMISSION RECEIPT UPLOAD MODAL */}
      <Stack.Screen
        name="commission-upload"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
