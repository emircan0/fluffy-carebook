import re

with open('app/(auth)/login.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function LoginScreen() {",
    "export default function LoginScreen() {\n  const { t } = useTranslation();"
)

# buttonLabel
content = content.replace(
    "const buttonLabel = isRegister ? 'Hesap Oluştur' : 'Giriş Yap';",
    "const buttonLabel = isRegister ? t('auth.createAccount') : t('auth.login');"
)

# Error messages
content = content.replace(
    "'Google Client ID yapılandırması eksik. Lutfen .env dosyasını kontrol edin.'",
    "t('auth.missingGoogleClientId')"
)
content = content.replace(
    "'ID Token bulunamadı. Lütfen Metro cache temizleyip tekrar deneyin.'",
    "t('auth.missingIdToken')"
)
content = content.replace(
    "'Google Play Services kullanılabilir değil.'",
    "t('auth.googlePlayMissing')"
)
content = content.replace(
    "'Google ile giriş yapılırken bir hata oluştu.'",
    "t('auth.googleError')"
)
content = content.replace(
    "'Apple ile giriş yapılırken bir hata oluştu.'",
    "t('auth.appleError')"
)

# UI Text
content = content.replace("Fluffy Carebook’a{`\\n`}hoş geldin", "{t('auth.welcome')}")
content = content.replace("Fluffy Carebook’a{'\\n'}hoş geldin", "{t('auth.welcome')}")
content = content.replace(
    "isRegister\n                ? 'Evcil dostunun bakımını ailece takip et.'\n                : 'Bakım akışına kaldığın yerden devam et.'",
    "isRegister\n                ? t('auth.taglineRegister')\n                : t('auth.taglineLogin')"
)

content = content.replace("⚠️ Firebase yapılandırması eksik", "{t('auth.firebaseMissing')}")
content = content.replace(".env dosyasını kontrol et.", "{t('auth.checkEnv')}")

content = content.replace('label="Ad Soyad"', 'label={t("auth.fullName")}')
content = content.replace('placeholder="Adın Soyadın"', 'placeholder={t("auth.fullNamePlaceholder")}')
content = content.replace('label="E-posta"', 'label={t("auth.email")}')
content = content.replace('placeholder="ornek@fluffycarebook.app"', 'placeholder={t("auth.emailPlaceholder")}')
content = content.replace('label="Şifre"', 'label={t("auth.password")}')
content = content.replace('placeholder="En az 6 karakter"', 'placeholder={t("auth.passwordPlaceholder")}')
content = content.replace("hint={isRegister ? 'En az 6 karakter kullan.' : undefined}", "hint={isRegister ? t('auth.passwordHint') : undefined}")

content = content.replace(
    """<Text style={styles.linkText} onPress={() => Linking.openURL('https://petapp-54886.web.app/terms')}>
                      Kullanım Koşulları
                    </Text>
                    {' ve '}
                    <Text style={styles.linkText} onPress={() => Linking.openURL('https://petapp-54886.web.app/privacy')}>
                      Gizlilik Politikası
                    </Text>
                    'nı okudum, kabul ediyorum.""",
    """{t('auth.termsPrefix')}
                    <Text style={styles.linkText} onPress={() => Linking.openURL('https://petapp-54886.web.app/terms')}>
                      {t('auth.terms')}
                    </Text>
                    {t('auth.and')}
                    <Text style={styles.linkText} onPress={() => Linking.openURL('https://petapp-54886.web.app/privacy')}>
                      {t('auth.privacy')}
                    </Text>
                    {t('auth.termsSuffix')}"""
)

# The replace above might have failed if formatting is slightly different.
# I'll use regex for the terms
import re
content = re.sub(
    r'<Text\s+style=\{styles\.linkText\}\s*onPress=\{.*?\}>\s*Kullanım Koşulları\s*</Text>\s*\{\'\s*ve\s*\'\}\s*<Text\s+style=\{styles\.linkText\}\s*onPress=\{.*?\}>\s*Gizlilik Politikası\s*</Text>\s*\'nı okudum, kabul ediyorum\.',
    r"{t('auth.termsPrefix')}\n                    <Text style={styles.linkText} onPress={() => Linking.openURL('https://petapp-54886.web.app/terms')}>\n                      {t('auth.terms')}\n                    </Text>\n                    {t('auth.and')}\n                    <Text style={styles.linkText} onPress={() => Linking.openURL('https://petapp-54886.web.app/privacy')}>\n                      {t('auth.privacy')}\n                    </Text>\n                    {t('auth.termsSuffix')}",
    content,
    flags=re.DOTALL
)

content = content.replace("Şifremi unuttum", "{t('auth.forgotPassword')}")
content = content.replace(">veya<", ">{t('auth.or')}<")
content = content.replace("Google ile devam et", "{t('auth.continueWithGoogle')}")
content = content.replace('label="Misafir olarak devam et"', 'label={t("auth.continueAsGuest")}')

content = content.replace(
    "{isRegister ? 'Zaten hesabın var mı? ' : 'Hesabın yok mu? '}",
    "{isRegister ? t('auth.haveAccount') : t('auth.noAccount')}"
)
content = content.replace(
    "{isRegister ? 'Giriş yap' : 'Kayıt ol'}",
    "{isRegister ? t('auth.doLogin') : t('auth.doRegister')}"
)

with open('app/(auth)/login.tsx', 'w') as f:
    f.write(content)

