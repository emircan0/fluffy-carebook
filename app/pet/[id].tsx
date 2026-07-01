import { useCallback, useMemo, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View, Share, Platform, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SafeDateTimePicker as DateTimePicker } from '../../components/ui/SafeDateTimePicker';

import { CareTaskRow, formatCareEventTime } from '../../components/care/CareTaskRow';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { careEventLabels, getCareErrorMessage } from '../../lib/care';
import { getInviteErrorMessage } from '../../lib/invites';
import { useCreateCareTask } from '../../lib/mutations/useCreateCareTask';
import { useCreateInvite } from '../../lib/mutations/useCreateInvite';
import { useMarkCareEvent } from '../../lib/mutations/useMarkCareEvent';
import { getPetErrorMessage } from '../../lib/pets';
import { useCareEvents } from '../../lib/queries/useCareEvents';
import { useCareTasks } from '../../lib/queries/useCareTasks';
import { usePet } from '../../lib/queries/usePet';
import { usePetMembers } from '../../lib/queries/usePetMembers';
import { usePetRealtime } from '../../lib/realtime/usePetRealtime';
import { useMeasurements } from '../../lib/queries/useMeasurements';
import { useCreateMeasurement } from '../../lib/mutations/useCreateMeasurement';
import { useRemoveMember } from '../../lib/mutations/useRemoveMember';
import { careEventEmoji, colors, layout, petSpeciesEmoji, radius, spacing, fontWeight, typography, shadows } from '../../lib/theme';
import { useAuthStore } from '../../store/authStore';
import type { CareEvent, CareEventType, CareScheduleType, CareTask, PetRole } from '../../types/app';

const roleBadgeVariants: Record<PetRole, 'roleOwner' | 'roleEditor' | 'roleViewer'> = {
  owner: 'roleOwner',
  editor: 'roleEditor',
  viewer: 'roleViewer',
};

