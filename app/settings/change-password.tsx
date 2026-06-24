import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, layout, spacing, typography, fontWeight } from '../../lib/theme';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { changePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    if (!currentPassword) {
      setErrorMsg(t('settings.emptyCurrentPassword'));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg(t('settings.passwordLengthError'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(t('settings.passwordMatchError'));
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert(t('settings.success'), t('settings.passwordUpdateSuccess'), [
        { text: t('settings.ok'), onPress: () => router.back() }
      ]);
    } catch (error: any) {
      setErrorMsg(error.message || t('settings.passwordUpdateError'));
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
        <Text style={styles.topBarTitle}>{t('settings.changePasswordTitle')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            {t('settings.changePasswordDesc')}
          </Text>

          <View style={styles.form}>
            <Input
              label={t('settings.currentPassword')}
              placeholder={t('settings.currentPasswordPlaceholder')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label={t('settings.newPassword')}
              placeholder={t('settings.newPasswordPlaceholder')}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label={t('settings.newPasswordConfirm')}
              placeholder={t('settings.newPasswordConfirmPlaceholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <Button
            label={t('settings.updatePasswordBtn')}
            onPress={handleSave}
            loading={isSaving}
            disabled={!currentPassword || !newPassword || !confirmPassword || isSaving}
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
  form: {
    gap: spacing.md,
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
