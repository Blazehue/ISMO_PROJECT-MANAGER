import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { fonts, useTheme } from '@/lib/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'number' | 'mono';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.medium, fontSize: 30, letterSpacing: -1.1, lineHeight: 34 },
  title: { fontFamily: fonts.medium, fontSize: 20, letterSpacing: -0.5, lineHeight: 25 },
  heading: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: -0.25, lineHeight: 21 },
  body: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 21 },
  label: { fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  number: { fontFamily: fonts.regular, fontSize: 32, letterSpacing: -1.4, lineHeight: 36 },
  // Small uppercase mono label, e.g. "// OVERVIEW" or "TOTAL TASKS"
  mono: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.9, lineHeight: 14, textTransform: 'uppercase' },
};

export function Text({
  variant = 'body',
  muted,
  color,
  style,
  ...props
}: TextProps & { variant?: Variant; muted?: boolean; color?: string }) {
  const { theme } = useTheme();
  return (
    <RNText {...props} style={[variants[variant], { color: color ?? (muted ? theme.textMuted : theme.text) }, style]} />
  );
}

/**
 * Serif-italic accent word inside a heading, e.g. "Welcome <Accent>back</Accent>".
 * Pass the parent's font size; the serif is set slightly larger to match cap height.
 */
export function Accent({ children, size, color }: { children: string; size: number; color?: string }) {
  const { theme } = useTheme();
  return (
    <RNText
      style={{
        fontFamily: fonts.serifItalic,
        fontSize: size * 1.1,
        letterSpacing: -0.2,
        color: color ?? theme.text,
      }}
    >
      {children}
    </RNText>
  );
}
