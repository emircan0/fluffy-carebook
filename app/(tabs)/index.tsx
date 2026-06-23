import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RecentCareEvents } from '../../components/care/RecentCareEvents';
import { TodayFeed } from '../../components/care/TodayFeed';
import { UpcomingList } from '../../components/care/UpcomingList';
import { formatCareEventTime } from '../../components/care/CareTaskRow';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { getCareErrorMessage } from '../../lib/care';
import { useCreateCareTask } from '../../lib/mutations/useCreateCareTask';
import { useMarkCareEvent } from '../../lib/mutations/useMarkCareEvent';
import { useToggleReminderComplete } from '../../lib/mutations/useToggleReminderComplete';
import { getPetErrorMessage } from '../../lib/pets';
import { usePet } from '../../lib/queries/usePet';
import { usePets } from '../../lib/queries/usePets';
import { useTodayDashboard } from '../../lib/queries/useTodayDashboard';
import { usePetRealtime } from '../../lib/realtime/usePetRealtime';
import {
  careEventColors,
  colors,
  fontWeight,
  layout,
  radius,
  shadows,
  spacing,
  speciesConfig,
  typography,
} from '../../lib/theme';
import { useAppStore } from '../../store/appStore';
import type { CareEventType, CareTask } from '../../types/app';

