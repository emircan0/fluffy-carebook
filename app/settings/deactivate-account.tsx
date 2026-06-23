import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, layout, spacing, typography, fontWeight, radius } from '../../lib/theme';

export default function DeactivateAccountScreen() {
  const router = useRouter();
  const { deactivateWithPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDeactivate = async () => {
    if (!password) {
      setErrorMsg('İşleme devam etmek için şifrenizi girmelisiniz.');
      return;
    }

    Alert.alert(
      'Hesabı Sil',
      'Hesabınız uygulamada pasife alınacak ve oturumunuz kapatılacaktır. Verileriniz güvenlik ve kayıt bütünlüğü için hemen fiziksel olarak silinmez. Onaylıyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            setErrorMsg(null);

            try {
              await deactivateWithPassword(password);
              // Router push will happen implicitly via auth state change listener in RouteGuard usually, 
              // but we don't need to do anything here because useAuth logs out on success.
            } catch (error: any) {
              setErrorMsg(error.message || 'Hesap pasife alınırken bir hata oluştu. Şifrenizi doğru girdiğinizden emin olun.');
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
        <Text style={styles.topBarTitle}>Hesabı Sil</Text>
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
              <Text style={styles.warningTitle}>Dikkat</Text>
              <Text style={styles.warningDesc}>
                Hesabınızı silmek (pasife almak) üzeresiniz. Bu işlem sonrası uygulamaya mevcut bilgilerinizle giriş yapamazsınız.
              </Text>
            </View>
          </View>

          <Text style={styles.description}>
            Güvenliğiniz için lütfen hesabınızı silmek istediğinizi doğrulamak adına mevcut şifrenizi girin.
          </Text>

          <Input
            label="Şifre"
            placeholder="Mevcut şifrenizi girin"
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
            label="Hesabı Sil"
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
