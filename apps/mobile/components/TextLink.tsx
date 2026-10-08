import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';
import { fonts } from '@/lib/theme';
import { Text } from './Text';

/** Inline text link. Uses a Pressable because expo-router's <Link> can't take our styled children. */
export function TextLink({
  href,
  label,
  replace,
  muted,
}: {
  href: Href;
  label: string;
  replace?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={() => (replace ? router.replace(href) : router.navigate(href))}
      accessibilityRole="link"
      hitSlop={8}
    >
      <Text muted={muted} style={{ fontFamily: fonts.medium }}>
        {label}
      </Text>
    </Pressable>
  );
}
