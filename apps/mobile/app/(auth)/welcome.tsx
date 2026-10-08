import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { ArrowButton } from '@/components/fx/ArrowButton';
import { Asterisk } from '@/components/fx/Asterisk';
import { CardDeck } from '@/components/fx/CardDeck';
import { Marquee } from '@/components/fx/Marquee';
import { PulseDot } from '@/components/fx/PulseDot';
import { LogoMark } from '@/components/LogoMark';
import { Screen } from '@/components/Screen';
import { Accent, Text } from '@/components/Text';
import { useAuth } from '@/lib/auth';
import { fonts, useTheme } from '@/lib/theme';

const useCases = ['Lab experiments', 'Device builds', 'Research milestones', 'Customer orders', 'Imaging runs'];

/** Landing screen of the Android app (signed out), mirroring the website hero. */
export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { sessionExpired } = useAuth();

  // An expired session goes straight to login, where the reason is explained.
  if (sessionExpired) return <Redirect href="/login" />;

  return (
    <Screen edges={['top', 'bottom']}>
      <LinearGradient pointerEvents="none" colors={[theme.brandSoft, theme.bg]} style={styles.wash} />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.brand}>
          <LogoMark size={30} />
          <Text variant="title" style={{ fontSize: 19 }}>
            ISMO
          </Text>
          <View style={{ flex: 1 }} />
          <Asterisk size={18} color={theme.brand} spin />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).duration(500)}
          style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          <PulseDot color={theme.success} size={6} />
          <Text variant="mono" muted style={{ fontSize: 9.5 }}>
            Web dashboard + Android app
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(600)} style={{ marginTop: 18 }}>
          <Text variant="display" style={styles.headline}>
            Know your projects.
          </Text>
          <Text variant="display" style={styles.headline}>
            Ship with <Accent size={42}>clarity.</Accent>
          </Text>
          <Text muted style={{ marginTop: 14, maxWidth: 330 }}>
            Organise projects, break them into tasks and keep every deadline honest. Same account as the web.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(320).springify().damping(18)}>
          <CardDeck />
        </Animated.View>
      </ScrollView>

      <View style={[styles.ticker, { borderTopColor: theme.border }]}>
        <Marquee speed={28}>
          {useCases.map((item) => (
            <View key={item} style={styles.tickerItem}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, letterSpacing: -0.3 }} muted>
                {item}
              </Text>
              <Asterisk size={10} color={theme.brand} />
            </View>
          ))}
        </Marquee>
      </View>

      <Animated.View entering={FadeInUp.delay(420).duration(500)} style={styles.actions}>
        <ArrowButton title="Get started" onPress={() => router.push('/register')} />
        <Button title="I already have an account" variant="ghost" onPress={() => router.push('/login')} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 34 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  headline: { fontFamily: 'Inter_400Regular', fontSize: 40, lineHeight: 44, letterSpacing: -1.8 },
  ticker: { borderTopWidth: 1, paddingVertical: 12 },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16 },
  actions: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 8, gap: 4 },
});
