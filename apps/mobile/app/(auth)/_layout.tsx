import { Stack } from 'expo-router';
import { useTheme } from '@/lib/theme';

// The welcome screen is the entry point when signed out.
export const unstable_settings = { initialRouteName: 'welcome' };

export default function AuthLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg }, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
