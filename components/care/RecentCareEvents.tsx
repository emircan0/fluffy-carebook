import { StyleSheet, Text, View } from 'react-native';

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

export function RecentCareEvents({ events, title = 'Son Hareketler' }: RecentCareEventsProps) {
  return (
    <Card>
      <SectionHeader subtitle="Aile içinde kimin ne yaptığını takip et." title={title} />

      {events.length === 0 ? (
        <EmptyState
          icon="🌤️"
          text="Görevler tamamlandıkça burada kısa bir bakım akışı oluşacak."
          title="Bugün hareket yok."
        />
      ) : (
        <View style={styles.list}>
          {events.slice(0, 6).map((event) => {
            const doneAt = formatCareEventTime(event.doneAt);
            const eventLabel = careEventLabels[event.eventType];
            const tint = careEventColors[event.eventType];

            return (
              <View key={event.id} style={styles.eventRow}>
                <View style={[styles.iconBox, { backgroundColor: tint + '20' }]}>
                  <Text style={styles.icon}>{careEventEmoji[event.eventType]}</Text>
                </View>
                <View style={styles.eventBody}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    <Text style={{ color: colors.accent }}>{event.userName || 'Kullanıcı'}</Text>
                    {', '}{event.taskTitle || eventLabel} tamamladı
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
