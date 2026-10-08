import { View } from 'react-native';
import { useTheme } from '@/lib/theme';

/** Six-petal mark (same as the web logo). */
export function LogoMark({ size = 28 }: { size?: number }) {
  const { theme } = useTheme();
  // Same geometry as the web SVG (viewBox 32): petals r=5 at distance 7, centre hole r=4.
  const unit = size / 32;
  const r = 5 * unit;
  const center = size / 2;
  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return { x: center + Math.cos(angle) * 7 * unit, y: center + Math.sin(angle) * 7 * unit };
  });
  return (
    <View style={{ width: size, height: size }} accessibilityLabel="ISMO">
      {petals.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            left: p.x - r,
            top: p.y - r,
            backgroundColor: theme.brand,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          width: 8 * unit,
          height: 8 * unit,
          borderRadius: size,
          left: center - 4 * unit,
          top: center - 4 * unit,
          backgroundColor: theme.bg,
        }}
      />
    </View>
  );
}
