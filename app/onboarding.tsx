import { useEffect, useMemo, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeDateTimePicker as DateTimePicker } from '../components/ui/SafeDateTimePicker';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import { logout } from '../lib/auth';
import { careEventLabels, getCareErrorMessage } from '../lib/care';
import { getInviteErrorMessage } from '../lib/invites';
import { useCompleteOnboarding } from '../lib/mutations/useCompleteOnboarding';
import { useCreateCareTask } from '../lib/mutations/useCreateCareTask';
import { useCreateInvite } from '../lib/mutations/useCreateInvite';
import { useCreatePet } from '../lib/mutations/useCreatePet';
import { getOnboardingErrorMessage } from '../lib/onboarding';
import { getPetErrorMessage } from '../lib/pets';
import { useCareTasks } from '../lib/queries/useCareTasks';
import { usePets } from '../lib/queries/usePets';
import {
  careEventEmoji,
  colors,
  fontWeight,
  layout,
  radius,
  shadows,
  spacing,
  speciesConfig,
  typography,
} from '../lib/theme';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import type { CareEventType, CareScheduleType, PetGender, PetRole, PetSpecies } from '../types/app';

type OnboardingStep = 'welcome' | 'pet' | 'tasks' | 'invite';

const stepOrder: OnboardingStep[] = ['welcome', 'pet', 'tasks', 'invite'];

const speciesOptions: Array<{ value: PetSpecies }> = [
  { value: 'cat' },
  { value: 'dog' },
  { value: 'bird' },
  { value: 'rabbit' },
  { value: 'other' },
];

const genderOptions: Array<{ value: PetGender }> = [
  { value: 'unknown' },
  { value: 'female' },
  { value: 'male' },
];

const taskTemplates: Array<{
  eventType: CareEventType;
  scheduleType: CareScheduleType;
}> = [
  { eventType: 'food', scheduleType: 'daily' },
  { eventType: 'water', scheduleType: 'daily' },
  { eventType: 'medicine', scheduleType: 'daily' },
  { eventType: 'litter', scheduleType: 'daily' },
  { eventType: 'walk', scheduleType: 'daily' },
  { eventType: 'bath', scheduleType: 'weekly' },
  { eventType: 'grooming', scheduleType: 'weekly' },
];

const inviteRoles: Array<{ value: Extract<PetRole, 'editor' | 'viewer'> }> = [
  { value: 'editor' },
  { value: 'viewer' },
];

function defaultTasksForSpecies(species: PetSpecies) {
  if (species === 'cat') {
    return ['food', 'water', 'litter', 'medicine'] as CareEventType[];
  }

  if (species === 'dog') {
    return ['food', 'water', 'walk', 'medicine'] as CareEventType[];
  }

  return ['food', 'water', 'medicine'] as CareEventType[];
}

