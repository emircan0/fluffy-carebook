import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { useRegisterPushToken } from '../../lib/mutations/useRegisterPushToken';
import { useUpdateNotificationPreferences } from '../../lib/mutations/useUpdateNotificationPreferences';
import {
  notificationPreferenceKeys,
  notificationPreferenceLabels,
  normalizeNotificationPreferences,
} from '../../lib/notificationPreferences';
import { canUsePushNotifications, getNotificationPermissionStatus } from '../../lib/notifications';
import { colors, layout, radius, spacing, typography, fontWeight, shadows } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import type { NotificationPreferences, ReminderType } from '../../types/app';

export default function NotificationsSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuth();
  
  const registerPushTokenMutation = useRegisterPushToken();
  const updateNotificationPreferencesMutation = useUpdateNotificationPreferences();
  
  const [notificationStatus, setNotificationStatus] = useState<string>('undetermined');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);

  const notificationPreferences = useMemo(
    () => normalizeNotificationPreferences(profile?.notificationPreferences),
    [profile?.notificationPreferences],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadNotificationStatus() {
      const support = canUsePushNotifications();

      if (!support.canUse) {
        if (isMounted) {
          setNotificationStatus('unsupported');
          setNotificationMessage(support.reason);
        }
        return;
      }

      const status = await getNotificationPermissionStatus();

      if (isMounted) {
        setNotificationStatus(status);
        setNotificationMessage(null);
      }
    }

    void loadNotificationStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleEnableNotifications() {
    setNotificationMessage(null);

    try {
      const result = await registerPushTokenMutation.mutateAsync();
      setNotificationStatus(result.status);
      setNotificationMessage(result.message);
    } catch (error) {
      setNotificationStatus('error');
      setNotificationMessage(error instanceof Error ? error.message : t('settings.enableError'));
    }
  }

  async function handleToggleNotificationPreference(type: ReminderType, value: boolean) {
    setPreferenceMessage(null);

    const nextPreferences: NotificationPreferences = {
      ...notificationPreferences,
      [type]: value,
    };

    try {
      await updateNotificationPreferencesMutation.mutateAsync(nextPreferences);
      setPreferenceMessage(t('settings.preferencesUpdated'));
    } catch (error) {
      setPreferenceMessage(error instanceof Error ? error.message : t('settings.preferencesError'));
    }
  }

  const notificationCardState = useMemo(() => {
    if (registerPushTokenMutation.isPending) {
      return {
        label: t('settings.saving'),
        description: t('settings.savingDesc'),
        buttonLabel: t('settings.saving'),
        disabled: true,
      };
    }

    if (notificationStatus === 'registered') {
      return {
        label: t('settings.enabled'),
        description: notificationMessage ?? t('settings.enabledDesc'),
        buttonLabel: t('settings.enabled'),
        disabled: true,
      };
    }

    if (notificationStatus === 'granted') {
      return {
        label: t('settings.granted'),
        description: notificationMessage ?? t('settings.grantedDesc'),
        buttonLabel: t('settings.saveToken'),
        disabled: false,
      };
    }

    if (notificationStatus === 'unsupported') {
      return {
        label: t('settings.unsupported'),
        description: notificationMessage ?? t('settings.unsupportedDesc'),
        buttonLabel: t('settings.tryOnMobile'),
        disabled: true,
      };
    }

    if (notificationStatus === 'denied') {
      return {
        label: t('settings.denied'),
        description: notificationMessage ?? t('settings.deniedDesc'),
        buttonLabel: t('settings.tryAgain'),
        disabled: false,
      };
    }

    return {
      label: t('settings.notGranted'),
      description: notificationMessage ?? t('settings.notGrantedDesc'),
      buttonLabel: t('settings.enableNotifications'),
      disabled: false,
    };
  }, [notificationMessage, notificationStatus, registerPushTokenMutation.isPending, t]);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{t('settings.notificationsTitle')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationIcon}>
              <Feather name="bell" size={20} color={colors.accent} />
            </View>
            <View style={styles.notificationCopy}>
              <Text style={styles.notificationTitle}>{t('settings.notifications')}</Text>
              <Text style={styles.notificationDesc}>{notificationCardState.description}</Text>
              <Text style={styles.notificationStatus}>{notificationCardState.label}</Text>
            </View>
          </View>
          <Button
            disabled={notificationCardState.disabled}
            label={notificationCardState.buttonLabel}
            loading={registerPushTokenMutation.isPending}
            onPress={handleEnableNotifications}
            variant={notificationCardState.disabled ? 'ghost' : 'secondary'}
            style={styles.notificationButton}
          />
        </View>

        <View style={styles.preferencesCard}>
          <View style={styles.preferencesHeader}>
            <View style={styles.notificationIcon}>
              <Feather name="sliders" size={20} color={colors.accent} />
            </View>
            <View style={styles.notificationCopy}>
              <Text style={styles.notificationTitle}>{t('settings.preferences')}</Text>
              <Text style={styles.notificationDesc}>
                {t('settings.preferencesDesc')}
              </Text>
            </View>
          </View>

          {notificationStatus !== 'registered' && notificationStatus !== 'granted' ? (
            <View style={styles.preferenceWarning}>
              <Feather name="bell-off" size={15} color={colors.warning} />
              <Text style={styles.preferenceWarningText}>
                {t('settings.deviceWarning')}
              </Text>
            </View>
          ) : null}

          <View style={styles.preferenceList}>
            {notificationPreferenceKeys.map((type, index) => {
              const preference = notificationPreferenceLabels[type];
              const isEnabled = notificationPreferences[type];
              const isPending = updateNotificationPreferencesMutation.isPending;

              return (
                <View
                  key={type}
                  style={[
                    styles.preferenceRow,
                    index < notificationPreferenceKeys.length - 1 && styles.preferenceRowBorder,
                  ]}
                >
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceLabel}>{preference.label}</Text>
                    <Text style={styles.preferenceDescription}>{preference.description}</Text>
                  </View>
                  <Switch
                    disabled={isPending}
                    ios_backgroundColor={colors.surfaceBorder}
                    onValueChange={(value) => handleToggleNotificationPreference(type, value)}
                    thumbColor={colors.white}
                    trackColor={{
                      false: colors.surfaceBorder,
                      true: colors.accentSoft,
                    }}
                    value={isEnabled}
                  />
                </View>
              );
            })}
          </View>

          {preferenceMessage ? (
            <Text
              style={[
                styles.preferenceMessage,
                updateNotificationPreferencesMutation.isError && styles.preferenceMessageError,
              ]}
            >
              {preferenceMessage}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  topBarTitle: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPadding,
    gap: spacing.xl,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  notificationCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.black,
  },
  notificationDesc: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 19,
  },
  notificationStatus: {
    color: colors.accent,
    fontSize: typography.micro,
    fontWeight: fontWeight.black,
    textTransform: 'uppercase',
  },
  notificationButton: {
    flexShrink: 0,
  },
  preferencesCard: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.base,
    padding: spacing.lg,
    ...shadows.sm,
  },
  preferencesHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  preferenceWarning: {
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderColor: colors.warning + '24',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  preferenceWarningText: {
    color: colors.warning,
    flex: 1,
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
    lineHeight: 18,
  },
  preferenceList: {
    borderTopWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  preferenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 72,
    paddingVertical: spacing.md,
  },
  preferenceRowBorder: {
    borderBottomWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  preferenceText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  preferenceLabel: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.black,
  },
  preferenceDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  preferenceMessage: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  preferenceMessageError: {
    color: colors.danger,
  },
});
