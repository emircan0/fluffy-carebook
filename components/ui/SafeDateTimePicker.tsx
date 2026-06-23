import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, UIManager } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fontWeight, radius, spacing, typography } from '../../lib/theme';
import { Feather } from '@expo/vector-icons';

type SafeDateTimePickerProps = {
  value: Date;
  onChange?: (event: any, date?: Date) => void;
  onValueChange?: (event: any, date?: Date) => void; // Support both naming variants in the app
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
  minimumDate?: Date;
  maximumDate?: Date;
  textColor?: string;
  style?: any;
  locale?: string;
  is24Hour?: boolean;
};

export function SafeDateTimePicker({
  value,
  onChange,
  onValueChange,
  mode = 'date',
  display,
  minimumDate,
  maximumDate,
  textColor,
  style,
  locale,
  ...props
}: SafeDateTimePickerProps) {
  // Check if native RNDateTimePicker is available
  const hasNative = React.useMemo(() => {
    try {
      return !!(UIManager.getViewManagerConfig && UIManager.getViewManagerConfig('RNDateTimePicker'));
    } catch (e) {
      return false;
    }
  }, []);

  const handleOnChange = (event: any, date?: Date) => {
    if (onChange) {
      onChange(event, date);
    }
    if (onValueChange) {
      onValueChange(event, date);
    }
  };

  if (hasNative) {
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display={display}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        textColor={textColor}
        style={style}
        locale={locale}
        onChange={handleOnChange}
        {...props}
      />
    );
  }

  // Fallback JavaScript Picker
  return (
    <JSDatePickerFallback
      value={value}
      onChange={handleOnChange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
    />
  );
}

function JSDatePickerFallback({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const [day, setDay] = useState(value.getDate());
  const [month, setMonth] = useState(value.getMonth()); // 0-indexed
  const [year, setYear] = useState(value.getFullYear());

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Helper to validate and fire onChange
  const updateDate = (newDay: number, newMonth: number, newYear: number) => {
    // Determine max days in the month/year
    const maxDays = new Date(newYear, newMonth + 1, 0).getDate();
    let validatedDay = newDay;
    if (validatedDay > maxDays) validatedDay = maxDays;
    if (validatedDay < 1) validatedDay = 1;

    const newDate = new Date(newYear, newMonth, validatedDay);
    
    // Check min/max bounds
    if (minimumDate && newDate < minimumDate) {
      return;
    }
    if (maximumDate && newDate > maximumDate) {
      return;
    }

    setDay(validatedDay);
    setMonth(newMonth);
    setYear(newYear);
    onChange({ type: 'set' }, newDate);
  };

  const handleDayChange = (direction: 'up' | 'down') => {
    const maxDays = new Date(year, month + 1, 0).getDate();
    let nextDay = day + (direction === 'up' ? 1 : -1);
    if (nextDay > maxDays) nextDay = 1;
    if (nextDay < 1) nextDay = maxDays;
    updateDate(nextDay, month, year);
  };

  const handleMonthChange = (direction: 'up' | 'down') => {
    let nextMonth = month + (direction === 'up' ? 1 : -1);
    if (nextMonth > 11) nextMonth = 0;
    if (nextMonth < 0) nextMonth = 11;
    updateDate(day, nextMonth, year);
  };

  const handleYearChange = (direction: 'up' | 'down') => {
    const nextYear = year + (direction === 'up' ? 1 : -1);
    updateDate(day, month, nextYear);
  };

  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.pickerColumn}>
        <Text style={styles.columnLabel}>GÜN</Text>
        <Pressable onPress={() => handleDayChange('up')} style={styles.arrowBtn}>
          <Feather name="chevron-up" size={20} color={colors.accent} />
        </Pressable>
        <Text style={styles.columnValue}>{String(day).padStart(2, '0')}</Text>
        <Pressable onPress={() => handleDayChange('down')} style={styles.arrowBtn}>
          <Feather name="chevron-down" size={20} color={colors.accent} />
        </Pressable>
      </View>

      <View style={[styles.pickerColumn, { flex: 1.5 }]}>
        <Text style={styles.columnLabel}>AY</Text>
        <Pressable onPress={() => handleMonthChange('up')} style={styles.arrowBtn}>
          <Feather name="chevron-up" size={20} color={colors.accent} />
        </Pressable>
        <Text style={styles.columnValue} numberOfLines={1}>{months[month]}</Text>
        <Pressable onPress={() => handleMonthChange('down')} style={styles.arrowBtn}>
          <Feather name="chevron-down" size={20} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.pickerColumn}>
        <Text style={styles.columnLabel}>YIL</Text>
        <Pressable onPress={() => handleYearChange('up')} style={styles.arrowBtn}>
          <Feather name="chevron-up" size={20} color={colors.accent} />
        </Pressable>
        <Text style={styles.columnValue}>{year}</Text>
        <Pressable onPress={() => handleYearChange('down')} style={styles.arrowBtn}>
          <Feather name="chevron-down" size={20} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    minHeight: 180,
    width: '100%',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  columnLabel: {
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  arrowBtn: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  columnValue: {
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginVertical: spacing.xs,
    textAlign: 'center',
  },
});
