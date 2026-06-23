import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeDateTimePicker as DateTimePicker } from '../../components/ui/SafeDateTimePicker';

import { colors, layout, radius, spacing, typography, fontWeight, shadows } from '../../lib/theme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { usePets } from '../../lib/queries/usePets';
import { useCreateExpense } from '../../lib/mutations/useCreateExpense';
import { useUpdateExpense } from '../../lib/mutations/useUpdateExpense';
import { useDeleteExpense } from '../../lib/mutations/useDeleteExpense';
import { usePet } from '../../lib/queries/usePet';
import { useAuthStore } from '../../store/authStore';
import { expenseCategoryColors, expenseCategoryIcons, expenseCategoryLabels } from '../../lib/expenses';
import type { ExpenseCategory, Expense } from '../../types/app';
import { useExpenses } from '../../lib/queries/useExpenses';

export default function ExpenseFormScreen() {
  const router = useRouter();
  const { id, petId } = useLocalSearchParams<{ id: string; petId?: string }>();
  
  const isNew = id === 'new';
  
  const petsQuery = usePets();
  const pets = petsQuery.data ?? [];
  const selectedPet = pets.find((p) => p.id === petId) || pets[0];
  const activePetId = selectedPet?.id ?? null;

  const expensesQuery = useExpenses(activePetId);
  const expenseToEdit = expensesQuery.data?.find(e => e.id === id);

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const petQuery = usePet(activePetId ?? undefined);
  const userRole = petQuery.data?.member?.role;
  const canEdit = userRole ? (userRole === 'owner' || userRole === 'editor') : false;
  const currentUser = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load data for edit mode
  useEffect(() => {
    if (!isNew && expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setNotes(expenseToEdit.notes || '');
      
      let expDate: Date;
      if (expenseToEdit.date && typeof expenseToEdit.date === 'object' && 'toDate' in expenseToEdit.date) {
        expDate = (expenseToEdit.date as any).toDate();
      } else {
        expDate = new Date(expenseToEdit.date as string | number);
      }
      setDate(expDate);
    }
  }, [isNew, expenseToEdit]);

  useEffect(() => {
    console.log('--- DEBUG INFO ---');
    console.log('Current User UID:', currentUser?.uid);
    console.log('Selected Pet ID:', activePetId);
    console.log('Pet Owner ID:', petQuery.data?.pet?.ownerId);
    console.log('User Role in Member Doc:', petQuery.data?.member?.role);
    console.log('User Status in Member Doc:', petQuery.data?.member?.status);
    console.log('canEdit evaluated:', canEdit);
    console.log('------------------');
  }, [petQuery.data, activePetId, canEdit, currentUser]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!activePetId) return;
    
    if (!title.trim()) {
      setFormError('Masraf başlığı zorunlu.');
      return;
    }
    
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setFormError('Geçerli bir tutar girmelisiniz.');
      return;
    }

    setFormError(null);

    try {
      if (isNew) {
        await createExpenseMutation.mutateAsync({
          petId: activePetId,
          title: title.trim(),
          amount: amountVal,
          category,
          date,
          notes: notes.trim() || undefined,
        });
      } else {
        await updateExpenseMutation.mutateAsync({
          petId: activePetId,
          expenseId: id,
          title: title.trim(),
          amount: amountVal,
          category,
          date,
          notes: notes.trim() || undefined,
        });
      }
      router.back();
    } catch (error: any) {
      setFormError(error.message || 'Bir hata oluştu.');
    }
  };

  const handleDelete = () => {
    if (!activePetId || isNew) return;
    
    Alert.alert('Sil', 'Bu masrafı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpenseMutation.mutateAsync({ petId: activePetId, expenseId: id });
            router.back();
          } catch (error: any) {
            setFormError(error.message || 'Silinirken bir hata oluştu.');
          }
        }
      }
    ]);
  };

  const isSaving = createExpenseMutation.isPending;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{isNew ? 'Yeni Masraf' : 'Masraf Detayı'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryGrid}>
            {(Object.keys(expenseCategoryLabels) as ExpenseCategory[]).map(cat => (
              <Pressable
                key={cat}
                disabled={!canEdit || isSaving || updateExpenseMutation.isPending}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                  (!canEdit || isSaving || updateExpenseMutation.isPending) && { opacity: 0.7 },
                  { borderColor: category === cat ? expenseCategoryColors[cat] : colors.surfaceBorder }
                ]}
              >
                <Text style={styles.categoryEmoji}>{expenseCategoryIcons[cat]}</Text>
                <Text style={[styles.categoryLabel, category === cat && { color: expenseCategoryColors[cat] }]}>
                  {expenseCategoryLabels[cat]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Input
          editable={!isSaving && !updateExpenseMutation.isPending && canEdit}
          label="Tutar (₺)"
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          placeholder="0.00"
          value={amount}
          style={styles.amountInput}
        />

        <Input
          editable={!isSaving && !updateExpenseMutation.isPending && canEdit}
          label="Başlık"
          onChangeText={setTitle}
          placeholder="Örn: Royal Canin 15kg"
          value={title}
        />

        {/* Date Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>Tarih</Text>
          <Pressable 
            disabled={!canEdit || isSaving || updateExpenseMutation.isPending}
            onPress={() => setShowDatePicker(true)} 
            style={[
              styles.pickerTrigger,
              (!canEdit || isSaving || updateExpenseMutation.isPending) && styles.pickerTriggerDisabled
            ]}
          >
            <Feather name="calendar" size={16} color={colors.textSecondary} />
            <Text style={styles.pickerTriggerText}>
              {date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </Pressable>
        </View>

        <Input
          editable={!isSaving && !updateExpenseMutation.isPending && canEdit}
          label="Özel Not"
          multiline
          onChangeText={setNotes}
          placeholder="İsteğe bağlı..."
          value={notes}
        />

        {formError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        ) : null}
      </ScrollView>

      {canEdit ? (
        <View style={styles.footer}>
          {isNew ? (
            <Button
              disabled={!title.trim() || !amount.trim() || isSaving}
              label="Kaydet"
              loading={isSaving}
              onPress={handleSubmit}
              size="lg"
              style={styles.saveButton}
            />
          ) : (
            <View style={styles.actionButtonsStacked}>
              <Button
                disabled={!title.trim() || !amount.trim() || isSaving || updateExpenseMutation.isPending}
                label="Değişiklikleri Kaydet"
                loading={updateExpenseMutation.isPending}
                onPress={handleSubmit}
                size="lg"
                variant="primary"
                style={styles.saveButton}
              />
              <Button
                disabled={deleteExpenseMutation.isPending || isSaving || updateExpenseMutation.isPending}
                label="Masrafı Sil"
                loading={deleteExpenseMutation.isPending}
                onPress={handleDelete}
                size="lg"
                variant="danger"
                style={styles.deleteButton}
              />
            </View>
          )}
        </View>
      ) : null}

      {/* Android / Web Inline DatePicker */}
      {showDatePicker && Platform.OS !== 'ios' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onValueChange={onDateChange}
        />
      )}

      {/* iOS Modal DatePicker */}
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
                <Text style={styles.modalTitle}>Tarih Seçin</Text>
                <Pressable onPress={() => setShowDatePicker(false)} style={styles.modalDoneBtn}>
                  <Text style={styles.modalDoneText}>Tamam</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onValueChange={onDateChange}
                textColor={colors.textPrimary}
                style={{ height: 200, width: '100%' }}
                locale="tr-TR"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    padding: layout.screenPadding,
    gap: spacing.xl,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: fontWeight.bold,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    ...shadows.sm,
  },
  categoryChipSelected: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    ...shadows.md,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  pickerTriggerDisabled: {
    opacity: 0.7,
    backgroundColor: colors.background,
  },
  pickerTriggerText: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  errorBox: {
    backgroundColor: colors.danger + '18',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.micro,
  },
  footer: {
    padding: layout.screenPadding,
    paddingBottom: Platform.OS === 'ios' ? 34 : layout.screenPadding,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  saveButton: {
    width: '100%',
  },
  deleteButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  modalTitle: {
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  modalDoneBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modalDoneText: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.accent,
  },
  actionButtonsStacked: {
    gap: spacing.sm,
    width: '100%',
  },
});
