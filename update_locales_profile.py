import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'profile' not in data:
        data['profile'] = {}
        
    if lang == 'tr':
        data['profile'].update({
            "guestUser": "Misafir Kullanıcı",
            "familyMembership": "Aile Üyeliği",
            "accountSettings": "Hesap Ayarları",
            "loadingProfile": "Profil yükleniyor…",
            "changeName": "İsim Değiştir",
            "changeNameDesc": "Adınızı güncelleyin",
            "changePassword": "Şifre Değiştir",
            "changePasswordDesc": "Hesap güvenliğinizi sağlayın",
            "manageNotificationsDesc": "Hatırlatmaları yönetin",
            "termsOfUse": "Kullanım Koşulları",
            "termsOfUseDesc": "Kullanıcı sözleşmesi ve kurallar",
            "privacyPolicy": "Gizlilik Politikası",
            "privacyPolicyDesc": "KVKK ve gizlilik haklarınız",
            "aboutApp": "Uygulama Hakkında",
            "aboutAppDesc": "Sürüm ve lisans bilgileri",
            "deleteAccount": "Hesabı Sil",
            "deleteAccountDesc": "Verilerinizi koruyarak hesabı pasife alın",
            "signOut": "Çıkış Yap"
        })
    else:
        data['profile'].update({
            "guestUser": "Guest User",
            "familyMembership": "Family Membership",
            "accountSettings": "Account Settings",
            "loadingProfile": "Loading profile…",
            "changeName": "Change Name",
            "changeNameDesc": "Update your name",
            "changePassword": "Change Password",
            "changePasswordDesc": "Ensure your account security",
            "manageNotificationsDesc": "Manage reminders",
            "termsOfUse": "Terms of Use",
            "termsOfUseDesc": "User agreement and rules",
            "privacyPolicy": "Privacy Policy",
            "privacyPolicyDesc": "Your privacy rights",
            "aboutApp": "About App",
            "aboutAppDesc": "Version and license info",
            "deleteAccount": "Delete Account",
            "deleteAccountDesc": "Deactivate account to protect data",
            "signOut": "Sign Out"
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
