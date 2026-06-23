import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight, radius, shadows, spacing, typography } from '../../lib/theme';

type Segment<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: Array<Segment<T>>;
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  onChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.optionSelected,
              pressed && !isSelected && styles.optionPressed,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  option: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.accent,
    ...shadows.accent,
  },
  optionPressed: {
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
  labelSelected: {
    color: colors.textInverse,
    fontWeight: fontWeight.black,
  },
});
