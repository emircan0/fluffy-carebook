import { useQuery } from '@tanstack/react-query';

import { careEventLabels, careScheduleLabels, getOccurrenceKey, listCareEvents, listCareTasks } from '../care';
import { hasFirebaseConfig } from '../firebase';
import { getUpcomingReminders, listReminders } from '../reminders';
import type { CareEvent, CareTask, Reminder } from '../../types/app';

export type TodayDashboardTask = {
  task: CareTask;
  occurrenceKey: string | null;
  matchingEvents: CareEvent[];
  todayCount: number;
  isDone: boolean;
  lastEvent?: CareEvent;
  statusLabel: string;
  sortLabel: string;
};

export type TodayDashboard = {
  tasks: TodayDashboardTask[];
  recentEvents: CareEvent[];
  todayEvents: CareEvent[];
  upcomingReminders: Reminder[];
};

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function getTaskOccurrenceKey(task: CareTask, now: Date) {
  if (task.scheduleType === 'none') {
    return null;
  }

  return getOccurrenceKey(task.scheduleType, now);
}

function sortDashboardTasks(left: TodayDashboardTask, right: TodayDashboardTask) {
  const leftDueTime = left.task.dueTime ?? '99:99';
  const rightDueTime = right.task.dueTime ?? '99:99';

  if (leftDueTime !== rightDueTime) {
    return leftDueTime.localeCompare(rightDueTime);
  }

  return left.sortLabel.localeCompare(right.sortLabel);
}

export function buildTodayDashboard(
  tasks: CareTask[],
  events: CareEvent[],
  reminders: Reminder[] = [],
  now = new Date(),
) {
  const recentEvents = [...events].sort((left, right) => {
    const leftDate = toDate(left.doneAt)?.getTime() ?? 0;
    const rightDate = toDate(right.doneAt)?.getTime() ?? 0;

    return rightDate - leftDate;
  });
  const todayEvents = recentEvents.filter((event) => {
    const doneAt = toDate(event.doneAt);

    return doneAt ? isSameLocalDay(doneAt, now) : false;
  });
  const dashboardTasks = tasks
    .filter((task) => task.isActive && task.deletedAt === null)
    .map((task) => {
      const occurrenceKey = getTaskOccurrenceKey(task, now);
      const taskEvents = recentEvents.filter((event) => event.taskId === task.id);
      const matchingEvents = occurrenceKey
        ? taskEvents.filter((event) => event.occurrenceKey === occurrenceKey)
        : taskEvents;
      const todayTaskEvents = todayEvents.filter((event) => event.taskId === task.id);
      const todayCount = task.allowMultiplePerDay ? todayTaskEvents.length : matchingEvents.length;
      const lastEvent = taskEvents[0];
      const isDone = task.allowMultiplePerDay ? todayCount > 0 : matchingEvents.length > 0;
      const statusLabel = task.allowMultiplePerDay
        ? `Bugun ${todayCount} kez yapildi`
        : isDone
          ? 'Yapildi'
          : 'Bekliyor';

      return {
        task,
        occurrenceKey,
        matchingEvents,
        todayCount,
        isDone,
        lastEvent,
        statusLabel,
        sortLabel: `${careEventLabels[task.eventType]} ${careScheduleLabels[task.scheduleType]} ${task.title}`,
      };
    })
    .sort(sortDashboardTasks);

  return {
    tasks: dashboardTasks,
    recentEvents,
    todayEvents,
    upcomingReminders: getUpcomingReminders(reminders, now),
  } satisfies TodayDashboard;
}

export function useTodayDashboard(petId: string | undefined) {
  return useQuery({
    queryKey: ['todayDashboard', petId],
    enabled: Boolean(hasFirebaseConfig && petId),
    queryFn: async () => {
      const [tasks, events, reminders] = await Promise.all([
        listCareTasks(petId ?? ''),
        listCareEvents(petId ?? ''),
        listReminders(petId ?? ''),
      ]);

      return buildTodayDashboard(tasks, events, reminders);
    },
  });
}
