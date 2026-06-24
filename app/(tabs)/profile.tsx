import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import { appVersion, appVersionLabel } from '../../lib/appInfo';
import { usePets } from '../../lib/queries/usePets';
import {
  colors,
  fontWeight,
  layout,
  radius,
  shadows,
  spacing,
  typography,
} from '../../lib/theme';

type SettingRow = {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  description?: string;
  value?: string;
  tint: string;
  route?: any;
};

const termsText = `YuvioPet - Kullanım Koşulları
Son Güncelleme: 22 Haziran 2026

YuvioPet mobil uygulamasını ("Uygulama") indirerek, yükleyerek veya kullanarak, bu Kullanım Koşulları'nı tamamen ve koşulsuz olarak kabul etmiş olursunuz. Şartları kabul etmiyorsanız lütfen Uygulama'yı kullanmayınız.

1. Hizmet Tanımı ve Amacı
YuvioPet, evcil hayvan sahiplerinin ve bakıcılarının evcil canların günlük beslenme, ilaç, temizlik, yürüyüş rutinlerini ortaklaşa takip etmesini ve gelişim verilerini (kilo/boy) kaydetmesini sağlayan kişisel bir izleme uygulamasıdır. Uygulama ticari bir amaç gütmez ve hiçbir koşulda veterinerlik veya tıbbi tavsiye niteliği taşımaz.

2. Hesap Güvenliği ve Kullanıcı Sorumluluğu
- Uygulamaya giriş yapmak için Firebase Authentication altyapısı kullanılmaktadır. Hesap şifrenizin ve giriş bilgilerinizin gizliliğini korumak tamamen sizin sorumluluğunuzdadır.
- Hesabınız üzerinden yapılan tüm aktivitelerden doğrudan siz sorumlu tutulursunuz.
- Uygulama içinde yasadışı, hakaret içeren, telif haklarını ihlal eden veya üçüncü şahısları rahatsız edici içerik (not, isim vb.) paylaşılması yasaktır.

3. Veteriner Tavsiyesi Değildir
Uygulamada girilen veya hesaplanan veriler (örneğin kilo gelişim grafikleri, yaş gösterimleri, ilaç takvimleri) yalnızca bilgi amaçlıdır. Evcil hayvanınızın sağlığıyla ilgili her türlü teşhis, tedavi veya tıbbi karar için mutlaka profesyonel bir veteriner hekime başvurmalısınız.

4. Sorumluluk Sınırları ve Garanti Muafiyeti
Uygulama "olduğu gibi" ve "kullanıma sunulduğu şekliyle" sağlanmaktadır. YuvioPet; verilerin kaybı, silinmesi veya bulut sunucu kesintilerinden; uygulama üzerindeki teknik aksaklıklar veya bildirim gecikmelerinden kaynaklanabilecek doğrudan, dolaylı hiçbir zarardan sorumlu tutulamaz.

5. Değişiklikler ve Fesih
YuvioPet, bu Kullanım Koşulları'nı dilediği zaman güncelleme hakkını saklı tutar. Yapılan değişiklikler Uygulama içinde veya bu web adresinde yayınlandığı andan itibaren geçerlilik kazanır.`;

