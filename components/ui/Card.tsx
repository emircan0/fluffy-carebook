import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../lib/theme';

type CardProps = PropsWithChildren<{
  variant?: 'default' | 'raised' | 'accent' | 'flush';
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}>;

export function Card({ children, variant = 'default', style, padded = true }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'default' && styles.default,
        variant === 'raised' && styles.raised,
        variant === 'accent' && styles.accent,
        variant === 'flush' && styles.flush,
        !padded && styles.unpadded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
    ...shadows.md,
  },
  accent: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  flush: {
    backgroundColor: colors.surface,
    padding: 0,
    ...shadows.sm,
  },
  unpadded: {
    padding: 0,
  },
});
