import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { Surface } from '@/components/Surface';
import { Eyebrow } from '@/components/fx/Eyebrow';
import { SectionHeader } from '@/components/SectionHeader';
import { Accent, Text } from '@/components/Text';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, initials } from '@/lib/format';
import { fonts, useTheme, type ThemePreference } from '@/lib/theme';

function InfoRow({ icon, title, body }: { icon: ComponentProps<typeof Feather>['name']; title: string; body: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: theme.subtle, borderColor: theme.border }]}>
        <Feather name={icon} size={15} color={theme.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label">{title}</Text>
        <Text variant="caption" muted style={{ marginTop: 2, lineHeight: 17 }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

export default function MeScreen() {
  const { user, logout } = useAuth();
  const { theme, preference, setPreference } = useTheme();
  if (!user) return null;

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      void logout();
      return;
    }
    Alert.alert('Log out?', 'You can log back in with the same email and password.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Eyebrow>Settings</Eyebrow>
        <Text variant="display" style={{ marginTop: 8 }}>
          Your <Accent size={30}>account</Accent>
        </Text>

        <Animated.View entering={FadeInDown.duration(450)}>
          <Surface style={styles.profile}>
            <View style={[styles.avatar, { backgroundColor: theme.brandStrong }]}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 22 }} color="#FFFFFF">
                {initials(user.name)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="title">{user.name}</Text>
              <Text muted>{user.email}</Text>
              <Text variant="mono" muted style={{ marginTop: 6, fontSize: 9.5 }}>
                Member since {formatDate(user.createdAt)}
              </Text>
            </View>
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(450)} style={{ gap: 10 }}>
          <SectionHeader label="Appearance" />
          <Segmented<ThemePreference>
            accessibilityLabel="Theme"
            value={preference}
            onChange={setPreference}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(450)}>
          <SectionHeader label="Security" />
          <Surface style={{ gap: 14 }}>
            <InfoRow
              icon="lock"
              title="Session"
              body="Your sign-in is kept in the Android Keystore, never in plain storage."
            />
            <InfoRow
              icon="refresh-cw"
              title="Same account everywhere"
              body="Changes here show up on the web after a refresh, and the other way round."
            />
            <InfoRow icon="server" title="Connected to" body={API_URL.replace(/^https?:\/\//, '')} />
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(450)} style={{ marginTop: 24 }}>
          <Button title="Log out" icon="log-out" variant="danger" size="lg" onPress={confirmLogout} />
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 18, paddingBottom: 40, gap: 4 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  avatar: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoIcon: { width: 32, height: 32, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