export default function HomeScreen() {
  const { t } = useTranslation();

  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    editor: t('roles.editor'),
    viewer: t('roles.viewer'),
  };



  const quickActions = [
    { type: 'food', label: t('careEvents.food'), icon: 'coffee', allowMultiplePerDay: true },
    { type: 'water', label: t('careEvents.water'), icon: 'droplet', allowMultiplePerDay: true },
    { type: 'litter', label: t('careEvents.litter'), icon: 'archive', allowMultiplePerDay: true },
    { type: 'medicine', label: t('careEvents.medicine'), icon: 'plus-circle', allowMultiplePerDay: false },
    { type: 'walk', label: t('careEvents.walk'), icon: 'navigation', allowMultiplePerDay: false },
  ] as const;


  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedPetId = useAppStore((s) => s.selectedPetId);
  const setSelectedPetId = useAppStore((s) => s.setSelectedPetId);
  const { profile, user } = useAuth();
  const petsQuery = usePets();
  const pets = useMemo(() => petsQuery.data ?? [], [petsQuery.data]);
  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null;
  const activePetId = selectedPet?.id;
  const petQuery = usePet(activePetId);
  const dashboardQuery = useTodayDashboard(activePetId);
  const markCareEventMutation = useMarkCareEvent(activePetId);
  const createCareTaskMutation = useCreateCareTask();
  const toggleReminderCompleteMutation = useToggleReminderComplete();

  const [careError, setCareError] = useState<string | null>(null);
  const [careNotice, setCareNotice] = useState<string | null>(null);
  const [pendingQuickAction, setPendingQuickAction] = useState<(typeof quickActions)[number] | null>(null);
  const [quickActionType, setQuickActionType] = useState<CareEventType | null>(null);

  const firstName = (profile?.fullName || profile?.email || user?.email || t('common.user'))
    .split(' ')[0];
  const memberRole = petQuery.data?.member?.role ?? null;
  const canEditCare = memberRole === 'owner' || memberRole === 'editor';

  const invalidateDashboard = useCallback(() => {
    if (!activePetId) return;
    void queryClient.invalidateQueries({ queryKey: ['todayDashboard', activePetId] });
  }, [activePetId, queryClient]);

  const invalidateMembers = useCallback(() => {
    if (!activePetId) return;
    void queryClient.invalidateQueries({ queryKey: ['pet', activePetId, user?.uid] });
    void queryClient.invalidateQueries({ queryKey: ['petMembers', activePetId] });
    void queryClient.invalidateQueries({ queryKey: ['pets', user?.uid] });
  }, [activePetId, queryClient, user?.uid]);

  const invalidateReminders = useCallback(() => {
    if (!activePetId) return;
    void queryClient.invalidateQueries({ queryKey: ['reminders', activePetId] });
    void queryClient.invalidateQueries({ queryKey: ['todayDashboard', activePetId] });
  }, [activePetId, queryClient]);

  const realtime = usePetRealtime({
    petId: activePetId,
    enabled: Boolean(activePetId && user?.uid),
    listenReminders: true,
    onCareTasksChanged: invalidateDashboard,
    onCareEventsChanged: invalidateDashboard,
    onMembersChanged: invalidateMembers,
    onRemindersChanged: invalidateReminders,
  });

  useEffect(() => {
    if (pets.length === 0) { if (selectedPetId) setSelectedPetId(null); return; }
    if (!selectedPetId || !pets.some((p) => p.id === selectedPetId)) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId, setSelectedPetId]);

  async function handleMarkDone(task: CareTask) {
    setCareError(null);
    setCareNotice(null);
    try { await markCareEventMutation.mutateAsync(task); }
    catch (error) { setCareError(getCareErrorMessage(error)); }
  }

  function buildQuickTask(action: (typeof quickActions)[number], taskId: string): CareTask {
    return {
      id: taskId,
      petId: activePetId ?? '',
      title: action.label,
      eventType: action.type,
      scheduleType: 'daily',
      dueTime: null,
      isActive: true,
      allowMultiplePerDay: action.allowMultiplePerDay,
      notifyEnabled: false,
      createdBy: user?.uid ?? '',
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
    };
  }

  function getQuickDashboardTask(eventType: CareEventType) {
    return dashboardQuery.data?.tasks.find(({ task }) => task.eventType === eventType) ?? null;
  }

  function getQuickEvents(eventType: CareEventType) {
    return (dashboardQuery.data?.todayEvents ?? []).filter((event) => event.eventType === eventType);
  }

  function getQuickStatus(action: (typeof quickActions)[number]) {
    const dashboardTask = getQuickDashboardTask(action.type);

    if (dashboardTask) {
      const lastEvent = dashboardTask.lastEvent;
      const todayCount = dashboardTask.todayCount;
      const statusLabel = dashboardTask.task.allowMultiplePerDay
        ? todayCount > 0
          ? `${todayCount} kez`
          : '—'
        : dashboardTask.isDone
          ? t('common.done')
          : 'Bekliyor';

      return {
        dashboardTask,
        lastEvent,
        statusLabel,
        isDone: dashboardTask.isDone,
        todayCount,
      };
    }

    const events = getQuickEvents(action.type);
    const lastEvent = events[0];

    return {
      dashboardTask: null,
      lastEvent,
      statusLabel: events.length > 0 ? `${events.length} kez` : '—',
      isDone: events.length > 0,
      todayCount: events.length,
    };
  }

  async function handleQuickLog(action: (typeof quickActions)[number]) {
    setCareError(null);
    setCareNotice(null);
    setPendingQuickAction(null);

    if (!activePetId) {
      setCareError(t('index.noPetSelected'));
      return;
    }

    if (!canEditCare) {
      setCareError(t('errors.editOnly'));
      return;
    }

    const dashboardTask = getQuickDashboardTask(action.type);

    if (!dashboardTask) {
      setPendingQuickAction(action);
      return;
    }

    setQuickActionType(action.type);

    try {
      await markCareEventMutation.mutateAsync(dashboardTask.task);
      setCareNotice(`${action.label} kaydedildi`);
    } catch (error) {
      setCareError(getCareErrorMessage(error));
    } finally {
      setQuickActionType(null);
    }
  }

  async function handleConfirmCreateQuickTask() {
    if (!pendingQuickAction || !activePetId) {
      setCareError(t('index.noPetSelected'));
      return;
    }

    setCareError(null);
    setCareNotice(null);
    setQuickActionType(pendingQuickAction.type);

    try {
      const existingTask = getQuickDashboardTask(pendingQuickAction.type);
      const task = existingTask?.task ?? buildQuickTask(
        pendingQuickAction,
        await createCareTaskMutation.mutateAsync({
          petId: activePetId,
          title: pendingQuickAction.label,
          eventType: pendingQuickAction.type,
          scheduleType: 'daily',
          dueTime: '',
          allowMultiplePerDay: pendingQuickAction.allowMultiplePerDay,
          notifyEnabled: false,
        }),
      );

      await markCareEventMutation.mutateAsync(task);
      setCareNotice(`${pendingQuickAction.label} kaydedildi`);
      setPendingQuickAction(null);
    } catch (error) {
      setCareError(getCareErrorMessage(error));
    } finally {
      setQuickActionType(null);
    }
  }

  async function handleToggleReminderComplete(reminder: any) {
    setCareError(null);
    setCareNotice(null);
    if (!activePetId) return;
    try {
      await toggleReminderCompleteMutation.mutateAsync({
        petId: activePetId,
        reminderId: reminder.id,
        isCompleted: !reminder.isCompleted,
      });
      setCareNotice(`${reminder.title} güncellendi`);
    } catch (error) {
      setCareError(getCareErrorMessage(error));
    }
  }

  const speciesCfg = selectedPet ? speciesConfig[selectedPet.species] : null;
  const tasksDone = dashboardQuery.data?.todayEvents.length ?? 0;
  const tasksTotal = dashboardQuery.data?.tasks.length ?? 0;
  const progress = tasksTotal > 0 ? Math.min(tasksDone / tasksTotal, 1) : 0;
  const progressLabel = tasksTotal > 0 ? `${tasksDone}/${tasksTotal}` : '0/0';

  const sortedTasks = useMemo(() => {
    const list = dashboardQuery.data?.tasks ?? [];
    return [...list].sort((a, b) => {
      if (a.isDone === b.isDone) return 0;
      return a.isDone ? 1 : -1;
    });
  }, [dashboardQuery.data?.tasks]);

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{t('index.today')}</Text>
            <Text style={styles.subGreeting}>
              {selectedPet
                ? `${firstName} · ${selectedPet.name}`
                : `Merhaba, ${firstName}`}
            </Text>
          </View>
        </View>

        {petsQuery.isLoading ? (
          <LoadingState label={t("index.loadingPets")} />
        ) : petsQuery.error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{getPetErrorMessage(petsQuery.error)}</Text>
          </View>
        ) : pets.length === 0 ? (
          <Card>
            <EmptyState
              icon="🐾"
              title={t("index.addFirstPetTitle")}
              text={t("index.addFirstPetDesc")}
              action={
                <Button
                  label="Kuruluma git"
                  onPress={() => router.push('/onboarding')}
                  size="sm"
                />
              }
            />
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petScroller}
          >
            {pets.map((pet) => {
              const isSelected = pet.id === selectedPetId;
              const cfg = speciesConfig[pet.species];
              return (
                <Pressable
                  accessibilityRole="button"
                  key={pet.id}
                  onPress={() => setSelectedPetId(pet.id)}
                  style={({ pressed }) => [
                    styles.petChip,
                    isSelected && styles.petChipSelected,
                    pressed && styles.petChipPressed,
                  ]}
                >
                  <View style={[styles.petChipAvatar, { backgroundColor: cfg.color + '20' }]}>
                    <Text style={styles.petChipEmoji}>{cfg.emoji}</Text>
                  </View>
                  <View>
                    <Text style={[styles.petChipName, isSelected && styles.petChipNameSelected]}>
                      {pet.name}
                    </Text>
                    <Text style={styles.petChipSpecies}>
                      {t(`species.${pet.species}`)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {selectedPet && speciesCfg ? (
          <Pressable
            onPress={() => router.push(`/pet/${selectedPet.id}`)}
            style={({ pressed }) => [styles.petHero, pressed && styles.pressed]}
          >
            <View style={styles.petHeroHeader}>
              <View style={[styles.petHeroAvatar, { backgroundColor: speciesCfg.color + '18' }]}>
                <Text style={styles.petHeroEmoji}>{speciesCfg.emoji}</Text>
              </View>
              <View style={styles.petHeroText}>
                <Text style={styles.petHeroName}>{selectedPet.name}</Text>
                <Text style={styles.petHeroRole}>
                  {memberRole ? roleLabels[memberRole] : t('common.member')}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textTertiary} />
            </View>

            <View style={styles.petHeroProgressSection}>
              <View style={styles.petHeroProgressHeader}>
                <Text style={styles.petHeroProgressTitle}>{t('index.todayProgress')}</Text>
                <Text style={styles.petHeroProgressPercentage}>
                  %{Math.round(progress * 100)} ({progressLabel})
                </Text>
              </View>
              <View style={styles.petHeroProgressTrack}>
                <View style={[styles.petHeroProgressFill, { width: `${progress * 100}%`, backgroundColor: speciesCfg.color }]} />
              </View>
            </View>
          </Pressable>
        ) : null}

        {selectedPet ? (
          <>
            {careError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{careError}</Text>
              </View>
            ) : null}

            {realtime.error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{realtime.error}</Text>
              </View>
            ) : null}

            {careNotice ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{careNotice}</Text>
              </View>
            ) : null}

            {pendingQuickAction ? (
              <View style={styles.confirmBox}>
                <View style={styles.confirmIcon}>
                  <Feather name={pendingQuickAction.icon} size={20} color={colors.accent} />
                </View>
                <View style={styles.confirmBody}>
                  <Text style={styles.confirmTitle}>
                    Bu bakım için görev oluşturulsun mu?
                  </Text>
                  <Text style={styles.confirmText}>
                    {pendingQuickAction.label} günlük görev olarak eklensin ve bugün kaydedilsin.
                  </Text>
                </View>
                <View style={styles.confirmActions}>
                  <Button
                    label={t("common.cancel")}
                    onPress={() => setPendingQuickAction(null)}
                    size="xs"
                    variant="ghost"
                  />
                  <Button
                    label={t("common.create")}
                    loading={quickActionType === pendingQuickAction.type}
                    onPress={handleConfirmCreateQuickTask}
                    size="xs"
                  />
                </View>
              </View>
            ) : null}



            {/* ── Günlük Bakım Görevleri ── */}
            <TodayFeed
              canEdit={canEditCare}
              errorMessage={careError || (dashboardQuery.error ? getCareErrorMessage(dashboardQuery.error) : null)}
              isLoading={dashboardQuery.isLoading || petQuery.isLoading}
              onAddTask={() => router.push(`/pet/${selectedPet.id}`)}
              onDone={handleMarkDone}
              pendingTaskId={markCareEventMutation.variables?.id ?? null}
              tasks={sortedTasks}
            />

            {/* ── Yaklaşan Hatırlatıcılar (Aşı, parazit vb.) ── */}
            {dashboardQuery.data?.upcomingReminders && dashboardQuery.data.upcomingReminders.length > 0 ? (
              <UpcomingList
                canEdit={canEditCare}
                reminders={dashboardQuery.data.upcomingReminders}
                onToggleComplete={handleToggleReminderComplete}
                isToggling={toggleReminderCompleteMutation.isPending}
              />
            ) : null}

            {/* ── Son Bakım Hareketleri (Family Activity) ── */}
            <RecentCareEvents events={dashboardQuery.data?.todayEvents ?? []} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingTop: 64,
    paddingBottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
    padding: layout.screenPadding,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: layout.maxWidth,
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
  },
  subGreeting: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
  },

  // Pet Scroller
  petScroller: {
    gap: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 112,
    ...shadows.sm,
  },
  petChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSofter,
    ...shadows.accent,
  },
  petChipPressed: {
    opacity: 0.75,
  },
  petChipAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petChipEmoji: {
    fontSize: 18,
  },
  petChipName: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  petChipNameSelected: {
    color: colors.accent,
  },
  petChipSpecies: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },

  // New Pet Hero Card
  petHero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.md,
  },
  petHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petHeroAvatar: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  petHeroEmoji: {
    fontSize: 28,
  },
  petHeroText: {
    flex: 1,
    gap: 2,
  },
  petHeroName: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
  },
  petHeroRole: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  petHeroProgressSection: {
    gap: spacing.xs,
  },
  petHeroProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petHeroProgressTitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  petHeroProgressPercentage: {
    color: colors.accentDark,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
  },
  petHeroProgressTrack: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    height: 10,
    width: '100%',
    overflow: 'hidden',
  },
  petHeroProgressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },

  // Section Header inside card
  quickHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
    marginBottom: 2,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
  },
  confirmBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSofter,
    borderColor: colors.accent + '30',
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  confirmIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  confirmBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  confirmTitle: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
  },
  confirmText: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    fontWeight: fontWeight.medium,
    lineHeight: 16,
  },
  confirmActions: {
    gap: spacing.xs,
  },

  // New Quick Actions Card Style
  quickCard: {
    padding: spacing.lg,
  },
  quickHorizontalScroller: {
    gap: spacing.md,
    paddingVertical: 2,
  },
  quickCircleBtn: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    width: 86,
    height: 114,
    gap: spacing.xs,
    justifyContent: 'center',
    ...shadows.sm,
  },
  quickCircleBtnDone: {
    backgroundColor: colors.successBg,
    borderColor: colors.success + '20',
  },
  quickCirclePressed: {
    opacity: 0.78,
  },
  quickCircleDisabled: {
    opacity: 0.56,
  },
  quickCircleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCircleLabel: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
    textAlign: 'center',
  },
  quickCircleLabelDone: {
    color: colors.success,
  },
  quickCircleStatus: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  // Utility
  pressed: {
    opacity: 0.82,
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
  successBox: {
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.success + '30',
    padding: spacing.md,
  },
  successText: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
});
