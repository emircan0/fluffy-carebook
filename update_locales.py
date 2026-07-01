import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'auth' not in data:
        data['auth'] = {}
        
    if lang == 'tr':
        data['auth'].update({
            "createAccount": "Hesap Oluştur",
            "login": "Giriş Yap",
            "missingGoogleClientId": "Google Client ID yapılandırması eksik. Lütfen .env dosyasını kontrol edin.",
            "missingIdToken": "ID Token bulunamadı. Lütfen Metro cache temizleyip tekrar deneyin.",
            "googlePlayMissing": "Google Play Services kullanılabilir değil.",
            "googleError": "Google ile giriş yapılırken bir hata oluştu.",
            "appleError": "Apple ile giriş yapılırken bir hata oluştu.",
            "welcome": "Fluffy Carebook’a\nhoş geldin",
            "taglineRegister": "Evcil dostunun bakımını ailece takip et.",
            "taglineLogin": "Bakım akışına kaldığın yerden devam et.",
            "firebaseMissing": "⚠️ Firebase yapılandırması eksik",
            "checkEnv": ".env dosyasını kontrol et.",
            "fullName": "Ad Soyad",
            "fullNamePlaceholder": "Adın Soyadın",
            "email": "E-posta",
            "emailPlaceholder": "ornek@fluffycarebook.app",
            "password": "Şifre",
            "passwordPlaceholder": "En az 6 karakter",
            "passwordHint": "En az 6 karakter kullan.",
            "termsPrefix": "",
            "terms": "Kullanım Koşulları",
            "and": " ve ",
            "privacy": "Gizlilik Politikası",
            "termsSuffix": "'nı okudum, kabul ediyorum.",
            "forgotPassword": "Şifremi unuttum",
            "or": "veya",
            "continueWithGoogle": "Google ile devam et",
            "continueAsGuest": "Misafir olarak devam et",
            "haveAccount": "Zaten hesabın var mı? ",
            "noAccount": "Hesabın yok mu? ",
            "doLogin": "Giriş yap",
            "doRegister": "Kayıt ol"
        })
    else:
        data['auth'].update({
            "createAccount": "Create Account",
            "login": "Log In",
            "missingGoogleClientId": "Google Client ID configuration is missing. Please check your .env file.",
            "missingIdToken": "ID Token not found. Please clear Metro cache and try again.",
            "googlePlayMissing": "Google Play Services is not available.",
            "googleError": "An error occurred while logging in with Google.",
            "appleError": "An error occurred while logging in with Apple.",
            "welcome": "Welcome to\nFluffy Carebook",
            "taglineRegister": "Track your pet's care together as a family.",
            "taglineLogin": "Pick up your care routine where you left off.",
            "firebaseMissing": "⚠️ Firebase configuration missing",
            "checkEnv": "Check your .env file.",
            "fullName": "Full Name",
            "fullNamePlaceholder": "Your Full Name",
            "email": "Email",
            "emailPlaceholder": "example@fluffycarebook.app",
            "password": "Password",
            "passwordPlaceholder": "At least 6 characters",
            "passwordHint": "Use at least 6 characters.",
            "termsPrefix": "I have read and agree to the ",
            "terms": "Terms of Use",
            "and": " and ",
            "privacy": "Privacy Policy",
            "termsSuffix": ".",
            "forgotPassword": "Forgot my password",
            "or": "or",
            "continueWithGoogle": "Continue with Google",
            "continueAsGuest": "Continue as guest",
            "haveAccount": "Already have an account? ",
            "noAccount": "Don't have an account? ",
            "doLogin": "Log in",
            "doRegister": "Sign up"
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
