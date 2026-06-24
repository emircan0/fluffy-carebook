import i18n from './i18n';
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

export const notificationPreferenceLabels = {
  get vaccine() {
    return {
      label: i18n.t('reminders.types.vaccine'),
      description: i18n.t('preferences.vaccineDesc'),
    };
  },
  get internal_parasite() {
    return {
      label: i18n.t('reminders.types.internal_parasite'),
      description: i18n.t('preferences.internalParasiteDesc'),
    };
  },
  get external_parasite() {
    return {
      label: i18n.t('reminders.types.external_parasite'),
      description: i18n.t('preferences.externalParasiteDesc'),
    };
  },
  get medicine() {
    return {
      label: i18n.t('reminders.types.medicine'),
      description: i18n.t('preferences.medicineDesc'),
    };
  },
  get vet() {
    return {
      label: i18n.t('reminders.types.vet'),
      description: i18n.t('preferences.vetDesc'),
    };
  },
  get other() {
    return {
      label: i18n.t('reminders.types.other'),
      description: i18n.t('preferences.otherDesc'),
    };
  },
} as Record<ReminderType, { label: string; description: string }>;

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
