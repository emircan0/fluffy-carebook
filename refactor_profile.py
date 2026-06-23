import re

with open('app/(tabs)/profile.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function ProfileScreen() {",
    "export default function ProfileScreen() {\n  const { t } = useTranslation();"
)

content = content.replace(
    "(isGuest ? 'Misafir Kullanıcı' : 'Kullanıcı')",
    "(isGuest ? t('profile.guestUser') : t('common.user'))"
)

content = content.replace("label: 'İsim Değiştir'", "label: t('profile.changeName')")
content = content.replace("description: 'Adınızı güncelleyin'", "description: t('profile.changeNameDesc')")
content = content.replace("label: 'Şifre Değiştir'", "label: t('profile.changePassword')")
content = content.replace("description: 'Hesap güvenliğinizi sağlayın'", "description: t('profile.changePasswordDesc')")
content = content.replace("description: 'Hatırlatmaları yönetin'", "description: t('profile.manageNotificationsDesc')")
content = content.replace("label: 'Kullanım Koşulları'", "label: t('profile.termsOfUse')")
content = content.replace("description: 'Kullanıcı sözleşmesi ve kurallar'", "description: t('profile.termsOfUseDesc')")
content = content.replace("label: 'Gizlilik Politikası'", "label: t('profile.privacyPolicy')")
content = content.replace("description: 'KVKK ve gizlilik haklarınız'", "description: t('profile.privacyPolicyDesc')")
content = content.replace("label: 'Uygulama Hakkında'", "label: t('profile.aboutApp')")
content = content.replace("description: 'Sürüm ve lisans bilgileri'", "description: t('profile.aboutAppDesc')")
content = content.replace("label: 'Hesabı Sil'", "label: t('profile.deleteAccount')")
content = content.replace("description: 'Verilerinizi koruyarak hesabı pasife alın'", "description: t('profile.deleteAccountDesc')")

content = content.replace('label="Profil yükleniyor…"', 'label={t("profile.loadingProfile")}')
content = content.replace(">Aile Üyeliği<", ">{t('profile.familyMembership')}<")
content = content.replace(">Hesap Ayarları<", ">{t('profile.accountSettings')}<")
content = content.replace(
    "{selectedDoc === 'terms' ? 'Kullanım Koşulları' : 'Gizlilik Politikası'}",
    "{selectedDoc === 'terms' ? t('profile.termsOfUse') : t('profile.privacyPolicy')}"
)

# Replace 'Çıkış Yap' which is used in Button
content = content.replace('label="Çıkış Yap"', 'label={t("profile.signOut")}')

with open('app/(tabs)/profile.tsx', 'w') as f:
    f.write(content)

