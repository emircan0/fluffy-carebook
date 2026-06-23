import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { careEventLabels, careScheduleLabels } from '../../lib/care';
import { careEventColors, careEventEmoji, colors, fontWeight, radius, shadows, spacing, typography } from '../../lib/theme';
import type { CareEvent, CareTask } from '../../types/app';

type CareTaskRowProps = {
  task: CareTask;
  lastEvent?: CareEvent;
  canEdit: boolean;
  isDone?: boolean;
  isPending?: boolean;
  statusLabel?: string;
  onDone: (task: CareTask) => void;
};

export function formatCareEventTime(value: unknown) {
  const date =
    value && typeof value === 'object' && 'toDate' in value
      ? (value as { toDate: () => Date }).toDate()
      : null;

  if (!date) return null;

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (sameDay) return `Bugün ${time}`;
  if (isYesterday) return `Dün ${time}`;
  return `${date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} ${time}`;
}

export function CareTaskRow({
  canEdit,
  isDone = false,
  isPending = false,
  lastEvent,
  onDone,
  task,
}: CareTaskRowProps) {
  const lastDoneAt = formatCareEventTime(lastEvent?.doneAt);
  const doneDisabled = isPending || (!task.allowMultiplePerDay && isDone);
  const tint = careEventColors[task.eventType];

  return (
    <Pressable
      disabled={!canEdit || doneDisabled}
      onPress={() => onDone(task)}
      style={({ pressed }) => [
        styles.row,
        isDone && styles.rowDone,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: tint + '18' }]}>
        <Text style={styles.icon}>{careEventEmoji[task.eventType]}</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.meta}>
          {task.dueTime ? `${task.dueTime} · ` : ''}
          {careScheduleLabels[task.scheduleType]}
        </Text>
        {lastEvent ? (
          <Text style={styles.metaSoft}>
            {lastEvent.userName || 'Kullanıcı'} · {lastDoneAt || careEventLabels[task.eventType]}
          </Text>
        ) : (
          <Text style={styles.metaSoft}>{careEventLabels[task.eventType]}</Text>
        )}
      </View>

      <View style={[styles.checkCircle, isDone && styles.checkCircleDone, !canEdit && styles.disabledCircle]}>
        {isDone ? (
          <Feather name="check" size={15} color={colors.textInverse} />
        ) : (
          <Feather name="plus" size={15} color={colors.accent} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.base,
    minHeight: 88,
    overflow: 'hidden',
    ...shadows.sm,
  },
  rowDone: {
    backgroundColor: colors.surfaceRaised,
    opacity: 0.78,
  },
  rowPressed: {
    opacity: 0.78,
  },
  disabledCircle: {
    opacity: 0.4,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.bodyLg,
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
  metaSoft: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    fontWeight: fontWeight.medium,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  icon: {
    fontSize: 26,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  checkCircleDone: {
    backgroundColor: colors.success,
  },
});
