import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight, spacing, typography } from '../../lib/theme';

type EmptyStateProps = {
  action?: ReactNode;
  icon?: string;
  text?: string;
  title: string;
};

export function EmptyState({ action, icon = '🐾', text, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxxl,
  },
  icon: {
    fontSize: 52,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
    textAlign: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 260,
  },
});
