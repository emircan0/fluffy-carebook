import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatCareEventTime } from './CareTaskRow';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SectionHeader } from '../ui/SectionHeader';
import { careEventLabels } from '../../lib/care';
import { careEventColors, careEventEmoji, colors, fontWeight, radius, spacing, typography } from '../../lib/theme';
import type { CareEvent } from '../../types/app';

type RecentCareEventsProps = {
  events: CareEvent[];
  title?: string;
};

export function RecentCareEvents({ events, title }: RecentCareEventsProps) {
  const { t } = useTranslation();
  const displayTitle = title || t('care.recentEvents');

  return (
    <Card>
      <SectionHeader subtitle={t('care.recentEventsSubtitle')} title={displayTitle} />

      {events.length === 0 ? (
        <EmptyState
          icon="🌤️"
          text={t('care.noEventsDesc')}
          title={t('care.noEventsTitle')}
        />
      ) : (
        <View style={styles.list}>
          {events.slice(0, 6).map((event) => {
            const doneAt = formatCareEventTime(event.doneAt, t);
            const eventLabel = careEventLabels[event.eventType];
            const tint = careEventColors[event.eventType];

            return (
              <View key={event.id} style={styles.eventRow}>
                <View style={[styles.iconBox, { backgroundColor: tint + '20' }]}>
                  <Text style={styles.icon}>{careEventEmoji[event.eventType]}</Text>
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    <Text style={{ color: colors.accent }}>{event.userName || t('care.user')}</Text>
                    {t('care.completed', { task: event.taskTitle || eventLabel })}
                  </Text>
                  <Text style={styles.eventMeta}>{doneAt || eventLabel}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  eventRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
    flexShrink: 0,
  },
  icon: {
    fontSize: 20,
  },
  eventBody: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
    lineHeight: 19,
  },
  eventMeta: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    fontWeight: fontWeight.medium,
  },
});
