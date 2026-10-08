import { GeistMono_400Regular, GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppIntro, AppOutro } from '@/components/fx/Cinema';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider, useAuth } from '@/lib/auth';
import { persister, queryClient } from '@/lib/queryClient';
import { ThemeProvider, useTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const DAY = 1000 * 60 * 60 * 24;

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { status } = useAuth();
  const { theme } = useTheme();
  const ready = fontsLoaded && status !== 'loading';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.bg).catch(() => {});
  }, [theme.bg]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  const signedIn = status === 'authenticated';

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      >
        {/* Signed-in screens. If the session ends, the guard sends you back to login. */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="project/[id]" />
          <Stack.Screen
            name="project-form"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.92],
              sheetGrabberVisible: true,
              sheetCornerRadius: 24,
              contentStyle: { backgroundColor: theme.bg },
            }}
          />
          <Stack.Screen
            name="task-form"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.92],
              sheetGrabberVisible: true,
              sheetCornerRadius: 24,
              contentStyle: { backgroundColor: theme.bg },
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
      <AppIntro />
      <AppOutro />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    InstrumentSerif_400Regular_Italic,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PersistQueryClientProvider client={queryClient} persistOptions={{ persister, maxAge: DAY, buster: 'v1' }}>
            <AuthProvider>
              <ToastProvider>
                <RootNavigator fontsLoaded={fontsLoaded} />
              </ToastProvider>
            </AuthProvider>
          </PersistQueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
