import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { changeLanguage } from '../../lib/i18n';
import { colors, layout, spacing, typography, fontWeight, radius } from '../../lib/theme';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleSelectLanguage = async (lang: string) => {
    setCurrentLang(lang);
    await changeLanguage(lang);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{t('settings.changeLanguage')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          {t('settings.languageDesc')}
        </Text>

        <View style={styles.optionsContainer}>
          <Pressable 
            style={[styles.optionRow, currentLang === 'en' && styles.optionRowActive]} 
            onPress={() => handleSelectLanguage('en')}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>English</Text>
              <Text style={styles.optionSubtitle}>İngilizce</Text>
            </View>
            {currentLang === 'en' && (
              <Feather name="check" size={20} color={colors.accent} />
            )}
          </Pressable>

          <Pressable 
            style={[styles.optionRow, currentLang === 'tr' && styles.optionRowActive]} 
            onPress={() => handleSelectLanguage('tr')}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Türkçe</Text>
              <Text style={styles.optionSubtitle}>Turkish</Text>
            </View>
            {currentLang === 'tr' && (
              <Feather name="check" size={20} color={colors.accent} />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  description: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  optionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  optionRowActive: {
    backgroundColor: colors.accentSofter,
  },
  optionContent: {
    gap: spacing.xs,
  },
  optionTitle: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
