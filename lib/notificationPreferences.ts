import type { NotificationPreferences, ReminderType } from '../types/app';

export const notificationPreferenceKeys: ReminderType[] = [
  'vaccine',
  'internal_parasite',
  'external_parasite',
  'medicine',
  'vet',
  'other',
];

export const defaultNotificationPreferences: NotificationPreferences = {
  vaccine: true,
  internal_parasite: true,
  external_parasite: true,
  medicine: true,
  vet: true,
  other: false,
};

export const notificationPreferenceLabels: Record<ReminderType, {
  label: string;
  description: string;
}> = {
  vaccine: {
    label: 'Aşı',
    description: 'Aşı günlerini kaçırma.',
  },
  internal_parasite: {
    label: 'İç parazit',
    description: 'Düzenli parazit takibini hatırla.',
  },
  external_parasite: {
    label: 'Dış parazit',
    description: 'Dış parazit uygulamalarını takip et.',
  },
  medicine: {
    label: 'İlaç',
    description: 'İlaç saatlerini unutma.',
  },
  vet: {
    label: 'Veteriner',
    description: 'Randevu ve kontrol günleri.',
  },
  other: {
    label: 'Diğer',
    description: 'Diğer hatırlatmalar için bildirim al.',
  },
};

export function normalizeNotificationPreferences(value: unknown): NotificationPreferences {
  if (!value || typeof value !== 'object') {
    return defaultNotificationPreferences;
  }

  const data = value as Partial<Record<ReminderType, unknown>>;

  return notificationPreferenceKeys.reduce((preferences, key) => ({
    ...preferences,
    [key]: typeof data[key] === 'boolean'
      ? data[key]
      : defaultNotificationPreferences[key],
  }), {} as NotificationPreferences);
}
