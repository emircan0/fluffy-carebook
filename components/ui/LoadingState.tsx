import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, fontWeight, spacing, typography } from '../../lib/theme';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  const { t } = useTranslation();
  const displayLabel = label || t('common.loading');

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size="small" />
      <Text style={styles.label}>{displayLabel}</Text>
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
