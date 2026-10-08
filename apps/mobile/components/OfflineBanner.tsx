import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useIsOnline } from '@/hooks/useNetwork';
import { fonts, useTheme } from '@/lib/theme';
import { Text } from './Text';

/** Shown on every screen while there's no connection. Cached data stays visible underneath. */
export function OfflineBanner() {
  const online = useIsOnline();
  const { theme } = useTheme();
  if (online) return null;
  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.banner, { backgroundColor: theme.warningSoft }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Feather name="wifi-off" size={14} color={theme.warningText} />
      <Text style={styles.text} color={theme.warningText}>
        You&apos;re offline. Showing your last synced data.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 9 },
  text: { fontFamily: fonts.medium, fontSize: 12.5 },
});