const privacyText = `YuvioPet - Gizlilik Politikası
Son Güncelleme: 22 Haziran 2026

YuvioPet ("Uygulama") olarak gizliliğinize ve kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve Genel Veri Koruma Yönetmeliği ("GDPR") uyumluluğu gözetilerek hazırlanmıştır.

1. Toplanan Kişisel Veriler
Uygulamayı kullanırken aşağıdaki veriler toplanmakta ve işlenmektedir:
- Kullanıcı Üyelik Bilgileri: E-posta adresi, ad-soyad ve Firebase UID.
- Evcil Hayvan Verileri: Evcil hayvanın adı, türü, cinsi, doğum tarihi, cinsiyeti, mikroçip numarası, özel sağlık notları ve girdiğiniz boy/kilo ölçüm kayıtları.
- Cihaz ve Bildirim Bilgileri: Push bildirimleri için Expo Push Token değeri ve cihaz platformu (iOS/Android).

2. Veri İşleme Amaçları
Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
- Uygulama servislerinin (hatırlatıcılar, rutinler, gelişim takibi vb.) sağlanması,
- Ortak bakım ekibiniz arasında verilerin senkronize edilmesi,
- İlaç, aşı ve veteriner randevusu bildirimlerinin iletilmesi.

3. Verilerin Depolanması ve Üçüncü Taraflarla Paylaşım
- Verileriniz, Google Cloud Platform bünyesindeki Firebase Firestore ve Firebase Authentication sunucularında en yüksek güvenlik standartlarında depolanmaktadır.
- YuvioPet, kişisel verilerinizi asla üçüncü taraflara satmaz veya pazarlama amacıyla paylaşmaz.
- Evcil hayvan verileri yalnızca sizin davet linki göndererek yetkilendirdiğiniz diğer YuvioPet kullanıcıları tarafından görüntülenebilir.

4. Kullanıcı Hakları (KVKK md. 11 ve GDPR)
Verilerinizi güncelleme, düzeltme veya tamamen silme hakkına sahipsiniz. Profilinizde yer alan "Hesabı Sil" butonunu kullanarak verilerinizi anında pasife alabilirsiniz. Verilerin tamamen kaldırılması talebi için emircanmertt@gmail.com adresi üzerinden iletişime geçebilirsiniz.`;

const termsTextEn = `YuvioPet - Terms of Service
Last Updated: June 22, 2026

By downloading, installing, or using the YuvioPet mobile application ("App"), you completely and unconditionally accept these Terms of Service. If you do not accept the terms, please do not use the App.

1. Description of Service and Purpose
YuvioPet is a personal tracking application that allows pet owners and caregivers to collaboratively track their pets' daily feeding, medication, cleaning, and walking routines, as well as record growth data (weight/height). The App is non-commercial and in no way constitutes veterinary or medical advice.

2. Account Security and User Responsibility
- Firebase Authentication infrastructure is used to log into the application. You are solely responsible for maintaining the confidentiality of your account password and login information.
- You are directly responsible for all activities that occur under your account.
- Sharing illegal, insulting, copyright-infringing, or otherwise disturbing content (notes, names, etc.) within the App is prohibited.

3. Not Veterinary Advice
The data entered or calculated in the application (such as weight growth charts, age displays, medication schedules) is for informational purposes only. You must always consult a professional veterinarian for any diagnosis, treatment, or medical decisions regarding your pet's health.

4. Limitation of Liability and Warranty Disclaimer
The App is provided "as is" and "as available". YuvioPet cannot be held liable for any direct or indirect damages that may arise from data loss, deletion, cloud server interruptions, technical glitches within the application, or notification delays.

5. Modifications and Termination
YuvioPet reserves the right to update these Terms of Service at any time. Changes become effective as soon as they are published within the App or on this web address.`;

