import { StyleSheet, Text, View } from 'react-native';

import { CareTaskRow } from './CareTaskRow';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/LoadingState';
import { SectionHeader } from '../ui/SectionHeader';
import { colors, fontWeight, radius, spacing, typography } from '../../lib/theme';
import type { TodayDashboardTask } from '../../lib/queries/useTodayDashboard';
import type { CareTask } from '../../types/app';

type TodayFeedProps = {
  canEdit: boolean;
  errorMessage?: string | null;
  isLoading: boolean;
  pendingTaskId?: string | null;
  tasks: TodayDashboardTask[];
  onAddTask: () => void;
  onDone: (task: CareTask) => void;
};

export function TodayFeed({
  canEdit,
  errorMessage,
  isLoading,
  onAddTask,
  onDone,
  pendingTaskId,
  tasks,
}: TodayFeedProps) {
  return (
    <Card>
      <SectionHeader
        action={
          canEdit ? (
            <Button label="+ Görev" onPress={onAddTask} size="sm" variant="secondary" />
          ) : null
        }
        eyebrow="Bugün"
        title="Bakım"
      />

      {isLoading ? <LoadingState label="Görevler yükleniyor" /> : null}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage && tasks.length === 0 ? (
        <EmptyState
          icon="🧡"
          text={
            canEdit
              ? 'Pet detayından ilk görevi ekle.'
              : 'Görev eklendiğinde burada görünür.'
          }
          title="Akış boş."
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <View style={styles.taskList}>
          {tasks.map((item) => (
            <CareTaskRow
              canEdit={canEdit}
              isDone={item.isDone}
              isPending={pendingTaskId === item.task.id}
              key={item.task.id}
              lastEvent={item.lastEvent}
              onDone={onDone}
              statusLabel={item.statusLabel}
              task={item.task}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  taskList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
  },
});
