import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontWeight, radius, shadows, spacing, typography } from '../../lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';

type ButtonProps = PropsWithChildren<{
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  size?: 'lg' | 'md' | 'sm' | 'xs';
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}>;

export function Button({
  disabled = false,
  label,
  loading = false,
  onPress,
  size = 'md',
  style,
  variant = 'primary',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        variant === 'primary' && !isDisabled && shadows.accent,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textInverse : colors.accent}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          styles[`label_${variant}`],
          styles[`label_${size}`],
          isDisabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },

  // Sizes
  size_lg: {
    minHeight: 58,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
  },
  size_md: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  size_sm: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  size_xs: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },

  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  ghost: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  subtle: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },

  disabled: {
    backgroundColor: colors.surfaceRaised,
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  // Labels
  label: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.1,
  },
  label_primary: { color: colors.textInverse },
  label_secondary: { color: colors.accent },
  label_ghost: { color: colors.textPrimary },
  label_subtle: { color: colors.textSecondary },
  label_danger: { color: colors.danger },
  label_lg: { fontSize: typography.bodyLg },
  label_md: { fontSize: typography.body },
  label_sm: { fontSize: typography.caption },
  label_xs: { fontSize: typography.micro },
  labelDisabled: { color: colors.textTertiary },
});
