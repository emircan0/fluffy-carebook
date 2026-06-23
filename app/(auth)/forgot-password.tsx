import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { colors, fontWeight, layout, radius, shadows, spacing, typography } from '../../lib/theme';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { authError, isAuthLoading, resetPassword, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  // Clear errors when screen is mounted or destroyed
  useEffect(() => {
    setAuthError(null);
    return () => setAuthError(null);
  }, [setAuthError]);

  const canSubmit = email.trim().length > 0 && email.includes('@');

  async function handleSubmit() {
    if (!canSubmit || isAuthLoading) return;
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      // Error is handled by setAuthError inside resetPassword, we just prevent switching to success
      setSuccess(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      style={styles.keyboard}
    >
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Back Navigation Header */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            <Text style={styles.backText}>{t('auth.goBack')}</Text>
          </Pressable>

          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🔑</Text>
            </View>
            <Text style={styles.wordmark}>YuvioPet</Text>
            <Text style={styles.hero}>{t('auth.forgotPasswordTitle')}</Text>
            <Text style={styles.tagline}>
              {t('auth.forgotPasswordTagline')}
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {success ? (
              <View style={styles.successContainer}>
                <View style={styles.successBox}>
                  <Text style={styles.successTitle}>{t('auth.linkSent')}</Text>
                  <Text style={styles.successText}>
                    {t('auth.linkSentDesc')}
                  </Text>
                </View>
                <Button
                  label={t("auth.backToLogin")}
                  onPress={() => router.replace('/login')}
                  size="lg"
                  variant="primary"
                />
              </View>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.form}>
                  <Input
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isAuthLoading}
                    keyboardType="email-address"
                    label={t("auth.email")}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (authError) setAuthError(null);
                    }}
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                  />
                </View>

                {authError ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{authError}</Text>
                  </View>
                ) : null}

                <Button
                  disabled={!canSubmit || isAuthLoading}
                  label={t("auth.sendResetLink")}
                  loading={isAuthLoading}
                  onPress={handleSubmit}
                  size="lg"
                />
              </View>
            )}
          </View>

          {/* Footer Actions */}
          {!success && (
            <View style={styles.footerContainer}>
              <Button
                disabled={isAuthLoading}
                label={t("auth.backToLoginSubtle")}
                onPress={() => router.back()}
                size="md"
                variant="subtle"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
    paddingVertical: spacing.xxxl,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.xxl,
    maxWidth: layout.formWidth,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  backText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.semibold,
  },
  brand: {
    gap: spacing.md,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '30',
    ...shadows.accent,
  },
  logoEmoji: {
    fontSize: 32,
  },
  wordmark: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  hero: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: fontWeight.black,
    lineHeight: 46,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.xl,
    gap: spacing.xl,
    ...shadows.md,
  },
  formContainer: {
    gap: spacing.xl,
  },
  form: {
    gap: spacing.base,
  },
  successContainer: {
    gap: spacing.xl,
  },
  successBox: {
    backgroundColor: colors.successBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.success + '30',
    padding: spacing.md,
    gap: spacing.sm,
  },
  successTitle: {
    color: colors.success,
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
  },
  successText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
  },
  footerContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
});
