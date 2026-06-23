import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if lang == 'tr':
        data['auth'].update({
            "goBack": "Geri Dön",
            "forgotPasswordTitle": "Şifreni mi\nunuttun?",
            "forgotPasswordTagline": "Hesabına ait e-posta adresini girerek şifre sıfırlama bağlantısı talep edebilirsin.",
            "linkSent": "📩 Bağlantı Gönderildi",
            "linkSentDesc": "Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Lütfen gelen kutunu (ve spam klasörünü) kontrol et.",
            "backToLogin": "Giriş Ekranına Dön",
            "sendResetLink": "Şifre Sıfırlama Bağlantısı Gönder",
            "backToLoginSubtle": "Giriş ekranına geri dön"
        })
    else:
        data['auth'].update({
            "goBack": "Go Back",
            "forgotPasswordTitle": "Forgot your\npassword?",
            "forgotPasswordTagline": "Enter your account email to request a password reset link.",
            "linkSent": "📩 Link Sent",
            "linkSentDesc": "A password reset link has been sent to your email. Please check your inbox (and spam folder).",
            "backToLogin": "Back to Login",
            "sendResetLink": "Send Reset Link",
            "backToLoginSubtle": "Return to login screen"
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
