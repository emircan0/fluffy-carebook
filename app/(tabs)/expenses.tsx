import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius, spacing, typography, fontWeight, shadows, speciesConfig } from '../../lib/theme';
import { usePets } from '../../lib/queries/usePets';
import { useExpenses } from '../../lib/queries/useExpenses';
import { expenseCategoryColors, expenseCategoryIcons, expenseCategoryLabels } from '../../lib/expenses';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { getPetErrorMessage } from '../../lib/pets';
import { usePet } from '../../lib/queries/usePet';
import type { ExpenseCategory } from '../../types/app';

const { width } = Dimensions.get('window');

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  
  const petsQuery = usePets();
  const pets = petsQuery.data ?? [];
  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0];
  const activePetId = selectedPet?.id ?? null;

  const expensesQuery = useExpenses(activePetId);
  const expenses = expensesQuery.data ?? [];
  
  const petQuery = usePet(activePetId ?? undefined);
  const userRole = petQuery.data?.member?.role;
  const canEdit = userRole ? (userRole === 'owner' || userRole === 'editor') : false;

  // Calculate stats
  const { monthlyTotal, categoryTotals } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let mTotal = 0;
    const cTotals: Record<ExpenseCategory, number> = {
      food: 0,
      vet: 0,
      medicine: 0,
      accessory: 0,
      other: 0,
    };

    expenses.forEach(exp => {
      let date: Date;
      // Handle Firestore timestamp vs JS Date
      if (exp.date && typeof exp.date === 'object' && 'toDate' in exp.date) {
        date = (exp.date as any).toDate();
      } else {
        date = new Date(exp.date as string | number);
      }

      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        mTotal += exp.amount;
        cTotals[exp.category] = (cTotals[exp.category] || 0) + exp.amount;
      }
    });

    return { monthlyTotal: mTotal, categoryTotals: cTotals };
  }, [expenses]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + spacing.lg, 64) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Masraflar</Text>
            <Text style={styles.subtitle}>
              {selectedPet ? `${selectedPet.name} ${t('expenses.forPet')}` : t('expenses.selectPet')}
            </Text>
          </View>
        </View>

        {/* Pet Scroller */}
        {pets.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petScroller}
          >
            {pets.map((pet) => {
              const isSelected = pet.id === activePetId;
              const cfg = speciesConfig[pet.species];

              return (
                <Pressable
                  key={pet.id}
                  onPress={() => setSelectedPetId(pet.id)}
                  style={({ pressed }) => [
                    styles.petChip,
                    isSelected && styles.petChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.petChipAvatar, { backgroundColor: cfg.color + '18' }]}>
                    <Text style={styles.petChipEmoji}>{cfg.emoji}</Text>
                  </View>
                  <Text style={[styles.petChipName, isSelected && styles.petChipNameSelected]}>
                    {pet.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {petsQuery.isLoading && <LoadingState label={t("expenses.loading")} />}
        {petsQuery.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{getPetErrorMessage(petsQuery.error)}</Text>
          </View>
        )}

        {!petsQuery.isLoading && !petsQuery.error && pets.length === 0 ? (
          <Card>
            <EmptyState
              icon="🐾"
              title={t("expenses.noPetTitle")}
              text={t("expenses.noPetDesc")}
            />
          </Card>
        ) : null}

        {selectedPet ? (
          <>
            {/* Monthly Total Card */}
            <View style={styles.totalCard}>
              <View style={styles.totalCardTop}>
                <Feather name="pie-chart" size={24} color="rgba(255,255,255,0.8)" />
                <Text style={styles.totalLabel}>Bu Ayki Toplam</Text>
              </View>
              <Text style={styles.totalAmount}>₺{monthlyTotal.toLocaleString('tr-TR')}</Text>
              <Text style={styles.totalSubtext}>{new Date().toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}</Text>
            </View>

            {/* Category Breakdown */}
            {monthlyTotal > 0 ? (
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>{t('expenses.categoryDistribution')}</Text>
                <View style={styles.categoryList}>
                  {Object.entries(categoryTotals)
                    .filter(([_, amount]) => amount > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => {
                      const category = cat as ExpenseCategory;
                      const percentage = Math.round((amount / monthlyTotal) * 100);
                      
                      return (
                        <View key={category} style={styles.categoryRow}>
                          <View style={[styles.categoryIconWrap, { backgroundColor: expenseCategoryColors[category] + '20' }]}>
                            <Text style={styles.categoryIcon}>{expenseCategoryIcons[category]}</Text>
                          </View>
                          <View style={styles.categoryInfo}>
                            <View style={styles.categoryHeader}>
                              <Text style={styles.categoryName}>{expenseCategoryLabels[category]}</Text>
                              <Text style={styles.categoryAmount}>₺{amount.toLocaleString('tr-TR')}</Text>
                            </View>
                            <View style={styles.progressTrack}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${percentage}%`, backgroundColor: expenseCategoryColors[category] }
                                ]} 
                              />
                            </View>
                          </View>
                        </View>
                      );
                  })}
                </View>
              </View>
            ) : null}

            {/* Recent Expenses List */}
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>{t('expenses.allExpenses')}</Text>
              {expensesQuery.isLoading ? (
                <LoadingState label={t("expenses.loadingExpenses")} />
              ) : expensesQuery.error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    Masraflar yüklenirken bir hata oluştu: {expensesQuery.error.message}
                  </Text>
                </View>
              ) : expenses.length === 0 ? (
                <Card>
                  <EmptyState
                    icon="💸"
                    title={t("expenses.noExpensesTitle")}
                    text={t("expenses.noExpensesDesc")}
                  />
                </Card>
              ) : (
                <View style={styles.expenseList}>
                  {expenses.map(expense => {
                    let d: Date;
                    if (expense.date && typeof expense.date === 'object' && 'toDate' in expense.date) {
                      d = (expense.date as any).toDate();
                    } else {
                      d = new Date(expense.date as string | number);
                    }
                    const isCurrentMonth = d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();

                    return (
                      <Pressable 
                        key={expense.id}
                        onPress={() => router.push(`/expense/${expense.id}`)}
                        style={({ pressed }) => [styles.expenseCard, pressed && styles.pressed]}
                      >
                        <View style={[styles.expenseIconWrap, { backgroundColor: expenseCategoryColors[expense.category] + '18' }]}>
                          <Text style={styles.expenseIcon}>{expenseCategoryIcons[expense.category]}</Text>
                        </View>
                        <View style={styles.expenseContent}>
                          <Text style={styles.expenseTitle}>{expense.title}</Text>
                          <Text style={styles.expenseDate}>
                            {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            {expense.notes ? ` · ${expense.notes}` : ''}
                          </Text>
                        </View>
                        <Text style={[styles.expenseAmountText, !isCurrentMonth && styles.expenseAmountTextMuted]}>
                          ₺{expense.amount.toLocaleString('tr-TR')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* FAB */}
      {selectedPet && canEdit ? (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push({ pathname: '/expense/new', params: { petId: selectedPet.id } })}
        >
          <Feather name="plus" size={24} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
    gap: spacing.xl,
  },
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
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
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
    minWidth: 100,
    ...shadows.sm,
  },
  petChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSofter,
    ...shadows.accent,
  },
  petChipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petChipEmoji: {
    fontSize: 12,
  },
  petChipName: {
    fontSize: typography.caption,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  petChipNameSelected: {
    color: colors.accentDark,
    fontWeight: fontWeight.bold,
  },
  pressed: {
    opacity: 0.7,
  },
  totalCard: {
    padding: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.xxl,
    ...shadows.lg,
    overflow: 'hidden',
  },
  totalCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.medium,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },
  totalAmount: {
    fontSize: typography.display,
    fontWeight: fontWeight.black,
    color: colors.white,
    letterSpacing: -1,
  },
  totalSubtext: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  categoriesSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  categoryList: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  categoryName: {
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  categoryAmount: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceBorder,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  recentSection: {
    gap: spacing.md,
  },
  expenseList: {
    gap: spacing.sm,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.xxl,
    gap: spacing.md,
    ...shadows.sm,
  },
  expenseIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIcon: {
    fontSize: 22,
  },
  expenseContent: {
    flex: 1,
    gap: 2,
  },
  expenseTitle: {
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  expenseDate: {
    fontSize: typography.micro,
    color: colors.textSecondary,
  },
  expenseAmountText: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  expenseAmountTextMuted: {
    color: colors.textSecondary,
  },
  errorBox: {
    backgroundColor: colors.danger + '18',
    padding: spacing.md,
    borderRadius: radius.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: colors.black,
  },
});
