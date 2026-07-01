import re

with open('app/(auth)/forgot-password.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function ForgotPasswordScreen() {",
    "export default function ForgotPasswordScreen() {\n  const { t } = useTranslation();"
)

content = content.replace("Geri Dön", "{t('auth.goBack')}")
content = content.replace("Şifreni mi{`\\n`}unuttun?", "{t('auth.forgotPasswordTitle')}")
content = content.replace("Şifreni mi{'\\n'}unuttun?", "{t('auth.forgotPasswordTitle')}")
content = content.replace("Hesabına ait e-posta adresini girerek şifre sıfırlama bağlantısı talep edebilirsin.", "{t('auth.forgotPasswordTagline')}")

content = content.replace("📩 Bağlantı Gönderildi", "{t('auth.linkSent')}")
content = content.replace("Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Lütfen gelen kutunu (ve spam klasörünü) kontrol et.", "{t('auth.linkSentDesc')}")
content = content.replace('label="Giriş Ekranına Dön"', 'label={t("auth.backToLogin")}')

content = content.replace('label="E-posta"', 'label={t("auth.email")}')
content = content.replace('placeholder="ornek@fluffycarebook.app"', 'placeholder={t("auth.emailPlaceholder")}')

content = content.replace('label="Şifre Sıfırlama Bağlantısı Gönder"', 'label={t("auth.sendResetLink")}')
content = content.replace('label="Giriş ekranına geri dön"', 'label={t("auth.backToLoginSubtle")}')

with open('app/(auth)/forgot-password.tsx', 'w') as f:
    f.write(content)

