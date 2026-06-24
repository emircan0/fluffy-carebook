import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { firebaseConfigError } from '../../lib/auth';
import { changeLanguage } from '../../lib/i18n';
import { acceptInvite } from '../../lib/invites';
import { useAuthStore } from '../../store/authStore';
import { colors, fontWeight, layout, radius, shadows, spacing, typography } from '../../lib/theme';

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

if (googleWebClientId || googleIosClientId) {
  try {
    GoogleSignin.configure({
      webClientId: googleWebClientId,
      iosClientId: googleIosClientId,
    });
  } catch (error) {
    console.error('Google Sign-In configuration error:', error);
  }
}

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const {
    authError,
    isAuthLoading,
    register,
    signIn,
    signInAsGuest,
    signInWithGoogle,
    signInWithApple,
    setAuthError,
  } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const isRegister = mode === 'register';
  const buttonLabel = isRegister ? t('auth.createAccount') : t('auth.login');
  
  const normalizedInviteCode = inviteCode.replace(/\s+/g, '').toUpperCase();
  const isInviteCodeValid = normalizedInviteCode.length === 0 || normalizedInviteCode.length === 6;

  const canSubmit = useMemo(() => {
    if (!email.trim() || password.length < 6) return false;
    return isRegister ? Boolean(fullName.trim()) && acceptedTerms && isInviteCodeValid : true;
  }, [email, fullName, isRegister, password, acceptedTerms, isInviteCodeValid]);
  const configMissing = authError === firebaseConfigError;

  async function handleSubmit() {
    if (!canSubmit || isAuthLoading) return;
    if (isRegister) {
      await register(email, password, fullName);
      const authErrorState = useAuthStore.getState().authError;
      const userState = useAuthStore.getState().user;
      const profileState = useAuthStore.getState().profile;
      
      if (!authErrorState && userState && normalizedInviteCode.length === 6) {
        try {
          await acceptInvite(userState.uid, profileState, normalizedInviteCode);
        } catch (error: any) {
          alert('Hesabınız oluşturuldu ancak davet kodu geçersiz veya süresi dolmuş. Pets ekranından tekrar deneyebilirsiniz.');
        }
      }
      return;
    }
    await signIn(email, password);
  }

  const handleGoogleSignIn = async () => {
    console.log('Google Sign-In Triggered');
    console.log('Env Web Client ID:', googleWebClientId);
    console.log('Env iOS Client ID:', googleIosClientId);

    if (!googleWebClientId && !googleIosClientId) {
      setAuthError(t('auth.missingGoogleClientId'));
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log('GoogleSignin.signIn raw response:', JSON.stringify(response));
      
      const idToken = response.data?.idToken || (response as any).idToken;
      if (idToken) {
        await signInWithGoogle(idToken);
      } else {
        throw new Error(t('auth.missingIdToken'));
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setAuthError(t('auth.googlePlayMissing'));
      } else {
        setAuthError(t('auth.googleError'));
        console.error(error);
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        await signInWithApple(credential.identityToken);
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      setAuthError(t('auth.appleError'));
    }
  };

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
          <View style={styles.brand}>
            <View style={styles.brandHeaderRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoEmoji}>🐾</Text>
              </View>

              <View style={styles.langSelector}>
                <Pressable
                  onPress={() => changeLanguage('tr')}
                  style={[styles.langOption, i18n.language.startsWith('tr') && styles.langOptionActive]}
                >
                  <Text style={[styles.langOptionText, i18n.language.startsWith('tr') && styles.langOptionTextActive]}>TR</Text>
                </Pressable>
                <View style={styles.langDivider} />
                <Pressable
                  onPress={() => changeLanguage('en')}
                  style={[styles.langOption, i18n.language.startsWith('en') && styles.langOptionActive]}
                >
                  <Text style={[styles.langOptionText, i18n.language.startsWith('en') && styles.langOptionTextActive]}>EN</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.wordmark}>YuvioPet</Text>
            <Text style={styles.hero}>{t('auth.welcome')}</Text>
            <Text style={styles.tagline}>
              {isRegister
                ? t('auth.taglineRegister')
                : t('auth.taglineLogin')}
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {configMissing ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>{t('auth.firebaseMissing')}</Text>
                <Text style={styles.warningText}>{t('auth.checkEnv')}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {isRegister ? (
                <Input
                  autoCapitalize="words"
                  editable={!isAuthLoading}
                  label={t("auth.fullName")}
                  onChangeText={setFullName}
                  placeholder={t("auth.fullNamePlaceholder")}
                  value={fullName}
                />
              ) : null}

              <Input
                autoCapitalize="none"
                autoComplete="email"
                editable={!isAuthLoading}
                keyboardType="email-address"
                label={t("auth.email")}
                onChangeText={setEmail}
                placeholder={t("auth.emailPlaceholder")}
                value={email}
              />

              <Input
                autoCapitalize="none"
                editable={!isAuthLoading}
                label={t("auth.password")}
                onChangeText={setPassword}
                placeholder={t("auth.passwordPlaceholder")}
                secureTextEntry
                value={password}
                hint={isRegister ? t('auth.passwordHint') : undefined}
              />

              {isRegister ? (
                <Input
                  autoCapitalize="characters"
                  editable={!isAuthLoading}
                  label="Davet Kodu (İsteğe Bağlı)"
                  onChangeText={setInviteCode}
                  placeholder="Örn: A7X9K2"
                  value={inviteCode}
                  maxLength={6}
                />
              ) : null}

              {isRegister && (
                <Pressable 
                  style={styles.checkboxContainer} 
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                    {acceptedTerms && <Feather name="check" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {t('auth.termsPrefix')}
                    <Text 
                      style={styles.linkText} 
                      onPress={() => Linking.openURL('https://petapp-54886.web.app/terms')}
                    >
                      {t('auth.terms')}
                    </Text>
                    {t('auth.and')}
                    <Text 
                      style={styles.linkText} 
                      onPress={() => Linking.openURL('https://petapp-54886.web.app/privacy')}
                    >
                      {t('auth.privacy')}
                    </Text>
                    {t('auth.termsSuffix')}
                  </Text>
                </Pressable>
              )}

              {!isRegister && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/forgot-password')}
                  style={styles.forgotPasswordPressable}
                >
                  <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                </Pressable>
              )}
            </View>

            {authError && !configMissing ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            <Button
              disabled={!canSubmit || isAuthLoading || configMissing}
              label={buttonLabel}
              loading={isAuthLoading}
              onPress={handleSubmit}
              size="lg"
            />
          </View>

          {/* Apple-like Muted Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign-in Methods (Apple & Google) */}
          <View style={styles.socialButtonsContainer}>
            {Platform.OS === 'ios' && (
              <Pressable
                accessibilityRole="button"
                disabled={isAuthLoading || configMissing}
                onPress={handleAppleSignIn}
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.appleButton,
                  pressed && styles.socialButtonPressed,
                ]}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.appleButtonText}>{t('auth.continueWithApple')}</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={isAuthLoading || configMissing}
              onPress={handleGoogleSignIn}
              style={({ pressed }) => [
                styles.socialButton,
                styles.googleButton,
                pressed && styles.socialButtonPressed,
              ]}
            >
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
            </Pressable>
          </View>

          {/* Secondary Actions / Footer */}
          <View style={styles.footerContainer}>
            <Button
              disabled={isAuthLoading || configMissing}
              label={t("auth.continueAsGuest")}
              onPress={signInAsGuest}
              size="md"
              variant="subtle"
            />

            <Pressable
              accessibilityRole="button"
              disabled={isAuthLoading}
              onPress={() => setMode(isRegister ? 'login' : 'register')}
              style={styles.switchRow}
            >
              <Text style={styles.switchText}>
                {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
                <Text style={styles.switchLink}>
                  {isRegister ? t('auth.doLogin') : t('auth.doRegister')}
                </Text>
              </Text>
            </Pressable>
          </View>
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

  // Decorative background circles for depth
  container: {
    alignSelf: 'center',
    gap: spacing.xxl,
    maxWidth: layout.formWidth,
    width: '100%',
  },

  // Brand
  brand: {
    gap: spacing.md,
  },
  brandHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    height: 32,
  },
  langOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 28,
  },
  langOptionActive: {
    backgroundColor: colors.accent,
  },
  langOptionText: {
    fontSize: typography.micro,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  langOptionTextActive: {
    color: colors.textInverse,
  },
  langDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.surfaceBorder,
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

  // Form card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.xl,
    gap: spacing.xl,
    ...shadows.md,
  },
  form: {
    gap: spacing.base,
  },

  // Warning / error
  warningBox: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
    padding: spacing.md,
    gap: spacing.xs,
  },
  warningTitle: {
    color: colors.warning,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  warningText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
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

  // Switch mode
  switchRow: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  switchLink: {
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
  forgotPasswordPressable: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    paddingVertical: spacing.xs,
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  dividerText: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },
  socialButtonsContainer: {
    gap: spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  socialButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.body,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    ...shadows.sm,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontWeight: fontWeight.bold,
    fontSize: typography.body,
  },
  footerContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingRight: spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceRaised,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    flexShrink: 1,
    lineHeight: 18,
  },
  linkText: {
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
});