function getPetAge(birthDateString: string | null | undefined, t: any): string {
  if (!birthDateString) return t('pet.ageUnknown');
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return t('pet.ageUnknown');

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  
  if (months < 0) {
    months += 12;
  }

  if (years > 0) {
    if (months > 0) {
      return `${years} ${t('pet.years')} ${months} ${t('pet.months')}`;
    }
    return `${years} ${t('pet.yearsOld')}`;
  }
  
  if (months > 0) {
    return `${months} ${t('pet.monthsOld')}`;
  }
  
  const diffTime = Math.abs(today.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} ${t('pet.daysOld')}`;
}

function formatMeasurementDate(dateVal: any, includeYear = true): string {
  if (!dateVal) return '';
  let date: Date;
  if (dateVal && typeof dateVal === 'object' && 'seconds' in dateVal) {
    date = new Date((dateVal as any).seconds * 1000);
  } else if (dateVal && typeof dateVal === 'object' && 'toDate' in dateVal) {
    date = (dateVal as any).toDate();
  } else {
    date = new Date(dateVal as any);
  }
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: includeYear ? 'numeric' : undefined,
  });
}

export default function PetDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const petId = params.id;
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const petQuery = usePet(petId);
  const membersQuery = usePetMembers(petId);
  const careTasksQuery = useCareTasks(petId);
  const careEventsQuery = useCareEvents(petId);
  const createInviteMutation = useCreateInvite();
  const createCareTaskMutation = useCreateCareTask();
  const markCareEventMutation = useMarkCareEvent(petId);
  const [inviteRole, setInviteRole] = useState<Extract<PetRole, 'editor' | 'viewer'>>('editor');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskEventType, setTaskEventType] = useState<CareEventType>('food');
  const [taskScheduleType, setTaskScheduleType] = useState<CareScheduleType>('none');
  const [taskDueTime, setTaskDueTime] = useState('');
  const [allowMultiplePerDay, setAllowMultiplePerDay] = useState(false);
  const [careError, setCareError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [eventRange, setEventRange] = useState<'today' | 'week' | 'month'>('today');

  // Measurements logic
  const measurementsQuery = useMeasurements(petId ?? null);
  const createMeasurementMutation = useCreateMeasurement();
  const removeMemberMutation = useRemoveMember(petId);
  const measurements = measurementsQuery.data ?? [];

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date());
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);
  const [showMeasurementDatePicker, setShowMeasurementDatePicker] = useState(false);

  const lastMeasurement = measurements[0] ?? null;
  const previousMeasurement = measurements[1] ?? null;

  // Encouragement banner check
  const showEncouragement = useMemo(() => {
    if (!lastMeasurement) return true;
    const lastDateVal = lastMeasurement.date;
    let lastDate: Date;
    if (lastDateVal && typeof lastDateVal === 'object' && 'seconds' in lastDateVal) {
      lastDate = new Date((lastDateVal as any).seconds * 1000);
    } else if (lastDateVal && typeof lastDateVal === 'object' && 'toDate' in lastDateVal) {
      lastDate = (lastDateVal as any).toDate();
    } else {
      lastDate = new Date(lastDateVal as any);
    }
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  }, [lastMeasurement]);

  const daysSinceLastUpdate = useMemo(() => {
    if (!lastMeasurement) return null;
    const lastDateVal = lastMeasurement.date;
    let lastDate: Date;
    if (lastDateVal && typeof lastDateVal === 'object' && 'seconds' in lastDateVal) {
      lastDate = new Date((lastDateVal as any).seconds * 1000);
    } else if (lastDateVal && typeof lastDateVal === 'object' && 'toDate' in lastDateVal) {
      lastDate = (lastDateVal as any).toDate();
    } else {
      lastDate = new Date(lastDateVal as any);
    }
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [lastMeasurement]);

  // Trends calculation
  const weightTrend = useMemo(() => {
    if (!lastMeasurement || !previousMeasurement) return null;
    return lastMeasurement.weight - previousMeasurement.weight;
  }, [lastMeasurement, previousMeasurement]);

  const heightTrend = useMemo(() => {
    if (!lastMeasurement || !previousMeasurement || !lastMeasurement.height || !previousMeasurement.height) return null;
    return lastMeasurement.height - previousMeasurement.height;
  }, [lastMeasurement, previousMeasurement]);

  const pet = petQuery.data?.pet;
  const currentMember = petQuery.data?.member;
  const isOwner = currentMember?.role === 'owner';
  const canEditCare = currentMember?.role === 'owner' || currentMember?.role === 'editor';
  const members = membersQuery.data ?? [];
  const careTasks = careTasksQuery.data ?? [];
  const careEvents = careEventsQuery.data ?? [];

  const getMemberDisplayName = useCallback((member: typeof members[0]) => {
    if (member.userId === user?.uid) {
      const authProfile = useAuthStore.getState().profile;
      return authProfile?.fullName ? `${authProfile.fullName} (${t('common.me')})` : t('common.me');
    }
    if (member.fullName) return member.fullName;
    if (member.email) return member.email;
    return `${t('care.user')} (${member.userId.substring(0, 6)})`;
  }, [user?.uid, t]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const getEventDate = (event: CareEvent) => {
      if (event.doneAt && typeof event.doneAt === 'object' && 'seconds' in event.doneAt) {
        return new Date((event.doneAt as any).seconds * 1000);
      }
      if (event.doneAt && typeof event.doneAt === 'object' && 'toDate' in event.doneAt) {
        return (event.doneAt as any).toDate();
      }
      return new Date(event.doneAt as any);
    };

    return careEvents.filter(event => {
      const d = getEventDate(event);
      if (eventRange === 'today') {
        return d >= startOfToday;
      } else if (eventRange === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= oneWeekAgo;
      } else {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return d >= oneMonthAgo;
      }
    });
  }, [careEvents, eventRange]);

  const eventStats = useMemo(() => {
    const stats: Record<CareEventType, number> = {
      food: 0,
      water: 0,
      walk: 0,
      medicine: 0,
      litter: 0,
      bath: 0,
      grooming: 0,
      play: 0,
      training: 0,
      teeth: 0,
      other: 0,
    };
    filteredEvents.forEach(event => {
      if (event.eventType in stats) {
        stats[event.eventType] = (stats[event.eventType] || 0) + 1;
      }
    });
    return Object.entries(stats).filter(([_, count]) => count > 0) as Array<[CareEventType, number]>;
  }, [filteredEvents]);

  const invalidatePet = useCallback(() => {
    if (!petId) return;
    void queryClient.invalidateQueries({ queryKey: ['pet', petId, user?.uid] });
    void queryClient.invalidateQueries({ queryKey: ['pets', user?.uid] });
  }, [petId, queryClient, user?.uid]);

  const invalidateMembers = useCallback(() => {
    if (!petId) return;
    void queryClient.invalidateQueries({ queryKey: ['petMembers', petId] });
    void queryClient.invalidateQueries({ queryKey: ['pet', petId, user?.uid] });
    void queryClient.invalidateQueries({ queryKey: ['pets', user?.uid] });
  }, [petId, queryClient, user?.uid]);

  const invalidateCareTasks = useCallback(() => {
    if (!petId) return;
    void queryClient.invalidateQueries({ queryKey: ['careTasks', petId] });
    void queryClient.invalidateQueries({ queryKey: ['todayDashboard', petId] });
  }, [petId, queryClient]);

  const invalidateCareEvents = useCallback(() => {
    if (!petId) return;
    void queryClient.invalidateQueries({ queryKey: ['careEvents', petId] });
    void queryClient.invalidateQueries({ queryKey: ['todayDashboard', petId] });
  }, [petId, queryClient]);

  const realtime = usePetRealtime({
    petId,
    enabled: Boolean(petId && user?.uid),
    listenPet: true,
    onPetChanged: invalidatePet,
    onMembersChanged: invalidateMembers,
    onCareTasksChanged: invalidateCareTasks,
    onCareEventsChanged: invalidateCareEvents,
  });

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'active'),
    [members],
  );

  const lastEventByTaskId = useMemo(() => {
    const map = new Map<string, CareEvent>();
    careEvents.forEach((event) => {
      if (!map.has(event.taskId)) {
        map.set(event.taskId, event);
      }
    });
    return map;
  }, [careEvents]);

  async function handleCreateInvite() {
    if (!pet) return;
    setInviteError(null);
    setCopyStatus(null);
    try {
      const invite = await createInviteMutation.mutateAsync({
        petId: pet.id,
        role: inviteRole,
        invitedByName: null,
      });
      setInviteLink(invite.token);
    } catch (error) {
      setInviteError(getInviteErrorMessage(error));
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopyStatus(t('invite.copySuccess'));
  }

  async function handleShareInvite() {
    if (!inviteLink || !pet) return;
    try {
      const code = inviteLink;
      const roleText = inviteRole === 'editor' ? t('roles.editor') : t('roles.viewer');
      const shareMessage = t('invite.shareMessage', { petName: pet.name, role: roleText, code: code });
      
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error(t('invite.shareError'), error);
    }
  }

  async function handleCreateCareTask() {
    if (!pet || !taskTitle.trim()) {
      setCareError(t('care.missingTaskTitle'));
      return;
    }
    setCareError(null);
    try {
      await createCareTaskMutation.mutateAsync({
        petId: pet.id,
        title: taskTitle,
        eventType: taskEventType,
        scheduleType: taskScheduleType,
        dueTime: taskDueTime,
        allowMultiplePerDay,
        notifyEnabled: false,
      });
      setTaskTitle('');
      setTaskEventType('food');
      setTaskScheduleType('none');
      setTaskDueTime('');
      setAllowMultiplePerDay(false);
      setIsAddTaskOpen(false);
    } catch (error) {
      setCareError(getCareErrorMessage(error));
    }
  }

  async function handleMarkDone(task: CareTask) {
    setCareError(null);
    try {
      await markCareEventMutation.mutateAsync(task);
    } catch (error) {
      setCareError(getCareErrorMessage(error));
    }
  }

  async function handleCreateMeasurement() {
    if (!petId) return;
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setMeasurementError(t('pet.invalidWeight'));
      return;
    }
    const heightNum = height ? parseFloat(height) : null;
    if (height && (isNaN(heightNum!) || heightNum! <= 0)) {
      setMeasurementError(t('pet.invalidHeight'));
      return;
    }

    setMeasurementError(null);
    try {
      await createMeasurementMutation.mutateAsync({
        petId,
        weight: weightNum,
        height: heightNum,
        date: measurementDate,
        notes: measurementNotes.trim() || undefined,
      });
      setWeight('');
      setHeight('');
      setMeasurementNotes('');
      setMeasurementDate(new Date());
      setIsAddMeasurementOpen(false);
    } catch (err: any) {
      setMeasurementError(err.message || t('pet.addMeasurementError'));
    }
  }

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.screen, 
        { paddingTop: Math.max(insets.top + spacing.sm, 20) }
      ]} 
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: pet?.name ?? t('pet.details') }} />
      
      <View style={styles.topBar}>
        <Pressable 
          onPress={() => router.back()} 
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{pet?.name ?? t('pet.details')}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.container}>
        {petQuery.isLoading ? <LoadingState label={t('pet.loading')} /> : null}

        {petQuery.error ? (
          <Card style={styles.card}>
            <Text style={styles.error}>{getPetErrorMessage(petQuery.error) || t('pet.loadError')}</Text>
          </Card>
        ) : null}

        {pet ? (
          <Card style={styles.petHero}>
            <View style={styles.petHeader}>
              <View style={[styles.petAvatar, { backgroundColor: colors.accent + '15' }]}>
                <Text style={styles.petAvatarText}>{petSpeciesEmoji[pet.species]}</Text>
              </View>
              <View style={styles.petCopy}>
                <Text style={styles.eyebrow}>{t('pet.profile')}</Text>
                <Text style={styles.title}>{pet.name}</Text>
                <View style={styles.badgeRow}>
                  {currentMember ? (
                    <Badge label={t(`roles.${currentMember.role}`)} variant={roleBadgeVariants[currentMember.role]} />
                  ) : null}
                </View>
              </View>
            </View>
            {realtime.error ? <Text style={styles.error}>{realtime.error}</Text> : null}
            <View style={styles.petStatsRow}>
              {pet.breed ? <Text style={styles.description}>{t('pet.breed')}: {pet.breed}</Text> : null}
              <Text style={styles.description}>{t('pet.age')}: {getPetAge(pet.birthDate, t)}</Text>
            </View>
            {pet.notes ? <Text style={styles.description}>{t('pet.notes')}: {pet.notes}</Text> : null}
          </Card>
        ) : null}

        {/* ── Gelişim Takibi ── */}
        <Card style={styles.card}>
          <SectionHeader
            action={
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAddMeasurementOpen(true)}
                style={({ pressed }) => [
                  styles.formToggleBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="plus" size={18} color={colors.accentDark} />
                <Text style={styles.formToggleBtnText}>{t('pet.addMeasurement')}</Text>
              </Pressable>
            }
            subtitle={t('pet.measurementSubtitle')}
            title={t('pet.measurementTitle')}
          />

          {/* Teşvik / Uyarı Bildirimi */}
          {showEncouragement && (
            <View style={styles.encouragementBanner}>
              <Feather name="alert-circle" size={20} color={colors.accentDark} style={styles.encouragementIcon} />
              <Text style={styles.encouragementText}>
                {lastMeasurement
                  ? t('pet.encouragementUpdated', { petName: pet?.name ?? t('invite.pet'), days: daysSinceLastUpdate })
                  : t('pet.encouragementNew', { petName: pet?.name ?? t('invite.pet') })}
              </Text>
            </View>
          )}

          {/* Ölçüm İstatistikleri */}
          <View style={styles.measurementStatsRow}>
            <View style={styles.measurementStatCard}>
              <Text style={styles.measurementStatLabel}>{t('pet.weight')}</Text>
              <Text style={styles.measurementStatValue}>
                {lastMeasurement ? `${lastMeasurement.weight} kg` : '—'}
              </Text>
              {weightTrend !== null && (
                <View style={[
                  styles.trendBadge,
                  weightTrend > 0 ? styles.trendBadgeUp : weightTrend < 0 ? styles.trendBadgeDown : styles.trendBadgeNeutral
                ]}>
                  <Text style={[
                    styles.trendBadgeText,
                    weightTrend > 0 ? styles.trendTextUp : weightTrend < 0 ? styles.trendTextDown : styles.trendTextNeutral
                  ]}>
                    {weightTrend > 0 ? `+${weightTrend.toFixed(2)}` : `${weightTrend.toFixed(2)}`} kg
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.measurementStatCard}>
              <Text style={styles.measurementStatLabel}>{t('pet.height')}</Text>
              <Text style={styles.measurementStatValue}>
                {lastMeasurement?.height ? `${lastMeasurement.height} cm` : '—'}
              </Text>
              {heightTrend !== null && (
                <View style={[
                  styles.trendBadge,
                  heightTrend > 0 ? styles.trendBadgeUp : heightTrend < 0 ? styles.trendBadgeDown : styles.trendBadgeNeutral
                ]}>
                  <Text style={[
                    styles.trendBadgeText,
                    heightTrend > 0 ? styles.trendTextUp : heightTrend < 0 ? styles.trendTextDown : styles.trendTextNeutral
                  ]}>
                    {heightTrend > 0 ? `+${heightTrend.toFixed(1)}` : `${heightTrend.toFixed(1)}`} cm
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Son 3 Ölçüm Zaman Tüneli */}
          {measurements.length > 0 ? (
            <View style={styles.timelineContainer}>
              <Text style={styles.timelineTitle}>{t('pet.recentMeasurements')}</Text>
              {measurements.slice(0, 3).map((item, idx) => (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={styles.timelineIndicator}>
                    <View style={styles.timelineDot} />
                    {idx < Math.min(measurements.length, 3) - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeaderRow}>
                      <Text style={styles.timelineDate}>{formatMeasurementDate(item.date)}</Text>
                      <Text style={styles.timelineValues}>
                        {item.weight} kg{item.height ? ` · ${item.height} cm` : ''}
                      </Text>
                    </View>
                    {item.notes ? <Text style={styles.timelineNotes}>{item.notes}</Text> : null}
                  </View>
                </View>
              ))}
              
              {measurements.length > 3 && (
                <Button
                  label={t('pet.seeAllHistory')}
                  variant="ghost"
                  size="sm"
                  onPress={() => setIsHistoryOpen(true)}
                  style={styles.allHistoryBtn}
                />
              )}
            </View>
          ) : (
            <EmptyState
              icon="⚖️"
              text={t('pet.noMeasurementDesc')}
              title={t('pet.noMeasurement')}
            />
          )}
        </Card>

        {/* ── Üyeler ── */}
        <Card style={styles.card}>
          <SectionHeader subtitle={t('pet.membersSubtitle', { activeCount: activeMembers.length })} title={t('pet.members')} />
          {membersQuery.isLoading ? <LoadingState label={t('pet.membersLoading')} /> : null}
          {members.length === 0 && !membersQuery.isLoading ? (
            <EmptyState text={t('pet.membersEmptyDesc')} title={t('pet.membersEmptyTitle')} />
          ) : null}
          <View style={styles.memberList}>
            {members.map((member) => (
              <View key={member.userId} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{getMemberDisplayName(member)}</Text>
                  <Text style={styles.muted}>
                    {member.status === 'active' ? t('inviteStatus.active') : t('inviteStatus.invited')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge label={t(`roles.${member.role}`)} variant={roleBadgeVariants[member.role]} />
                  {isOwner && member.role !== 'owner' && member.userId !== user?.uid ? (
                    <Button 
                      label="Sil" 
                      variant="danger" 
                      size="sm" 
                      style={{ paddingHorizontal: 8, paddingVertical: 4, height: 'auto' }}
                      onPress={() => removeMemberMutation.mutate(member.userId)}
                      loading={removeMemberMutation.isPending && removeMemberMutation.variables === member.userId}
                    />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* ── Bakım Görevleri ── */}
        <Card style={styles.card}>
          <SectionHeader
            action={
              canEditCare ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsAddTaskOpen(!isAddTaskOpen)}
                  style={({ pressed }) => [
                    styles.formToggleBtn,
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather name={isAddTaskOpen ? 'chevron-up' : 'plus'} size={18} color={colors.accentDark} />
                  <Text style={styles.formToggleBtnText}>
                    {isAddTaskOpen ? t('common.close') : t('care.addTask')}
                  </Text>
                </Pressable>
              ) : null
            }
            subtitle={canEditCare ? t('care.tasksSubtitleEdit') : t('care.tasksSubtitleRead')}
            title={t('care.tasksTitle')}
          />

          {canEditCare && isAddTaskOpen ? (
            <View style={styles.taskForm}>
              <Input
                editable={!createCareTaskMutation.isPending}
                label={t('care.taskName')}
                onChangeText={setTaskTitle}
                placeholder={t('care.taskNamePlaceholder')}
                value={taskTitle}
              />

              <View style={styles.field}>
                <Text style={styles.label}>{t('care.taskType')}</Text>
                <View style={styles.optionGrid}>
                  {(['food', 'medicine', 'litter', 'water', 'walk', 'bath', 'grooming', 'play', 'training', 'teeth', 'other'] as CareEventType[]).map((val) => (
                    <Pressable
                      accessibilityRole="button"
                      key={val}
                      onPress={() => setTaskEventType(val)}
                      style={[styles.option, taskEventType === val && styles.optionSelected]}
                    >
                      <Text style={[styles.optionText, taskEventType === val && styles.optionTextSelected]}>
                        {careEventEmoji[val]} {t(`careEvent.${val}`)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('care.repeat')}</Text>
                <View style={styles.optionGrid}>
                  {(['none', 'daily', 'weekly', 'monthly'] as CareScheduleType[]).map((val) => (
                    <Pressable
                      accessibilityRole="button"
                      key={val}
                      onPress={() => setTaskScheduleType(val)}
                      style={[styles.option, taskScheduleType === val && styles.optionSelected]}
                    >
                      <Text style={[styles.optionText, taskScheduleType === val && styles.optionTextSelected]}>
                        {t(`careSchedule.${val}`)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Input
                editable={!createCareTaskMutation.isPending}
                label="Saat (İsteğe bağlı)"
                onChangeText={setTaskDueTime}
                placeholder="Örn: 08:30"
                value={taskDueTime}
              />

              <Pressable
                accessibilityRole="button"
                onPress={() => setAllowMultiplePerDay((current) => !current)}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkbox, allowMultiplePerDay && styles.checkboxSelected]}>
                  {allowMultiplePerDay ? <Feather name="check" size={14} color={colors.textInverse} /> : null}
                </View>
                <Text style={styles.checkboxLabel}>Günde birden fazla kez tamamlanabilir</Text>
              </Pressable>

              <Button
                disabled={!taskTitle.trim() || createCareTaskMutation.isPending}
                label="Görev Oluştur"
                loading={createCareTaskMutation.isPending}
                onPress={handleCreateCareTask}
              />
            </View>
          ) : null}

          {careError ? <Text style={styles.error}>{careError}</Text> : null}
          {careTasksQuery.isLoading ? <LoadingState label="Görevler yükleniyor..." /> : null}
          {!careTasksQuery.isLoading && careTasks.length === 0 ? (
            <EmptyState
              icon="🧡"
              text="Günlük besleme, gezdirme gibi rutinler ekleyerek ekibinizle paylaşın."
              title="Henüz rutin yok."
            />
          ) : null}

          <View style={styles.taskList}>
            {(['daily', 'weekly', 'monthly', 'none'] as CareScheduleType[]).map((schedule) => {
              const tasksInSchedule = careTasks.filter((t) => t.scheduleType === schedule);
              if (tasksInSchedule.length === 0) return null;
              
              return (
                <View key={schedule} style={styles.taskGroup}>
                  <Text style={styles.taskGroupTitle}>{t(`careSchedule.${schedule}`)}</Text>
                  {tasksInSchedule.map((task) => (
                    <CareTaskRow
                      canEdit={canEditCare}
                      isPending={markCareEventMutation.isPending}
                      key={task.id}
                      lastEvent={lastEventByTaskId.get(task.id)}
                      onDone={handleMarkDone}
                      task={task}
                    />
                  ))}
                </View>
              );
            })}
          </View>
        </Card>

        {/* ── Son Hareketler ── */}
        <Card style={styles.card}>
          <SectionHeader subtitle={t('pet.recentCareEventsSubtitle')} title={t('pet.recentCareEvents')} />
          
          <View style={styles.rangeSelector}>
            {(['today', 'week', 'month'] as const).map((range) => {
              const labelMap = { today: t('pet.today'), week: t('pet.thisWeek'), month: t('pet.thisMonth') };
              return (
                <Pressable
                  accessibilityRole="button"
                  key={range}
                  onPress={() => setEventRange(range)}
                  style={[styles.rangeOption, eventRange === range && styles.rangeOptionSelected]}
                >
                  <Text style={[styles.rangeOptionText, eventRange === range && styles.rangeOptionTextSelected]}>
                    {labelMap[range]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {eventStats.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScroller}
            >
              {eventStats.map(([type, count]) => (
                <View key={type} style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: colors.accentSoft }]}>
                    <Text style={styles.statEmoji}>{careEventEmoji[type]}</Text>
                  </View>
                  <Text style={styles.statCount}>{count} {t('pet.times')}</Text>
                  <Text style={styles.statLabel}>{careEventLabels[type]}</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          {careEventsQuery.isLoading ? <LoadingState label={t('pet.loadingEvents')} /> : null}
          {!careEventsQuery.isLoading && filteredEvents.length === 0 ? (
            <EmptyState icon="🌤️" text={t('pet.noEventsDesc')} title={t('pet.noEventsTitle')} />
          ) : null}
          <View style={styles.eventList}>
            {filteredEvents.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.eventIconBox}>
                  <Text style={styles.eventIcon}>{careEventEmoji[event.eventType]}</Text>
                </View>
                <View style={styles.eventCopy}>
                  <Text style={styles.eventMemberName}>
                    {t('pet.userDidTask', { userName: event.userName || t('common.user'), taskName: careEventLabels[event.eventType] })}
                  </Text>
                  <Text style={styles.muted}>
                    {['Mama', 'Su', 'Yürüyüş', 'Kum', 'Banyo', 'İlaç', 'Tüy/Tarama', 'Diğer', 'Food', 'Water', 'Walk', 'Litter', 'Bath', 'Medicine', 'Grooming', 'Other'].includes(event.taskTitle) ? t(`careEvent.${event.eventType}`) : event.taskTitle} · {formatCareEventTime(event.doneAt, t)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* ── Davet Oluştur ── */}
        {isOwner ? (
          <Card style={styles.card}>
            <SectionHeader subtitle={t('invite.inviteSubtitle')} title={t('invite.inviteTitle')} />
            <View style={styles.roleSelector}>
              {(['editor', 'viewer'] as const).map((role) => (
                <Pressable
                  accessibilityRole="button"
                  key={role}
                  onPress={() => setInviteRole(role)}
                  style={[styles.roleOption, inviteRole === role && styles.roleOptionSelected]}
                >
                  <Text style={[styles.roleOptionText, inviteRole === role && styles.roleOptionTextSelected]}>
                    {t(`roles.${role}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {inviteError ? <Text style={styles.error}>{inviteError}</Text> : null}
            <Button
              label={t('invite.createLink')}
              loading={createInviteMutation.isPending}
              onPress={handleCreateInvite}
              variant="secondary"
            />
            {inviteLink && pet ? (
              <View style={styles.carebookPassCard}>
                {/* Ticket Top */}
                <View style={styles.ticketTop}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketBrand}>🎟️ CAREBOOK PASS</Text>
                    <Badge 
                      label={t(`roles.${inviteRole}`)} 
                      variant={roleBadgeVariants[inviteRole]} 
                    />
                  </View>
                  <Text style={styles.ticketTitle}>{t('invite.ticketTitle', { petName: pet.name })}</Text>
                  <Text style={styles.ticketSubtitle}>{t('invite.ticketSubtitle')}</Text>
                </View>

                {/* Ticket Divider Line with notches at sides */}
                <View style={styles.ticketDividerRow}>
                  <View style={[styles.ticketNotch, styles.notchLeft]} />
                  <View style={styles.ticketDashedLine} />
                  <View style={[styles.ticketNotch, styles.notchRight]} />
                </View>

                {/* Ticket Bottom */}
                <View style={styles.ticketBottom}>
                  <Text style={styles.ticketCodeLabel}>Davet Kodu (Tek Kullanımlık)</Text>
                  <Text style={styles.ticketCode} numberOfLines={1}>
                    {inviteLink}
                  </Text>
                  <Text style={styles.ticketExpiry}>{t('invite.ticketExpiry')}</Text>
                  
                  <View style={styles.ticketActions}>
                    <Button 
                      label={t('common.copy')} 
                      onPress={handleCopyInviteLink} 
                      variant="ghost" 
                      size="sm"
                      style={styles.ticketActionBtn} 
                    />
                    <Button 
                      label={t('common.share')} 
                      onPress={handleShareInvite} 
                      variant="primary" 
                      size="sm"
                      style={styles.ticketActionBtn} 
                    />
                  </View>
                  {copyStatus ? <Text style={styles.success}>{copyStatus}</Text> : null}
                </View>
              </View>
            ) : null}
          </Card>
        ) : null}
      </View>

      {/* Ölçüm Ekleme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddMeasurementOpen}
        onRequestClose={() => setIsAddMeasurementOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('pet.addMeasurement')}</Text>
              <Pressable
                onPress={() => setIsAddMeasurementOpen(false)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Feather name="x" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} keyboardShouldPersistTaps="handled">
              {measurementError ? (
                <Text style={styles.error}>{measurementError}</Text>
              ) : null}

              <Input
                label={`${t('pet.weight')} (kg) *`}
                placeholder="Örn: 4.5"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />

              <Input
                label={`${t('pet.height')} (cm) - ${t('common.optional')}`}
                placeholder="Örn: 35"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />

              <View style={styles.field}>
                <Text style={styles.label}>{t('pet.measurementDate')}</Text>
                <Pressable
                  onPress={() => setShowMeasurementDatePicker(true)}
                  style={styles.pickerTrigger}
                >
                  <Feather name="calendar" size={16} color={colors.accent} />
                  <Text style={styles.pickerTriggerText}>
                    {measurementDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                </Pressable>
              </View>

              <Input
                label={`${t('pet.notes')} (${t('common.optional')})`}
                placeholder={t('pet.notesPlaceholder')}
                value={measurementNotes}
                onChangeText={setMeasurementNotes}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <Button
                  label={t('common.cancel')}
                  variant="ghost"
                  onPress={() => setIsAddMeasurementOpen(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  label={t('common.save')}
                  loading={createMeasurementMutation.isPending}
                  onPress={handleCreateMeasurement}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Android DatePicker */}
        {showMeasurementDatePicker && Platform.OS !== 'ios' && (
          <DateTimePicker
            value={measurementDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowMeasurementDatePicker(false);
              if (selectedDate) setMeasurementDate(selectedDate);
            }}
          />
        )}

        {/* iOS DatePicker Modal */}
        {showMeasurementDatePicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showMeasurementDatePicker}
            onRequestClose={() => setShowMeasurementDatePicker(false)}
          >
            <View style={styles.iosDatePickerOverlay}>
              <View style={styles.iosDatePickerContainer}>
                <View style={styles.iosDatePickerHeader}>
                  <Text style={styles.modalTitle}>{t('expense.selectDate')}</Text>
                  <Pressable
                    onPress={() => setShowMeasurementDatePicker(false)}
                    style={styles.modalDoneBtn}
                  >
                    <Text style={styles.modalDoneText}>{t('common.done')}</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={measurementDate}
                  mode="date"
                  display="spinner"
                  textColor={colors.textPrimary}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setMeasurementDate(selectedDate);
                  }}
                />
              </View>
            </View>
          </Modal>
        )}
      </Modal>

      {/* Tüm Ölçümler Geçmiş Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isHistoryOpen}
        onRequestClose={() => setIsHistoryOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('pet.growthHistory')}</Text>
              <Pressable
                onPress={() => setIsHistoryOpen(false)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Feather name="x" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.historyList} keyboardShouldPersistTaps="handled">
              {measurements.map((item, idx) => {
                const nextItem = measurements[idx + 1] ?? null;
                const wt = nextItem ? item.weight - nextItem.weight : null;
                const ht = (nextItem && item.height && nextItem.height) ? item.height - nextItem.height : null;

                return (
                  <View key={item.id} style={styles.historyItemCard}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemDate}>{formatMeasurementDate(item.date)}</Text>
                      <Text style={styles.historyItemValues}>
                        {item.weight} kg{item.height ? ` · ${item.height} cm` : ''}
                      </Text>
                    </View>
                    
                    {(wt !== null || ht !== null) && (
                      <View style={styles.historyItemTrends}>
                        {wt !== null && (
                          <View style={[
                            styles.trendBadgeSm,
                            wt > 0 ? styles.trendBadgeUp : wt < 0 ? styles.trendBadgeDown : styles.trendBadgeNeutral
                          ]}>
                            <Text style={[
                              styles.trendBadgeTextSm,
                              wt > 0 ? styles.trendTextUp : wt < 0 ? styles.trendTextDown : styles.trendTextNeutral
                            ]}>
                              {t('pet.weight')}: {wt > 0 ? `+${wt.toFixed(2)}` : `${wt.toFixed(2)}`} kg
                            </Text>
                          </View>
                        )}
                        {ht !== null && (
                          <View style={[
                            styles.trendBadgeSm,
                            ht > 0 ? styles.trendBadgeUp : ht < 0 ? styles.trendBadgeDown : styles.trendBadgeNeutral
                          ]}>
                            <Text style={[
                              styles.trendBadgeTextSm,
                              ht > 0 ? styles.trendTextUp : ht < 0 ? styles.trendTextDown : styles.trendTextNeutral
                            ]}>
                              {t('pet.height')}: {ht > 0 ? `+${ht.toFixed(1)}` : `${ht.toFixed(1)}`} cm
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {item.notes ? (
                      <Text style={styles.historyItemNotes}>{item.notes}</Text>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
            
            <View style={{ padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.surfaceBorder }}>
              <Button
                label={t('common.close')}
                variant="secondary"
                onPress={() => setIsHistoryOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.lg,
    maxWidth: layout.maxWidth,
    width: '100%',
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
  },

  // Pet Hero Card (Polished)
  petHero: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.md,
  },
  petHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  petAvatar: {
    alignItems: 'center',
    borderRadius: radius.xl,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  petAvatarText: {
    fontSize: 32,
  },
  petCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: typography.micro,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },

  // Members list
  memberList: {
    gap: spacing.sm,
  },
  memberRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
  },
  muted: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },

  // Form toggle button inside section header
  formToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  formToggleBtnText: {
    color: colors.accentDark,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },

  // Task Form Styles
  taskForm: {
    gap: spacing.base,
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  optionTextSelected: {
    color: colors.accent,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
  },
  checkbox: {
    borderColor: colors.surfaceBorder,
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    width: 22,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },

  // Task List
  taskList: {
    gap: spacing.lg,
  },
  taskGroup: {
    gap: spacing.sm,
  },
  taskGroupTitle: {
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },

  // Event List & Timeline
  eventList: {
    gap: spacing.sm,
  },
  eventRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  eventIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIcon: {
    fontSize: 20,
  },
  eventCopy: {
    flex: 1,
    gap: 2,
  },
  eventMemberName: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },

  // Invites Selector
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  roleOption: {
    alignItems: 'center',
    borderColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  roleOptionSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  roleOptionText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  roleOptionTextSelected: {
    color: colors.accent,
  },
  inviteBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  inviteLink: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  success: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  error: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  pressed: {
    opacity: 0.78,
  },

  // Added Top bar, activity range, stats and CarebookPass ticket styles
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
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
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  rangeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  rangeOptionSelected: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  rangeOptionText: {
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  rangeOptionTextSelected: {
    color: colors.accentDark,
    fontWeight: fontWeight.bold,
  },
  statsScroller: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 90,
    gap: 4,
    ...shadows.sm,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statEmoji: {
    fontSize: 16,
  },
  statCount: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.micro,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  carebookPassCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginTop: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  ticketTop: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketBrand: {
    fontSize: typography.micro,
    fontWeight: fontWeight.black,
    color: colors.accentDark,
    letterSpacing: 1.5,
  },
  ticketTitle: {
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  ticketSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  ticketDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  ticketNotch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  notchLeft: {
    left: -10,
  },
  notchRight: {
    right: -10,
  },
  ticketDashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginHorizontal: 15,
  },
  ticketBottom: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  ticketCodeLabel: {
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  ticketCode: {
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
    color: colors.accentDark,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    letterSpacing: 2,
    backgroundColor: colors.accentSofter,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  ticketExpiry: {
    fontSize: typography.micro,
    color: colors.textTertiary,
  },
  ticketActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    width: '100%',
  },
  ticketActionBtn: {
    flex: 1,
  },

  // Pet stats row in Hero
  petStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },

  // Growth Tracking Card Styles
  encouragementBanner: {
    flexDirection: 'row',
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent + '30',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  encouragementIcon: {
    marginTop: 2,
  },
  encouragementText: {
    flex: 1,
    color: colors.accentDark,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    lineHeight: 18,
  },
  measurementStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  measurementStatCard: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
    position: 'relative',
    minHeight: 88,
  },
  measurementStatLabel: {
    color: colors.textSecondary,
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
  },
  measurementStatValue: {
    color: colors.textPrimary,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
  },
  trendBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  trendBadgeUp: {
    backgroundColor: colors.dangerBg,
  },
  trendBadgeDown: {
    backgroundColor: colors.accentSoft,
  },
  trendBadgeNeutral: {
    backgroundColor: colors.surface,
  },
  trendBadgeText: {
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
  },
  trendBadgeTextSm: {
    fontSize: typography.micro - 1,
    fontWeight: fontWeight.bold,
  },
  trendTextUp: {
    color: colors.danger,
  },
  trendTextDown: {
    color: colors.accentDark,
  },
  trendTextNeutral: {
    color: colors.textSecondary,
  },
  timelineContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.md,
  },
  timelineTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineDate: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  timelineValues: {
    color: colors.accentDark,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  timelineNotes: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: 2,
    fontStyle: 'italic',
  },
  allHistoryBtn: {
    marginTop: spacing.xs,
  },

  // Modal overlays & structures
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
  },
  modalForm: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  // iOS DatePicker Modal layout
  iosDatePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  iosDatePickerContainer: {
    backgroundColor: colors.surface,
    paddingBottom: 40,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  modalDoneBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modalDoneText: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pickerTriggerText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.medium,
  },

  // History List Modal
  historyList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  historyItemCard: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemDate: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
  },
  historyItemValues: {
    color: colors.accentDark,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
  },
  historyItemTrends: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trendBadgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  historyItemNotes: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontStyle: 'italic',
    borderLeftWidth: 2,
    borderLeftColor: colors.accentSoft,
    paddingLeft: spacing.sm,
    marginTop: 2,
  },
});
