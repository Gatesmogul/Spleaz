import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';

export default function CustomerRootLayout() {
  const { theme } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, animation: 'slide_from_right' }}>
    <Stack.Screen name="(drawer)" />
    <Stack.Screen name="tracking/[rideId]" />
    <Stack.Screen name="chat/[rideId]" />
    <Stack.Screen name="cancel-[rideId]" />
    <Stack.Screen name="trips" />
  </Stack>;
}
