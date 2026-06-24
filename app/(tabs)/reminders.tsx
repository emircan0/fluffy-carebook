import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, Switch, Platform, Modal } from 'react-native';
import { SafeDateTimePicker as DateTimePicker } from '../../components/ui/SafeDateTimePicker';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { useAuth } from '../../hooks/useAuth';
import { useCreateReminder } from '../../lib/mutations/useCreateReminder';
import { useDeleteReminder } from '../../lib/mutations/useDeleteReminder';
import { useUpdateReminder } from '../../lib/mutations/useUpdateReminder';
import { useToggleReminderComplete } from '../../lib/mutations/useToggleReminderComplete';
import { getPetErrorMessage, getCurrentUserMember } from '../../lib/pets';
import { usePet } from '../../lib/queries/usePet';
import { usePets } from '../../lib/queries/usePets';
import { useQuery } from '@tanstack/react-query';
import { hasFirebaseConfig } from '../../lib/firebase';
import { usePetRealtime } from '../../lib/realtime/usePetRealtime';
import {
  formatReminderDateInput,
  formatReminderDateLabel,
  getReminderErrorMessage,
  reminderRecurrenceLabels,
  reminderTypeIcons,
  reminderTypeLabels,
  toReminderDate,
  listReminders,
} from '../../lib/reminders';
import {
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
import type { Reminder, ReminderRecurrence, ReminderType, PetRole } from '../../types/app';

const reminderTypeOptions: Array<{ label: string; value: ReminderType }> = [
  { label: 'Aşı', value: 'vaccine' },
  { label: 'İç Parazit', value: 'internal_parasite' },
  { label: 'Dış Parazit', value: 'external_parasite' },
  { label: 'İlaç', value: 'medicine' },
  { label: 'Veteriner', value: 'vet' },
  { label: 'Diğer', value: 'other' },
];

const recurrenceOptions: Array<{ label: string; value: ReminderRecurrence }> = [
  { label: 'Tek Sefer', value: 'none' },
  { label: 'Günlük', value: 'daily' },
  { label: 'Haftalık', value: 'weekly' },
  { label: 'Aylık', value: 'monthly' },
  { label: 'Yıllık', value: 'yearly' },
];

const notifyOptions: Array<{ label: string; value: 'enabled' | 'disabled' }> = [
  { label: 'Bildirim Açık', value: 'enabled' },
  { label: 'Kapalı', value: 'disabled' },
];

const activeOptions: Array<{ label: string; value: 'active' | 'inactive' }> = [
  { label: 'Aktif', value: 'active' },
  { label: 'Pasif', value: 'inactive' },
];

export default function RemindersScreen() {
  const { t, i18n } = useTranslation();

  const reminderTypeOptions: Array<{ label: string; value: ReminderType }> = [
    { label: t('reminders.vaccine'), value: 'vaccine' },
    { label: t('reminders.internalParasite'), value: 'internal_parasite' },
    { label: t('reminders.externalParasite'), value: 'external_parasite' },
    { label: t('reminders.medicine'), value: 'medicine' },
    { label: t('reminders.other'), value: 'other' },
  ];

  const recurrenceOptions: Array<{ label: string; value: ReminderRecurrence }> = [
    { label: t('scheduleTypes.none'), value: 'none' },
    { label: t('reminders.daily'), value: 'daily' },
    { label: t('reminders.weekly'), value: 'weekly' },
    { label: t('reminders.monthly'), value: 'monthly' },
    { label: t('reminders.yearly'), value: 'yearly' },
  ];

  const notificationOptions: Array<{ label: string; value: 'enabled' | 'disabled' }> = [
    { label: t('reminders.notificationsEnabled'), value: 'enabled' },
    { label: t('reminders.notificationsDisabled'), value: 'disabled' },
  ];

  const queryClient = useQueryClient();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const { user } = useAuth();
  const petsQuery = usePets();
  const pets = useMemo(() => petsQuery.data ?? [], [petsQuery.data]);
  const selectedPet = selectedPetId ? pets.find((pet) => pet.id === selectedPetId) ?? null : null;
  const activePetId = selectedPet?.id;
  const petQuery = usePet(activePetId);

  const remindersQuery = useQuery({
    queryKey: ['reminders', selectedPetId ? selectedPetId : 'all_pets'],
    queryFn: async () => {
      if (selectedPetId) {
        return listReminders(selectedPetId);
      }
      if (pets.length === 0) return [];
      const allReminders = await Promise.all(
        pets.map((p) => listReminders(p.id))
      );
      return allReminders.flat();
    },
    enabled: (selectedPetId !== null || pets.length > 0) && hasFirebaseConfig,
  });

  const petsRolesQuery = useQuery({
    queryKey: ['pets_roles', pets.map((p) => p.id).join(','), user?.uid],
    queryFn: async () => {
      if (!user?.uid || pets.length === 0) return {};
      const roles: Record<string, PetRole> = {};
      await Promise.all(
        pets.map(async (pet) => {
          const member = await getCurrentUserMember(pet.id, user.uid);
          if (member) {
            roles[pet.id] = member.role;
          }
        })
      );
      return roles;
    },
    enabled: pets.length > 0 && Boolean(user?.uid) && hasFirebaseConfig,
  });

  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();
  const toggleReminderCompleteMutation = useToggleReminderComplete();

  const getCanEditReminder = (reminder: Reminder) => {
    const role = petsRolesQuery.data?.[reminder.petId] ?? null;
    return role === 'owner' || role === 'editor';
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('vaccine');
  
  // Date & Time Picker States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hasTime, setHasTime] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [recurrence, setRecurrence] = useState<ReminderRecurrence>('none');
  const [notifyState, setNotifyState] = useState<'enabled' | 'disabled'>('enabled');
  const [activeState, setActiveState] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState<string | null>(null);

  const reminders = remindersQuery.data ?? [];
  const memberRole = petQuery.data?.member?.role ?? null;
  const canEdit = memberRole === 'owner' || memberRole === 'editor';
  const isSaving = createReminderMutation.isPending || updateReminderMutation.isPending;

  const invalidateReminders = useCallback(() => {
    if (activePetId) {
      void queryClient.invalidateQueries({ queryKey: ['reminders', activePetId] });
      void queryClient.invalidateQueries({ queryKey: ['todayDashboard', activePetId] });
    }
    void queryClient.invalidateQueries({ queryKey: ['reminders', 'all_pets'] });
  }, [activePetId, queryClient]);

  const realtime = usePetRealtime({
    petId: activePetId,
    enabled: Boolean(activePetId && user?.uid),
    listenCareEvents: false,
    listenCareTasks: false,
    listenMembers: false,
    listenReminders: true,
    onRemindersChanged: invalidateReminders,
  });

  useEffect(() => {
    if (selectedPetId && !pets.some((pet) => pet.id === selectedPetId)) {
      setSelectedPetId(null);
    }
  }, [pets, selectedPetId]);

  function resetForm() {
    setEditingReminder(null);
    setTitle('');
    setReminderType('vaccine');
    setSelectedDate(new Date());
    setHasTime(false);
    setRecurrence('none');
    setNotifyState('enabled');
    setActiveState('active');
    setFormError(null);
  }

  function openCreateForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(reminder: Reminder) {
    setSelectedPetId(reminder.petId); // Switch to that pet's view for editing
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setReminderType(reminder.reminderType);
    
    const rDate = toReminderDate(reminder.remindAt) || new Date();
    setSelectedDate(rDate);
    
    const hours = rDate.getHours();
    const minutes = rDate.getMinutes();
    if (hours !== 9 || minutes !== 0) {
      setHasTime(true);
    } else {
      setHasTime(false);
    }

    setRecurrence(reminder.recurrence);
    setNotifyState(reminder.notifyEnabled ? 'enabled' : 'disabled');
    setActiveState(reminder.isActive ? 'active' : 'inactive');
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    resetForm();
    setIsFormOpen(false);
  }

  async function handleSubmit() {
    if (!activePetId || !canEdit || isSaving) {
      return;
    }

    setFormError(null);

    const finalDate = new Date(selectedDate);
    if (!hasTime) {
      finalDate.setHours(9, 0, 0, 0);
    }

    try {
      if (editingReminder) {
        await updateReminderMutation.mutateAsync(
          {
            petId: activePetId,
            reminderId: editingReminder.id,
            title,
            reminderType,
            remindAt: finalDate,
            recurrence,
            notifyEnabled: notifyState === 'enabled',
            isActive: activeState === 'active',
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({ queryKey: ['reminders', 'all_pets'] });
            },
          }
        );
      } else {
        await createReminderMutation.mutateAsync(
          {
            petId: activePetId,
            title,
            reminderType,
            remindAt: finalDate,
            recurrence,
            notifyEnabled: notifyState === 'enabled',
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({ queryKey: ['reminders', 'all_pets'] });
            },
          }
        );
      }

      closeForm();
    } catch (error) {
      setFormError(getReminderErrorMessage(error));
    }
  }

  async function handleDelete(reminder: Reminder) {
    const reminderCanEdit = getCanEditReminder(reminder);
    if (!reminder.petId || !reminderCanEdit || deleteReminderMutation.isPending) {
      return;
    }

    setFormError(null);

    try {
      await deleteReminderMutation.mutateAsync(
        {
          petId: reminder.petId,
          reminderId: reminder.id,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['reminders', 'all_pets'] });
          },
        }
      );

      if (editingReminder?.id === reminder.id) {
        closeForm();
      }
    } catch (error) {
      setFormError(getReminderErrorMessage(error));
    }
  }

  async function handleToggleComplete(reminder: Reminder) {
    const reminderCanEdit = getCanEditReminder(reminder);
    if (!reminder.petId || !reminderCanEdit || toggleReminderCompleteMutation.isPending) {
      return;
    }

    setFormError(null);

    try {
      await toggleReminderCompleteMutation.mutateAsync(
        {
          petId: reminder.petId,
          reminderId: reminder.id,
          isCompleted: !reminder.isCompleted,
        },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['reminders', 'all_pets'] });
          },
        }
      );
    } catch (error) {
      setFormError(getReminderErrorMessage(error));
    }
  }

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      if (a.isCompleted === b.isCompleted) {
        const leftTime = toReminderDate(a.remindAt)?.getTime() ?? 0;
        const rightTime = toReminderDate(b.remindAt)?.getTime() ?? 0;
        return leftTime - rightTime;
      }
      return a.isCompleted ? 1 : -1;
    });
  }, [reminders]);

  const onDateChange = (event: any, date?: Date) => {
    // Keep datepicker open on iOS until completed, close immediately on Android
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (date) {
      const nextDate = new Date(selectedDate);
      nextDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(nextDate);
    }
  };

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }
    if (date) {
      const nextDate = new Date(selectedDate);
      nextDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setSelectedDate(nextDate);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isFormOpen ? (editingReminder ? t('reminders.editReminder') : t('reminders.newReminder')) : t('reminders.reminders')}
            </Text>
            <Text style={styles.subtitle}>
              {isFormOpen
                ? t('reminders.formDesc')
                : (selectedPetId === null
                    ? t('reminders.allPetsDesc')
                    : (selectedPet ? `${selectedPet.name} ${t('reminders.forPet')}` : t('reminders.selectPet')))}
            </Text>
          </View>
          {isFormOpen || (selectedPetId !== null && canEdit) ? (
            <Pressable
              accessibilityRole="button"
              onPress={isFormOpen ? closeForm : openCreateForm}
              style={({ pressed }) => [
                styles.addButton,
                isFormOpen && styles.addButtonOpen,
                pressed && styles.pressed,
              ]}
            >
              <Feather
                name={isFormOpen ? 'arrow-left' : 'plus'}
                size={22}
                color={isFormOpen ? colors.textSecondary : colors.textInverse}
              />
            </Pressable>
          ) : null}
        </View>

        {/* Pet Scroller (Only when not editing/adding) */}
        {!isFormOpen && pets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.petScrollerContainer}
            contentContainerStyle={styles.petScroller}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedPetId(null)}
              style={({ pressed }) => [
                styles.petChip,
                selectedPetId === null && styles.petChipSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.petChipContent}>
                <View style={[styles.petChipAvatar, { backgroundColor: colors.accent + '18' }]}>
                  <Text style={styles.petChipEmoji}>🐾</Text>
                </View>
                <Text style={[styles.petChipName, selectedPetId === null && styles.petChipNameSelected]}>
                  {t('reminders.allPets')}
                </Text>
              </View>
            </Pressable>

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
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.petChipContent}>
                    <View style={[styles.petChipAvatar, { backgroundColor: cfg.color + '18' }]}>
                      <Text style={styles.petChipEmoji}>{cfg.emoji}</Text>
                    </View>
                    <Text style={[styles.petChipName, isSelected && styles.petChipNameSelected]}>
                      {pet.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {petsQuery.isLoading || petsQuery.error || (!petsQuery.isLoading && !petsQuery.error && pets.length === 0) || (selectedPet && realtime.error) ? (
          <View>
            {petsQuery.isLoading && <LoadingState label={t("reminders.loading")} />}
            {petsQuery.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{getPetErrorMessage(petsQuery.error)}</Text>
              </View>
            )}
            {!petsQuery.isLoading && !petsQuery.error && pets.length === 0 && (
              <Card>
                <EmptyState
                  icon="🐾"
                  title={t("reminders.noPetTitle")}
                  text={t("reminders.noPetDesc")}
                />
              </Card>
            )}
            {selectedPet && realtime.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{realtime.error}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Form Mode */}
        {selectedPet && isFormOpen && canEdit ? (
          <Card style={styles.formCard}>
            <Input
              editable={!isSaving}
              label={t("reminders.title")}
              onChangeText={setTitle}
              placeholder={t("reminders.titlePlaceholder")}
              value={title}
            />

            <View style={styles.field}>
              <Text style={styles.label}>{t("reminders.type")}</Text>
              <View style={styles.optionGrid}>
                {reminderTypeOptions.map((option) => (
                  <Pressable
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => setReminderType(option.value)}
                    style={[
                      styles.option,
                      reminderType === option.value && styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        reminderType === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {reminderTypeIcons[option.value]} {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.field}>
              <Text style={styles.label}>{t("reminders.date")}</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerTrigger}>
                <Feather name="calendar" size={16} color={colors.textSecondary} />
                <Text style={styles.pickerTriggerText}>
                  {selectedDate.toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })}
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

            {/* Optional Time Selection */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>{t("reminders.addTimeOptional")}</Text>
              <Switch
                value={hasTime}
                onValueChange={(val) => {
                  setHasTime(val);
                  if (val) setShowTimePicker(true);
                }}
                trackColor={{ false: colors.surfaceBorder, true: colors.accentSoft }}
                thumbColor={colors.white}
              />
            </View>

            {hasTime && (
              <Pressable onPress={() => setShowTimePicker(true)} style={styles.pickerTrigger}>
                <Feather name="clock" size={16} color={colors.textSecondary} />
                <Text style={styles.pickerTriggerText}>
                  {t("reminders.timeLabel")}: {selectedDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Pressable>
            )}


            {/* Android / Web Inline TimePicker */}
            {showTimePicker && Platform.OS !== 'ios' && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                is24Hour={true}
                display="default"
                onValueChange={onTimeChange}
              />
            )}

            <View style={styles.field}>
              <Text style={styles.label}>{t("reminders.recurrenceLabel")}</Text>
              <View style={styles.optionGrid}>
                {recurrenceOptions.map((option) => (
                  <Pressable
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => setRecurrence(option.value)}
                    style={[
                      styles.option,
                      recurrence === option.value && styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        recurrence === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.segmentedContainer}>
              <Text style={styles.label}>{t("reminders.remind")}</Text>
              <SegmentedControl
                options={notificationOptions}
                value={notifyState}
                onChange={setNotifyState}
              />
            </View>

            {editingReminder ? (
              <View style={styles.segmentedContainer}>
                <Text style={styles.label}>{t("reminders.status")}</Text>
                <SegmentedControl
                  options={[
                    { label: t('reminders.active'), value: 'active' },
                    { label: t('reminders.inactive'), value: 'inactive' },
                  ]}
                  value={activeState}
                  onChange={setActiveState}
                />
              </View>
            ) : null}

            {formError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.formActions}>
              <Button label={t("common.cancel")} onPress={closeForm} variant="ghost" style={styles.actionButton} />
              <Button
                disabled={!title.trim() || isSaving}
                label={editingReminder ? t('reminders.update') : t('reminders.save')}
                loading={isSaving}
                onPress={handleSubmit}
                style={styles.actionButton}
              />
            </View>
          </Card>
        ) : null}

        {/* List Mode */}
        {!isFormOpen && (selectedPet || selectedPetId === null) ? (
          <>
            {selectedPetId !== null && !canEdit && !petQuery.isLoading ? (
              <View style={styles.readOnlyBox}>
                <Feather name="eye" size={15} color={colors.textSecondary} />
                <Text style={styles.readOnlyText}>{t("reminders.readOnlyMode")}</Text>
              </View>
            ) : null}

            {remindersQuery.isLoading || petQuery.isLoading ? (
              <LoadingState label={t("reminders.loadingReminders")} />
            ) : null}

            {!remindersQuery.isLoading && reminders.length === 0 ? (
              <Card>
                <EmptyState
                  icon="📅"
                  title={t("reminders.noRemindersTitle")}
                  text={t("reminders.noRemindersDesc")}
                />
              </Card>
            ) : null}

            {reminders.length > 0 ? (
              <View style={styles.reminderList}>
                {sortedReminders.map((reminder) => {
                  const isDone = reminder.isCompleted === true;
                  const timeFormatted = toReminderDate(reminder.remindAt)?.toLocaleTimeString(i18n.language, {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const hasCustomTime = toReminderDate(reminder.remindAt)?.getHours() !== 9 || toReminderDate(reminder.remindAt)?.getMinutes() !== 0;
                  const reminderPet = pets.find((p) => p.id === reminder.petId);

                  return (
                    <View key={reminder.id} style={[styles.reminderRow, isDone && styles.reminderRowDone]}>
                      <Pressable
                        disabled={!getCanEditReminder(reminder) || toggleReminderCompleteMutation.isPending}
                        onPress={() => handleToggleComplete(reminder)}
                        style={({ pressed }) => [
                          styles.checkCircle,
                          isDone && styles.checkCircleDone,
                          pressed && styles.pressed,
                        ]}
                      >
                        {isDone ? (
                          <Feather name="check" size={13} color={colors.textInverse} />
                        ) : (
                          <Feather name="plus" size={13} color={colors.accentDark} />
                        )}
                      </Pressable>

                      <View style={styles.reminderIcon}>
                        <Text style={styles.reminderIconText}>
                          {reminderTypeIcons[reminder.reminderType]}
                        </Text>
                      </View>
                      <View style={styles.reminderCopy}>
                        <Text style={[styles.reminderTitle, isDone && styles.reminderTitleDone]} numberOfLines={1}>
                          {reminder.title}
                        </Text>
                        <Text style={styles.reminderMeta} numberOfLines={1}>
                          {selectedPetId === null && reminderPet ? `${reminderPet.name} · ` : ''}
                          {reminderTypeLabels[reminder.reminderType]} · {reminderRecurrenceLabels[reminder.recurrence]}
                          {hasCustomTime && ` · ${t('reminders.timeLabel')}: ${timeFormatted}`}
                        </Text>
                      </View>
                      <View style={styles.reminderSide}>
                        <Text style={[styles.reminderDate, isDone && styles.reminderDateDone]}>
                          {formatReminderDateLabel(reminder.remindAt)}
                        </Text>
                        {getCanEditReminder(reminder) ? (
                          <View style={styles.rowActions}>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => openEditForm(reminder)}
                              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                            >
                              <Feather name="edit-2" size={13} color={colors.accentDark} />
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              disabled={deleteReminderMutation.isPending}
                              onPress={() => handleDelete(reminder)}
                              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                            >
                              <Feather name="trash-2" size={13} color={colors.danger} />
                            </Pressable>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : null}

        {/* iOS Modals rendered at root container level to prevent layout issues */}
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
                  <Text style={styles.modalTitle}>{t('reminders.selectDate')}</Text>
                  <Pressable onPress={() => setShowDatePicker(false)} style={styles.modalDoneBtn}>
                    <Text style={styles.modalDoneText}>{t("common.done")}</Text>
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

        {showTimePicker && Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showTimePicker}
            onRequestClose={() => setShowTimePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('reminders.selectTime')}</Text>
                  <Pressable onPress={() => setShowTimePicker(false)} style={styles.modalDoneBtn}>
                    <Text style={styles.modalDoneText}>{t("common.done")}</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onValueChange={onTimeChange}
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
    paddingBottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.xl,
    maxWidth: layout.maxWidth,
    width: '100%',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: 'center',
    width: 48,
    ...shadows.accent,
  },
  addButtonOpen: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    ...shadows.sm,
  },
  petScroller: {
    gap: spacing.sm,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  petScrollerContainer: {
    height: 92,
  },
  petChip: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderRadius: 42,
    borderWidth: 1,
    width: 84,
    height: 84,
    ...shadows.sm,
  },
  petChipSelected: {
    backgroundColor: colors.accentSofter,
    borderColor: colors.accent,
    ...shadows.accent,
  },
  petChipContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  petChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petChipEmoji: {
    fontSize: 16,
  },
  petChipName: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  petChipNameSelected: {
    color: colors.accent,
  },
  readOnlyBox: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  readOnlyText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  formCard: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  segmentedContainer: {
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
    minHeight: 38,
    justifyContent: 'center',
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  reminderList: {
    gap: spacing.md,
  },
  reminderRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  reminderRowDone: {
    backgroundColor: colors.surfaceRaised,
    opacity: 0.65,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkCircleDone: {
    backgroundColor: colors.success,
  },
  reminderIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  reminderIconText: {
    fontSize: 22,
  },
  reminderCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  reminderTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.black,
  },
  reminderTitleDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  reminderMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  reminderSide: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  reminderDate: {
    color: colors.accentDark,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
  },
  reminderDateDone: {
    color: colors.textSecondary,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger + '30',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  pressed: {
    opacity: 0.78,
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