function normalizeTaskKey(title: string, eventType: CareEventType, locale: string = 'tr-TR') {
  return `${title.trim().toLocaleLowerCase(locale)}::${eventType}`;
}

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const setSelectedPetId = useAppStore((state) => state.setSelectedPetId);
  const petsQuery = usePets();
  const createPetMutation = useCreatePet();
  const createCareTaskMutation = useCreateCareTask();
  const createInviteMutation = useCreateInvite();
  const completeOnboardingMutation = useCompleteOnboarding();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [createdPetId, setCreatedPetId] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('cat');
  const [gender, setGender] = useState<PetGender>('unknown');
  
  // Datepicker States
  const [birthDate, setBirthDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedTasks, setSelectedTasks] = useState<CareEventType[]>(defaultTasksForSpecies('cat'));
  const [inviteRole, setInviteRole] = useState<Extract<PetRole, 'editor' | 'viewer'>>('editor');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const careTasksQuery = useCareTasks(createdPetId ?? undefined);
  const pets = petsQuery.data ?? [];
  const existingPet = pets[0] ?? null;
  const activeStepIndex = stepOrder.indexOf(step) + 1;
  const canCreatePet = petName.trim().length > 0 && !createPetMutation.isPending;
  const isCompleting = completeOnboardingMutation.isPending;

  const selectedPetName = useMemo(() => {
    if (createdPetId) {
      return petName.trim();
    }

    return existingPet?.name ?? '';
  }, [createdPetId, existingPet?.name, petName]);

  useEffect(() => {
    if (profile?.onboardingCompleted && pets.length > 0) {
      setSelectedPetId(pets[0].id);
      router.replace('/');
    }
  }, [pets, profile?.onboardingCompleted, router, setSelectedPetId]);

  function goToStep(nextStep: OnboardingStep) {
    setErrorMessage(null);
    setStep(nextStep);
  }

  async function handleLogout() {
    setErrorMessage(null);
    try {
      await logout();
    } catch (error) {
      setErrorMessage(t('auth.defaultError'));
    }
  }

  async function finishOnboarding(petId?: string | null) {
    setErrorMessage(null);

    try {
      await completeOnboardingMutation.mutateAsync();
      if (petId) {
        setSelectedPetId(petId);
      }
      router.replace('/');
    } catch (error) {
      setErrorMessage(getOnboardingErrorMessage(error));
    }
  }

  async function handleExistingUserComplete() {
    await finishOnboarding(existingPet?.id ?? null);
  }

  async function handleCreatePet() {
    if (!petName.trim()) {
      setErrorMessage(t('errors.petNameRequired'));
      return;
    }

    setErrorMessage(null);

    try {
      const pet = await createPetMutation.mutateAsync({
        name: petName,
        species,
        gender,
        birthDate,
      });

      setCreatedPetId(pet.id);
      setSelectedPetId(pet.id);
      setSelectedTasks(defaultTasksForSpecies(species));
      goToStep('tasks');
    } catch (error) {
      setErrorMessage(getPetErrorMessage(error));
    }
  }

  function toggleTask(eventType: CareEventType) {
    setSelectedTasks((current) => (
      current.includes(eventType)
        ? current.filter((item) => item !== eventType)
        : [...current, eventType]
    ));
  }

  async function handleCreateSelectedTasks() {
    if (!createdPetId) {
      setErrorMessage(t('errors.mustCreatePetFirst'));
      return;
    }

    setErrorMessage(null);

    const existingTaskKeys = new Set(
      (careTasksQuery.data ?? []).map((task) => normalizeTaskKey(task.title, task.eventType, i18n.language)),
    );
    const tasksToCreate = taskTemplates.filter((task) => {
      if (!selectedTasks.includes(task.eventType)) {
        return false;
      }

      return !existingTaskKeys.has(normalizeTaskKey(t(`careEvent.${task.eventType}`), task.eventType, i18n.language));
    });

    try {
      for (const task of tasksToCreate) {
        await createCareTaskMutation.mutateAsync({
          petId: createdPetId,
          title: t(`careEvent.${task.eventType}`),
          eventType: task.eventType,
          scheduleType: task.scheduleType,
          dueTime: '',
          allowMultiplePerDay: false,
          notifyEnabled: false,
        });
      }

      goToStep('invite');
    } catch (error) {
      setErrorMessage(getCareErrorMessage(error));
    }
  }

  async function handleCreateInvite() {
    if (!createdPetId) {
      setErrorMessage(t('errors.mustCreatePetFirstToInvite'));
      return;
    }

    setErrorMessage(null);
    setCopyStatus(null);

    try {
      const invite = await createInviteMutation.mutateAsync({
        petId: createdPetId,
        role: inviteRole,
        invitedByName: null,
      });

      setInviteLink(`/invite/${invite.token}`);
    } catch (error) {
      setErrorMessage(getInviteErrorMessage(error));
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteLink) {
      return;
    }

    await Clipboard.setStringAsync(inviteLink);
    setCopyStatus(t('errors.inviteLinkCopied'));
  }

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setBirthDate(`${year}-${month}-${day}`);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{activeStepIndex}/4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${activeStepIndex * 25}%` }]} />
          </View>
        </View>

        {step === 'welcome' ? (
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Feather name="heart" size={30} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>{t('onboarding.welcomeTitle')}</Text>
            <Text style={styles.heroText}>
              {t('onboarding.welcomeDesc1')}
            </Text>
            <Text style={styles.heroText}>
              {t('onboarding.welcomeDesc2')}
            </Text>

            {petsQuery.isLoading ? <LoadingState label={t('onboarding.checkingSetup')} /> : null}

            {!petsQuery.isLoading && pets.length > 0 && !profile?.onboardingCompleted ? (
              <Card variant="accent" style={styles.existingCard}>
                <Text style={styles.cardTitle}>{t('onboarding.petsReadyTitle')}</Text>
                <Text style={styles.cardText}>
                  {t('onboarding.petsReadyDesc')}
                </Text>
                <Button
                  label={t('onboarding.completeSetup')}
                  loading={isCompleting}
                  onPress={handleExistingUserComplete}
                  size="md"
                />
                <Button
                  label={t('auth.goBack')}
                  onPress={handleLogout}
                  variant="ghost"
                  size="md"
                />
              </Card>
            ) : (
              <View style={{ gap: spacing.md }}>
                <Button
                  disabled={petsQuery.isLoading}
                  label={t('onboarding.start')}
                  onPress={() => goToStep('pet')}
                  size="lg"
                />
                <Button
                  label={t('auth.goBack')}
                  onPress={handleLogout}
                  variant="ghost"
                  size="md"
                />
              </View>
            )}
          </View>
        ) : null}

        {step === 'pet' ? (
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.eyebrow}>{t('onboarding.firstPet')}</Text>
              <Text style={styles.title}>{t('onboarding.addFriend')}</Text>
            </View>

            <Input
              editable={!createPetMutation.isPending}
              label={t('onboarding.petName')}
              onChangeText={setPetName}
              placeholder={t('onboarding.petNamePlaceholder')}
              value={petName}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('onboarding.species')}</Text>
              <View style={styles.optionGrid}>
                {speciesOptions.map((option) => {
                  const config = speciesConfig[option.value];
                  const selected = species === option.value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={option.value}
                      onPress={() => setSpecies(option.value)}
                      style={[styles.optionCard, selected && styles.optionCardSelected]}
                    >
                      <Text style={styles.optionEmoji}>{config.emoji}</Text>
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {t(`species.${option.value}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('onboarding.gender')}</Text>
              <View style={styles.chipRow}>
                {genderOptions.map((option) => {
                  const selected = gender === option.value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={option.value}
                      onPress={() => setGender(option.value)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {t(`gender.${option.value}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Birthdate selection via Datepicker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('onboarding.birthDate')}</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerTrigger}>
                <Feather name="calendar" size={16} color={colors.textSecondary} />
                <Text style={styles.pickerTriggerText}>
                  {birthDate
                    ? selectedDate.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : t('onboarding.tapToSelect')}
                </Text>
              </Pressable>
            </View>

            {/* Android / Web Inline DatePicker */}
            {showDatePicker && Platform.OS !== 'ios' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onValueChange={onDateChange}
              />
            )}

            <View style={{ gap: spacing.md }}>
              <View style={styles.actionRow}>
                <Button label={t('onboarding.back')} onPress={() => goToStep('welcome')} size="md" variant="ghost" />
                <Button
                  disabled={!canCreatePet}
                  label={t('onboarding.continue')}
                  loading={createPetMutation.isPending}
                  onPress={handleCreatePet}
                  size="md"
                  style={styles.primaryAction}
                />
              </View>
              <Button 
                label={t('onboarding.skipForNow')} 
                onPress={() => finishOnboarding(null)} 
                variant="subtle" 
                size="md" 
                loading={isCompleting}
              />
            </View>
          </Card>
        ) : null}

        {step === 'tasks' ? (
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.eyebrow}>{selectedPetName}</Text>
              <Text style={styles.title}>{t('onboarding.selectTasks')}</Text>
            </View>

            <View style={styles.taskGrid}>
              {taskTemplates.map((task) => {
                const selected = selectedTasks.includes(task.eventType);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    key={task.eventType}
                    onPress={() => toggleTask(task.eventType)}
                    style={[styles.taskCard, selected && styles.taskCardSelected]}
                  >
                    <Text style={styles.taskEmoji}>{careEventEmoji[task.eventType]}</Text>
                    <Text style={[styles.taskTitle, selected && styles.taskTitleSelected]}>
                      {t(`careEvent.${task.eventType}`)}
                    </Text>
                    {selected ? (
                      <View style={styles.checkBadge}>
                        <Feather name="check" size={14} color={colors.textInverse} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {careTasksQuery.isLoading ? <LoadingState label={t('onboarding.checkingTasks')} /> : null}

            <View style={styles.actionRow}>
              <Button label={t('onboarding.back')} onPress={() => goToStep('pet')} size="md" variant="ghost" />
              <Button
                label={t('onboarding.addTasks')}
                loading={createCareTaskMutation.isPending}
                onPress={handleCreateSelectedTasks}
                size="md"
                style={styles.primaryAction}
              />
            </View>
          </Card>
        ) : null}

        {step === 'invite' ? (
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.eyebrow}>{t('onboarding.optional')}</Text>
              <Text style={styles.title}>{t('onboarding.trackTogetherTitle')}</Text>
              <Text style={styles.bodyText}>
                {t('onboarding.trackTogetherDesc')}
              </Text>
            </View>

            <View style={styles.chipRow}>
              {inviteRoles.map((option) => {
                const selected = inviteRole === option.value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => setInviteRole(option.value)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {t(`roles.${option.value}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {inviteLink ? (
              <View style={styles.inviteBox}>
                <Text style={styles.inviteLabel}>{t('onboarding.inviteLink')}</Text>
                <Text style={styles.inviteLink}>{inviteLink}</Text>
                <Button label={t('onboarding.copy')} onPress={handleCopyInviteLink} size="sm" variant="secondary" />
                {copyStatus ? <Text style={styles.successText}>{copyStatus}</Text> : null}
              </View>
            ) : null}

            <View style={styles.actionStack}>
              <Button
                label={t('onboarding.inviteCaregiver')}
                loading={createInviteMutation.isPending}
                onPress={handleCreateInvite}
                size="lg"
              />
              <Button
                label={inviteLink ? t('onboarding.goToDashboard') : t('onboarding.skipForNow')}
                loading={isCompleting}
                onPress={() => finishOnboarding(createdPetId)}
                size="md"
                variant="ghost"
              />
            </View>
          </Card>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        {/* iOS DatePicker Modal at root level to prevent container clipping */}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('onboarding.selectBirthDate')}</Text>
                  <Pressable onPress={() => setShowDatePicker(false)} style={styles.modalDoneBtn}>
                    <Text style={styles.modalDoneText}>{t('onboarding.done')}</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onValueChange={onDateChange}
                  textColor={colors.textPrimary}
                  style={{ height: 200, width: '100%' }}
                  locale={i18n.language}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: layout.screenPadding,
    paddingTop: 64,
    paddingBottom: spacing.xxxl,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.xl,
    maxWidth: layout.formWidth,
    width: '100%',
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    minWidth: 32,
  },
  progressTrack: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: '100%',
  },
  hero: {
    gap: spacing.xl,
    paddingTop: spacing.xxl,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent + '30',
    borderRadius: radius.xl,
    borderWidth: 1,
    height: 68,
    justifyContent: 'center',
    width: 68,
    ...shadows.accent,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: fontWeight.black,
    lineHeight: 40,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: typography.bodyLg,
    lineHeight: 27,
  },
  card: {
    gap: spacing.xl,
  },
  existingCard: {
    gap: spacing.base,
  },
  sectionHeader: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
    lineHeight: 32,
  },
  bodyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 23,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 86,
    minWidth: 92,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  optionTextSelected: {
    color: colors.accentDark,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  chipTextSelected: {
    color: colors.accentDark,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  pickerTriggerText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
  },
  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  taskCard: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexBasis: '30%',
    justifyContent: 'center',
    minWidth: 96,
    padding: spacing.md,
    position: 'relative',
  },
  taskCardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  taskEmoji: {
    fontSize: 26,
    marginBottom: spacing.sm,
  },
  taskTitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  taskTitleSelected: {
    color: colors.accentDark,
  },
  checkBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 24,
  },
  inviteBox: {
    backgroundColor: colors.accentSofter,
    borderColor: colors.accent + '25',
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  inviteLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  inviteLink: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
  },
  successText: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
  },
  actionStack: {
    gap: spacing.md,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger + '30',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
  },

  // Modal styling for iOS platform-native DatePicker wrap
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  modalDoneBtn: {
    padding: spacing.xs,
  },
  modalDoneText: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.accent,
  },
});
