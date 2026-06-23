import { StyleSheet, Text } from 'react-native';

import { colors, fontWeight, radius, spacing, typography } from '../../lib/theme';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'accent'
  | 'roleOwner'
  | 'roleEditor'
  | 'roleViewer';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

export function Badge({ label, variant = 'muted' }: BadgeProps) {
  return <Text style={[styles.base, styles[variant]]}>{label}</Text>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    fontSize: typography.micro,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  accent: {
    backgroundColor: colors.accentSoft,
    color: colors.accent,
  },
  success: {
    backgroundColor: colors.successBg,
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningBg,
    color: colors.warning,
  },
  danger: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
  },
  info: {
    backgroundColor: colors.infoBg,
    color: colors.info,
  },
  muted: {
    backgroundColor: colors.surfaceRaised,
    color: colors.textTertiary,
  },
  roleOwner: {
    backgroundColor: colors.roleOwnerBg,
    color: colors.roleOwner,
  },
  roleEditor: {
    backgroundColor: colors.roleEditorBg,
    color: colors.roleEditor,
  },
  roleViewer: {
    backgroundColor: colors.roleViewerBg,
    color: colors.roleViewer,
  },
});
