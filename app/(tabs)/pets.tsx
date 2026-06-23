import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeDateTimePicker as DateTimePicker } from '../../components/ui/SafeDateTimePicker';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { getPetErrorMessage } from '../../lib/pets';
import { useCreatePet } from '../../lib/mutations/useCreatePet';
import { usePets } from '../../lib/queries/usePets';
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
import type { PetGender, PetSpecies } from '../../types/app';



export default function PetsScreen() {
  const { t, i18n } = useTranslation();

  const speciesOptions: Array<{ label: string; value: PetSpecies }> = [
    { label: `🐱 ${t('species.cat')}`, value: 'cat' },
    { label: `🐶 ${t('species.dog')}`, value: 'dog' },
    { label: `🐦 ${t('species.bird')}`, value: 'bird' },
    { label: `🐰 ${t('species.rabbit')}`, value: 'rabbit' },
    { label: `🐾 ${t('species.other')}`, value: 'other' },
  ];

  const genderOptions: Array<{ label: string; value: PetGender }> = [
    { label: t('genders.unknown'), value: 'unknown' },
    { label: t('genders.female'), value: 'female' },
    { label: t('genders.male'), value: 'male' },
  ];

  const router = useRouter();
  const setSelectedPetId = useAppStore((s) => s.setSelectedPetId);
  const petsQuery = usePets();
  const createPetMutation = useCreatePet();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('cat');
  const [gender, setGender] = useState<PetGender>('unknown');
  const [breed, setBreed] = useState('');
  
  // Datepicker States
  const [birthDate, setBirthDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [microchipNo, setMicrochipNo] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const pets = petsQuery.data ?? [];
  const canSubmit = Boolean(name.trim()) && !createPetMutation.isPending;

  function resetForm() {
    setName(''); setSpecies('cat'); setGender('unknown');
    setBreed(''); setBirthDate(''); setSelectedDate(new Date());
    setMicrochipNo(''); setNotes(''); setFormError(null);
  }

  async function handleCreatePet() {
    if (!name.trim()) { setFormError(t('errors.petNameRequired')); return; }
    setFormError(null);
    try {
      const pet = await createPetMutation.mutateAsync({ name, species, gender, breed, birthDate, microchipNo, notes });
      setSelectedPetId(pet.id);
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setFormError(getPetErrorMessage(error));
    }
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isFormOpen ? t('pets.addNewPet') : t('pets.myPets')}
            </Text>
            <Text style={styles.subtitle}>
              {isFormOpen
                ? 'Dostunuzun temel bilgilerini girin.'
                : t('pets.careTeamPets')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIsFormOpen((v) => !v);
              setFormError(null);
              if (isFormOpen) resetForm();
            }}
            style={({ pressed }) => [
              styles.addBtn,
              isFormOpen && styles.addBtnClose,
              pressed && styles.pressed,
            ]}
          >
            <Feather
              name={isFormOpen ? 'arrow-left' : 'plus'}
              size={22}
              color={isFormOpen ? colors.textSecondary : colors.textInverse}
            />
          </Pressable>
        </View>

        {/* ── Create Form ── */}
        {isFormOpen ? (
          <Card style={styles.formCard}>
            <View style={styles.formFields}>
              <Input
                editable={!createPetMutation.isPending}
                label={t("pets.name")}
                onChangeText={setName}
                placeholder={t("pets.namePlaceholder")}
                value={name}
              />

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t("onboarding.species")}</Text>
                <View style={styles.chipRow}>
                  {speciesOptions.map((opt) => (
                    <Pressable
                      accessibilityRole="button"
                      key={opt.value}
                      onPress={() => setSpecies(opt.value)}
                      style={[styles.chip, species === opt.value && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, species === opt.value && styles.chipTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Cinsiyet</Text>
                <View style={styles.chipRow}>
                  {genderOptions.map((opt) => (
                    <Pressable
                      accessibilityRole="button"
                      key={opt.value}
                      onPress={() => setGender(opt.value)}
                      style={[styles.chip, gender === opt.value && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, gender === opt.value && styles.chipTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Input
                editable={!createPetMutation.isPending}
                label="Irk / Cins"
                onChangeText={setBreed}
                placeholder={t("pets.breedPlaceholder")}
                value={breed}
              />

              {/* Datepicker birthDate selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t("onboarding.birthDate")}</Text>
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

              <Input
                editable={!createPetMutation.isPending}
                label={t("pets.microchip")}
                onChangeText={setMicrochipNo}
                placeholder={t("pets.optional")}
                value={microchipNo}
              />
              <Input
                editable={!createPetMutation.isPending}
                label={t("pets.specialNote")}
                multiline
                onChangeText={setNotes}
                placeholder={t("pets.notePlaceholder")}
                value={notes}
              />
            </View>

            {formError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.formActions}>
              <Button
                label={t("common.cancel")}
                variant="ghost"
                onPress={() => { resetForm(); setIsFormOpen(false); }}
                size="md"
                style={styles.formBtnCancel}
              />
              <Button
                disabled={!canSubmit}
                label="Kaydet"
                loading={createPetMutation.isPending}
                onPress={handleCreatePet}
                size="md"
                style={styles.formBtnSave}
              />
            </View>
          </Card>
        ) : (
          /* ── Pet List ── */
          <>
            {petsQuery.isLoading ? <LoadingState label={t("pets.loadingPets")} /> : null}
            {petsQuery.error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{getPetErrorMessage(petsQuery.error)}</Text>
              </View>
            ) : null}

            {/* Empty State */}
            {!petsQuery.isLoading && !petsQuery.error && pets.length === 0 ? (
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon="🐾"
                  title={t("pets.noPetsTitle")}
                  text={t("pets.noPetsDesc")}
                  action={
                    <Button
                      label="Dost Ekle"
                      onPress={() => setIsFormOpen(true)}
                      size="sm"
                    />
                  }
                />
              </View>
            ) : null}

            {/* Pet List */}
            {pets.length > 0 ? (
              <View style={styles.petList}>
                {pets.map((pet) => {
                  const cfg = speciesConfig[pet.species];
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={pet.id}
                      onPress={() => router.push(`/pet/${pet.id}`)}
                      style={({ pressed }) => [styles.petCard, pressed && styles.pressed]}
                    >
                      <View style={[styles.petAvatarBox, { backgroundColor: cfg.color + '18' }]}>
                        <Text style={styles.petEmoji}>{cfg.emoji}</Text>
                      </View>

                      <View style={styles.petInfo}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <Text style={styles.petMeta}>
                          {pet.breed
                            ? pet.breed
                            : pet.species === 'cat' ? 'Kedi' : pet.species === 'dog' ? 'Köpek' :
                              pet.species === 'bird' ? 'Kuş' : pet.species === 'rabbit' ? 'Tavşan' : 'Diğer'}
                          {pet.gender && pet.gender !== 'unknown'
                            ? ` · ${t(`genders.${pet.gender}`)}`
                            : ''}
                        </Text>
                        {pet.notes ? (
                          <Text style={styles.petNotes} numberOfLines={1}>{pet.notes}</Text>
                        ) : null}
                      </View>

                      <View style={styles.petChevron}>
                        <Feather name="chevron-right" size={18} color={colors.textTertiary} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </>
        )}

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
    paddingBottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.xl,
    maxWidth: layout.maxWidth,
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.accent,
  },
  addBtnClose: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    ...shadows.sm,
  },

  // Form Container
  formCard: {
    padding: spacing.lg,
  },
  formFields: {
    gap: spacing.base,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: fontWeight.bold,
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formBtnCancel: {
    flex: 1,
  },
  formBtnSave: {
    flex: 1.5,
  },

  // Error Box
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    padding: spacing.md,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },

  // Empty Wrap
  emptyWrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.sm,
  },

  // Pet List UI
  petList: {
    gap: spacing.md,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    ...shadows.sm,
  },
  petAvatarBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    marginRight: spacing.md,
  },
  petEmoji: {
    fontSize: 30,
  },
  petInfo: {
    flex: 1,
    gap: 3,
  },
  petName: {
    color: colors.textPrimary,
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.black,
  },
  petMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  petNotes: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    fontStyle: 'italic',
    marginTop: 2,
  },
  petChevron: {
    paddingLeft: spacing.sm,
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
