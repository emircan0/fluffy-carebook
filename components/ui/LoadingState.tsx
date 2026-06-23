import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight, spacing, typography } from '../../lib/theme';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Yükleniyor…' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size="small" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 80,
  },
  label: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
});
