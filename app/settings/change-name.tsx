import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, layout, spacing, typography, fontWeight } from '../../lib/theme';

export default function ChangeNameScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, updateName } = useAuth();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.fullName) {
      setName(profile.fullName);
    }
  }, [profile?.fullName]);

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg(t('settings.emptyNameError'));
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await updateName(name);
      router.back();
    } catch (error: any) {
      setErrorMsg(error.message || t('settings.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{t('settings.changeNameTitle')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            {t('settings.changeNameDesc')}
          </Text>

          <Input
            label={t('settings.nameLabel')}
            placeholder={t('settings.namePlaceholder')}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <Button
            label={t('settings.save')}
            onPress={handleSave}
            loading={isSaving}
            disabled={!name.trim() || isSaving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
