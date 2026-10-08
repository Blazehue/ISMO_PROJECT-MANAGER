import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { View, type ColorValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { fonts, useTheme } from '@/lib/theme';

/** Tab icon that springs up when selected, with a lavender dot underneath. */
function TabIcon({
  name,
  color,
  focused,
}: {
  name: ComponentProps<typeof Feather>['name'];
  color: ColorValue;
  focused: boolean;
}) {
  const { theme } = useTheme();
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [focused, progress]);
  const icon = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * progress.value }, { scale: 1 + 0.08 * progress.value }],
  }));
  const dot = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: progress.value }] }));
  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={icon}>
        <Feather name={name} size={20} color={color} />
      </Animated.View>
      <Animated.View
        style={[{ width: 4, height: 4, borderRadius: 2, marginTop: 3, backgroundColor: theme.brand }, dot]}
      />
    </View>
  );
}

const icon =
  (name: ComponentProps<typeof Feather>['name']) =>
  ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <TabIcon name={name} color={color} focused={focused} />
  );

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase' },
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border, height: 64 },
        sceneStyle: { backgroundColor: theme.bg },
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: icon('folder') }} />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: icon('user') }} />
    </Tabs>
  );
}