const privacyTextEn = `YuvioPet - Privacy Policy
Last Updated: June 22, 2026

At YuvioPet ("App"), we attach great importance to your privacy and the protection of your personal data. This Privacy Policy has been prepared in compliance with the Personal Data Protection Law No. 6698 ("KVKK") and the General Data Protection Regulation ("GDPR").

1. Collected Personal Data
While using the App, the following data is collected and processed:
- User Membership Information: Email address, full name, and Firebase UID.
- Pet Data: Pet's name, species, breed, birth date, gender, microchip number, special health notes, and entered height/weight measurement records.
- Device and Notification Information: Expo Push Token value for push notifications and device platform (iOS/Android).

2. Data Processing Purposes
Your personal data is processed for the following purposes:
- Providing App services (reminders, routines, growth tracking, etc.),
- Synchronizing data among your co-caregiving team,
- Delivering medication, vaccination, and veterinary appointment notifications.

3. Data Storage and Sharing with Third Parties
- Your data is stored on Firebase Firestore and Firebase Authentication servers within the Google Cloud Platform at the highest security standards.
- YuvioPet will never sell your personal data to third parties or share it for marketing purposes.
- Pet data can only be viewed by other YuvioPet users whom you authorize by sending an invitation link.

4. User Rights (KVKK Art. 11 and GDPR)
You have the right to update, correct, or completely delete your data. You can instantly deactivate your data by using the "Delete Account" button in your profile. For requests to completely remove data, you can contact us at emircanmertt@gmail.com.`;

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { authError, isAuthLoading, profile, signOut, user } = useAuth();
  const petsQuery = usePets();
  const [selectedDoc, setSelectedDoc] = useState<'terms' | 'privacy' | null>(null);
  
  const pets = petsQuery.data ?? [];
  const isGuest = profile?.isAnonymous || user?.isAnonymous;
  const displayName = profile?.fullName || profile?.email || user?.email || (isGuest ? t('profile.guestUser') : t('common.user'));
  const emailAddress = profile?.email || user?.email || (isGuest ? 'Misafir hesap' : 'Bilinmiyor');

  const initials = useMemo(() => {
    if (profile?.fullName) {
      const parts = profile.fullName.trim().split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
    }
    return emailAddress.substring(0, 2).toUpperCase();
  }, [profile?.fullName, emailAddress]);

  const accountSettings: SettingRow[] = [
    {
      id: 'change-name',
      icon: 'user',
      label: t('profile.changeName'),
      description: t('profile.changeNameDesc'),
      route: '/settings/change-name',
      tint: colors.info,
    },
    {
      id: 'change-password',
      icon: 'lock',
      label: t('profile.changePassword'),
      description: t('profile.changePasswordDesc'),
      route: '/settings/change-password',
      tint: colors.roleOwner,
    },
    {
      id: 'language',
      icon: 'globe',
      label: t('profile.changeLanguage'),
      description: t('profile.changeLanguageDesc'),
      route: '/settings/language',
      tint: colors.info,
    },
    {
      id: 'notifications',
      icon: 'bell',
      label: t('profile.manageNotifications'),
      description: t('profile.manageNotificationsDesc'),
      route: '/settings/notifications',
      tint: colors.accent,
    },
  ];

  const docSettings: SettingRow[] = [
    {
      id: 'terms',
      icon: 'file-text',
      label: t('profile.termsOfUse'),
      description: t('profile.termsOfUseDesc'),
      tint: colors.textSecondary,
    },
    {
      id: 'privacy',
      icon: 'shield',
      label: t('profile.privacyPolicy'),
      description: t('profile.privacyPolicyDesc'),
      tint: colors.textSecondary,
    },
    {
      id: 'about',
      icon: 'info',
      label: t('profile.aboutApp'),
      description: t('profile.aboutAppDesc'),
      value: appVersion,
      tint: colors.textSecondary,
    },
  ];

  const dangerSettings: SettingRow[] = [
    {
      id: 'deactivate-account',
      icon: 'trash-2',
      label: t('profile.deleteAccount'),
      description: t('profile.deleteAccountDesc'),
      route: '/settings/deactivate-account',
      tint: colors.danger,
    }
  ];

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingState label={t("profile.loadingProfile")} />
      </View>
    );
  }

  const renderSettingsGroup = (rows: SettingRow[]) => (
    <View style={styles.settingsCard}>
      {rows.map((row, i) => (
        <Pressable
          accessibilityRole="button"
          key={row.id}
          onPress={() => {
            if (row.route) {
              router.push(row.route);
            } else if (row.id === 'terms' || row.id === 'privacy') {
              setSelectedDoc(row.id);
            }
          }}
          style={({ pressed }) => [
            styles.settingRow,
            i < rows.length - 1 && styles.settingRowBorder,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.settingIcon, { backgroundColor: row.tint + '18' }]}>
            <Feather name={row.icon} size={18} color={row.tint} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>{row.label}</Text>
            {row.description ? (
              <Text style={styles.settingDesc}>{row.description}</Text>
            ) : null}
          </View>
          {row.value ? (
            <Text style={styles.settingValue}>{row.value}</Text>
          ) : null}
          <Feather name="chevron-right" size={18} color={colors.textTertiary} />
        </Pressable>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* ── Avatar Hero ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{emailAddress}</Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{pets.length}</Text>
            <Text style={styles.statLabel}>{t('profile.activePet')}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statNum}>
              {pets.reduce((acc) => acc + 1, 0)}
            </Text>
            <Text style={styles.statLabel}>{t('profile.familyMembership')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLabel}>{t('profile.streak')}</Text>
          </View>
        </View>

        {/* ── Account Settings ── */}
        {!isGuest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>
            {renderSettingsGroup(accountSettings)}
          </View>
        )}

        {/* ── Documents & Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.infoAndDocs')}</Text>
          {renderSettingsGroup(docSettings)}
        </View>

        {/* ── Danger Zone ── */}
        {!isGuest && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.danger }]}>{t('profile.dangerZone')}</Text>
            {renderSettingsGroup(dangerSettings)}
          </View>
        )}

        {/* ── Sign Out ── */}
        <View style={styles.signOutWrapper}>
          <Button
            label={t('profile.signOut')}
            onPress={signOut}
            variant="secondary"
            size="md"
          />
        </View>

        {authError && !isGuest ? (
          <Text style={styles.accountMessage}>{authError}</Text>
        ) : null}

        <Text style={styles.buildInfo}>{appVersionLabel}</Text>
      </View>

      {/* Şartlar ve Gizlilik Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedDoc !== null}
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={styles.docModalOverlay}>
          <View style={styles.docModalContent}>
            <View style={styles.docModalHeader}>
              <Text style={styles.docModalTitle}>
                {selectedDoc === 'terms' ? t('profile.termsOfUse') : t('profile.privacyPolicy')}
              </Text>
              <Pressable
                onPress={() => setSelectedDoc(null)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Feather name="x" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.docScrollContent}>
              <Text style={styles.docText}>
                {selectedDoc === 'terms' 
                  ? (i18n.language === 'en' ? termsTextEn : termsText) 
                  : (i18n.language === 'en' ? privacyTextEn : privacyText)}
              </Text>
              
              <View style={styles.webUrlContainer}>
                <Feather name="globe" size={16} color={colors.textTertiary} />
                <Text style={styles.webUrlText}>
                  Web sürümü: https://petapp-54886.web.app/{selectedDoc}
                </Text>
              </View>
            </ScrollView>
            
            <View style={{ padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.surfaceBorder }}>
              <Button
                label="Kapat"
                variant="secondary"
                onPress={() => setSelectedDoc(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPadding,
    paddingTop: 64,
    paddingBottom: layout.tabBarHeight + layout.tabBarBottom + spacing.xl,
  },
  container: {
    alignSelf: 'center',
    gap: spacing.xl,
    maxWidth: layout.maxWidth,
    width: '100%',
  },

  // Avatar hero
  avatarSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: colors.accent + '50',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.accent,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textInverse,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  displayName: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: fontWeight.black,
    textAlign: 'center',
  },
  email: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...shadows.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  statCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statNum: {
    color: colors.accent,
    fontSize: typography.titleLg,
    fontWeight: fontWeight.black,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  // Sections
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.md,
  },

  // Settings
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
  },
  settingDesc: {
    color: colors.textTertiary,
    fontSize: typography.caption,
  },
  settingValue: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
  },

  pressed: {
    opacity: 0.7,
  },
  signOutWrapper: {
    marginTop: spacing.md,
  },
  accountMessage: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
    textAlign: 'center',
  },
  buildInfo: {
    color: colors.textTertiary,
    fontSize: typography.micro,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  docModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  docModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: spacing.md,
    maxHeight: '85%',
  },
  docModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  docModalTitle: {
    fontSize: typography.bodyLg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  docScrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  docText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  webUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  webUrlText: {
    color: colors.textTertiary,
    fontSize: typography.caption,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
});
