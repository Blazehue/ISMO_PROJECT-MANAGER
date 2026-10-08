import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';
import { Asterisk } from './fx/Asterisk';
import { Eyebrow } from './fx/Eyebrow';
import { Marquee } from './fx/Marquee';
import { LogoMark } from './LogoMark';
import { Screen } from './Screen';
import { Text } from './Text';

const useCases = ['Lab experiments', 'Device builds', 'Research milestones', 'Customer orders', 'Imaging runs'];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <Screen edges={['top', 'bottom']}>
      <LinearGradient pointerEvents="none" colors={[theme.brandSoft, theme.bg]} style={styles.wash} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500)} style={styles.brand}>
            <LogoMark size={30} />
            <Text variant="title" style={{ fontSize: 19 }}>
              ISMO
            </Text>
            <View style={{ flex: 1 }} />
            <Asterisk size={18} color={theme.brand} spin />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(500)}>
            <Eyebrow rule>{eyebrow}</Eyebrow>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(120).duration(550)} style={{ marginTop: 16 }}>
            <Text variant="display" style={styles.title}>
              {title}
            </Text>
            <Text muted style={{ marginTop: 10 }}>
              {subtitle}
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(550)} style={{ marginTop: 28, gap: 16 }}>
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Use-case ticker, like the website's keyword marquee */}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 40 },
  title: { fontSize: 38, lineHeight: 42, letterSpacing: -1.6 },
  ticker: { borderTopWidth: 1, paddingVertical: 12 },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16 },
});
