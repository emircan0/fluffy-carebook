import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { SectionHeader } from '../ui/SectionHeader';
import {
  formatReminderDateLabel,
  reminderTypeIcons,
  reminderTypeLabels,
} from '../../lib/reminders';
import { colors, fontWeight, radius, spacing, typography } from '../../lib/theme';
import type { Reminder } from '../../types/app';

type UpcomingListProps = {
  canEdit: boolean;
  reminders?: Reminder[];
  onToggleComplete?: (reminder: Reminder) => void;
  isToggling?: boolean;
};

export function UpcomingList({
  canEdit,
  reminders = [],
  onToggleComplete,
  isToggling = false,
}: UpcomingListProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <SectionHeader title={t('care.upcoming')} />

      {reminders.length === 0 ? (
        <EmptyState
          icon="📅"
          text={
            canEdit
              ? t('care.upcomingEmptyOwner')
              : t('care.upcomingEmptyGuest')
          }
          title={t('care.upcomingEmptyTitle')}
        />
      ) : (
        <View style={styles.list}>
          {reminders.slice(0, 5).map((reminder) => {
            const isDone = reminder.isCompleted === true;
            return (
              <View key={reminder.id} style={[styles.row, isDone && styles.rowDone]}>
                {canEdit && onToggleComplete ? (
                  <Pressable
                    disabled={isToggling}
                    onPress={() => onToggleComplete(reminder)}
                    style={({ pressed }) => [
                      styles.checkCircle,
                      isDone && styles.checkCircleDone,
                      pressed && styles.pressed,
                    ]}
                  >
                    {isDone ? (
                      <Feather name="check" size={12} color={colors.textInverse} />
                    ) : (
                      <Feather name="plus" size={12} color={colors.accentDark} />
                    )}
                  </Pressable>
                ) : null}
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>{reminderTypeIcons[reminder.reminderType]}</Text>
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
                    {reminder.title}
                  </Text>
                  <Text style={styles.meta}>
                    {reminderTypeLabels[reminder.reminderType]}
                  </Text>
                </View>
                <Text style={[styles.date, isDone && styles.dateDone]}>
                  {formatReminderDateLabel(reminder.remindAt)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.md,
  },
  rowDone: {
    opacity: 0.65,
    backgroundColor: colors.surfaceRaised,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  icon: {
    fontSize: 22,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.black,
  },
  titleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  date: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
  },
  dateDone: {
    color: colors.textSecondary,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  checkCircleDone: {
    backgroundColor: colors.success,
  },
  pressed: {
    opacity: 0.78,
  },
});
