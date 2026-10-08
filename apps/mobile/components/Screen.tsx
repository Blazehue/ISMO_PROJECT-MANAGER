import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme';
import { OfflineBanner } from './OfflineBanner';

/** Safe-area screen with the theme background and the offline banner. */
export function Screen({ children, edges = ['top'] }: { children: ReactNode; edges?: Edge[] }) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={edges}>
      <OfflineBanner />
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
