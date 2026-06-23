import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Badge } from '../ui/Badge';
import { colors, fontWeight, radius, shadows, spacing, speciesConfig, typography } from '../../lib/theme';
import type { Pet, PetRole } from '../../types/app';

const speciesLabels: Record<Pet['species'], string> = {
  cat: 'Kedi', dog: 'Köpek', bird: 'Kuş', rabbit: 'Tavşan', other: 'Diğer',
};
const genderLabels: Record<Pet['gender'], string> = {
  male: '♂ Erkek', female: '♀ Dişi', unknown: 'Bilinmiyor',
};
const roleLabels: Record<PetRole, string> = {
  owner: 'Sahip', editor: 'Editör', viewer: 'Görüntüleyen',
};
const roleBadgeVariants: Record<PetRole, 'roleOwner' | 'roleEditor' | 'roleViewer'> = {
  owner: 'roleOwner', editor: 'roleEditor', viewer: 'roleViewer',
};

type PetCardProps = {
  isSelected?: boolean;
  onPress?: () => void;
  pet: Pet;
  role?: PetRole | null;
};

export function PetCard({ isSelected = false, onPress, pet, role }: PetCardProps) {
  const cfg = speciesConfig[pet.species];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {/* Species color strip */}
      <View style={[styles.strip, { backgroundColor: cfg.color }]} />

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: cfg.color + '20' }]}>
            <Text style={styles.avatarText}>{cfg.emoji}</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{pet.name}</Text>
            <Text style={styles.species}>{speciesLabels[pet.species]}</Text>
          </View>
          {role ? <Badge label={roleLabels[role]} variant={roleBadgeVariants[role]} /> : null}
          <Feather name="chevron-right" size={18} color={colors.textTertiary} />
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaItem}>{genderLabels[pet.gender]}</Text>
          {pet.breed ? <Text style={styles.metaItem}>{pet.breed}</Text> : null}
          {pet.microchipNo ? <Text style={styles.metaItem}>Çip: {pet.microchipNo}</Text> : null}
        </View>

        {pet.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{pet.notes}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...shadows.sm,
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSofter,
  },
  pressed: {
    opacity: 0.78,
  },
  strip: {
    width: 4,
    alignSelf: 'stretch',
  },
  inner: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    fontSize: 28,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.black,
  },
  species: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  notes: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
});
