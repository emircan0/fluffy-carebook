import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, layout, spacing, typography, fontWeight, radius } from '../../lib/theme';

export default function DeactivateAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { deactivateWithPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDeactivate = async () => {
    if (!password) {
      setErrorMsg(t('settings.deactivatePasswordError'));
      return;
    }

    Alert.alert(
      t('settings.deactivateConfirmTitle'),
      t('settings.deactivateConfirmDesc'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.deactivateBtn'),
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            setErrorMsg(null);

            try {
              await deactivateWithPassword(password);
              // Router push will happen implicitly via auth state change listener in RouteGuard usually, 
              // but we don't need to do anything here because useAuth logs out on success.
            } catch (error: any) {
              setErrorMsg(error.message || t('settings.deactivateError'));
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>{t('settings.deactivateTitle')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.warningCard}>
            <Feather name="alert-triangle" size={24} color={colors.danger} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>{t('settings.deactivateWarningTitle')}</Text>
              <Text style={styles.warningDesc}>
                {t('settings.deactivateWarningDesc')}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            {t('settings.deactivateDesc')}
          </Text>

          <Input
            label={t('settings.currentPassword')}
            placeholder={t('settings.currentPasswordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <Button
            label={t('settings.deactivateBtn')}
            onPress={handleDeactivate}
            loading={isSaving}
            disabled={!password || isSaving}
            variant="danger"
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
  warningCard: {
    backgroundColor: colors.danger + '10',
    borderWidth: 1,
    borderColor: colors.danger + '30',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  warningTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  warningTitle: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    color: colors.danger,
  },
  warningDesc: {
    fontSize: typography.caption,
    color: colors.danger,
    lineHeight: 18,
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
