import json

with open('locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

with open('locales/tr.json', 'r', encoding='utf-8') as f:
    tr = json.load(f)

new_keys_en = {
    "settings": {
        "changeLanguage": "Change Language",
        "languageDesc": "Select the language you want the app to be displayed in."
    },
    "profile": {
        "changeLanguage": "Language",
        "changeLanguageDesc": "Application language"
    },
    "care": {
        "addTask": "Add Task",
        "today": "Today",
        "care": "Care",
        "loadingTasks": "Loading tasks...",
        "emptyFeedOwner": "Add the first task from pet details.",
        "emptyFeedGuest": "It will appear here when a task is added.",
        "feedEmpty": "Feed is empty.",
        "recentEvents": "Recent Events",
        "recentEventsSubtitle": "Follow what everyone does in the family.",
        "noEventsDesc": "A short care feed will appear here as tasks are completed.",
        "noEventsTitle": "No events today.",
        "user": "User",
        "completed": "completed {{task}}",
        "upcoming": "Upcoming",
        "upcomingEmptyOwner": "Let's start by adding the first vaccination, parasite, or vet check.",
        "upcomingEmptyGuest": "It will appear here when a reminder is added.",
        "upcomingEmptyTitle": "No reminders yet.",
        "todayWord": "Today",
        "yesterdayWord": "Yesterday",
        "locale": "en-US",
        "taskName": "Task Name",
        "taskNamePlaceholder": "E.g.: Morning Meal, Walk...",
        "taskType": "Type",
        "repeat": "Repeat",
        "tasksTitle": "Care Tasks",
        "tasksSubtitleEdit": "Plan and edit daily routines.",
        "tasksSubtitleRead": "You are in read mode for this pet."
    },
    "careEvent": {
        "food": "Food",
        "medicine": "Medicine",
        "litter": "Litter",
        "water": "Water",
        "walk": "Walk",
        "bath": "Bath",
        "grooming": "Grooming",
        "other": "Other"
    },
    "careSchedule": {
        "none": "Once",
        "daily": "Daily",
        "weekly": "Weekly",
        "monthly": "Monthly"
    },
    "species": {
        "cat": "Cat",
        "dog": "Dog",
        "bird": "Bird",
        "rabbit": "Rabbit",
        "other": "Other"
    },
    "gender": {
        "male": "♂ Male",
        "female": "♀ Female",
        "unknown": "Unknown"
    },
    "roles": {
        "owner": "Owner",
        "editor": "Editor",
        "viewer": "Viewer"
    },
    "pet": {
        "microchip": "Chip",
        "details": "Details",
        "profile": "PROFILE",
        "breed": "Breed",
        "age": "Age",
        "notes": "Note",
        "loading": "Loading pet info...",
        "loadError": "Couldn't load pet info.",
        "ageUnknown": "Age unknown",
        "years": "years",
        "months": "months",
        "yearsOld": "years old",
        "monthsOld": "months old",
        "daysOld": "days old",
        "members": "Family Members",
        "membersSubtitle": "{{activeCount}}/2 active caregivers",
        "membersLoading": "Loading members...",
        "membersEmptyTitle": "No members yet.",
        "membersEmptyDesc": "Caregivers will be listed here."
    },
    "date": {
        "day": "DAY",
        "month": "MONTH",
        "year": "YEAR",
        "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    "common": {
        "loading": "Loading...",
        "done": "Done",
        "cancel": "Cancel",
        "me": "Me",
        "close": "Close"
    },
    "auth": {
        "firebaseConfigError": "Firebase config is missing. Please define EXPO_PUBLIC_FIREBASE_* in .env.local.",
        "accountInactiveError": "This account is inactive. Create a new account to continue.",
        "emailInUse": "There is an account registered with this email.",
        "invalidEmail": "Enter a valid email address.",
        "invalidCredential": "Invalid email or password.",
        "weakPassword": "Password must be at least 6 characters.",
        "operationNotAllowed": "Guest login is not enabled on Firebase Console. Please enable Anonymous sign-in.",
        "permissionDenied": "You do not have permission for this action. Check Firestore rules.",
        "defaultError": "An error occurred. Please try again.",
        "guestUser": "Guest User",
        "loginRequired": "You must be logged in for account actions.",
        "sessionClosed": "Session is not open.",
        "nameEmpty": "Name cannot be empty."
    },
    "expense": {
        "newExpense": "New Expense",
        "expenseDetail": "Expense Detail",
        "titleRequired": "Expense title is required.",
        "validAmountRequired": "You must enter a valid amount.",
        "saveError": "An error occurred while saving.",
        "delete": "Delete",
        "deleteConfirm": "Are you sure you want to delete this expense?",
        "deleteError": "An error occurred while deleting.",
        "category": "Category",
        "amount": "Amount",
        "title": "Title",
        "titlePlaceholder": "E.g.: Royal Canin 15kg",
        "date": "Date",
        "notes": "Special Note",
        "notesPlaceholder": "Optional...",
        "save": "Save",
        "saveChanges": "Save Changes",
        "selectDate": "Select Date"
    },
    "expenseCategories": {
        "food": "Food",
        "vet": "Vet",
        "toy": "Toy",
        "grooming": "Grooming",
        "accessory": "Accessory",
        "other": "Other"
    },
    "invite": {
        "title": "Invite",
        "careInvite": "Caregiver invite",
        "subtitle": "You are about to join a pet's care team.",
        "loading": "Loading invite details",
        "errorTitle": "Failed to open invite.",
        "error": "Failed to load invite.",
        "pet": "Pet",
        "invitedBy": "Invited by",
        "role": "Role",
        "status": "Status",
        "accept": "Accept invite",
        "backHome": "Back to home",
        "inviteTitle": "Invite Caregiver",
        "inviteSubtitle": "Invite a co-caregiver. (Maximum 2 people)"
    },
    "inviteStatus": {
        "active": "Active",
        "invited": "Invited",
        "pending": "Pending",
        "accepted": "Accepted"
    }
}

new_keys_tr = {
    "settings": {
        "changeLanguage": "Dil Değiştir",
        "languageDesc": "Uygulamanın görüntülenmesini istediğiniz dili seçin."
    },
    "profile": {
        "changeLanguage": "Dil",
        "changeLanguageDesc": "Uygulama dili"
    },
    "care": {
        "addTask": "Görev Ekle",
        "today": "Bugün",
        "care": "Bakım",
        "loadingTasks": "Görevler yükleniyor...",
        "emptyFeedOwner": "Pet detayından ilk görevi ekle.",
        "emptyFeedGuest": "Görev eklendiğinde burada görünür.",
        "feedEmpty": "Akış boş.",
        "recentEvents": "Son Hareketler",
        "recentEventsSubtitle": "Aile içinde kimin ne yaptığını takip et.",
        "noEventsDesc": "Görevler tamamlandıkça burada kısa bir bakım akışı oluşacak.",
        "noEventsTitle": "Bugün hareket yok.",
        "user": "Kullanıcı",
        "completed": ", {{task}} tamamladı",
        "upcoming": "Yaklaşanlar",
        "upcomingEmptyOwner": "İlk aşı, parazit veya veteriner kontrolünü ekleyerek başlayalım.",
        "upcomingEmptyGuest": "Hatırlatıcı eklendiğinde burada görünür.",
        "upcomingEmptyTitle": "Henüz hatırlatıcı yok.",
        "todayWord": "Bugün",
        "yesterdayWord": "Dün",
        "locale": "tr-TR",
        "taskName": "Görev Adı",
        "taskNamePlaceholder": "Örn: Sabah Maması, Yürüyüş...",
        "taskType": "Tür",
        "repeat": "Tekrar",
        "tasksTitle": "Bakım Görevleri",
        "tasksSubtitleEdit": "Günlük rutinleri planlayın ve düzenleyin.",
        "tasksSubtitleRead": "Bu pet için okuma modundasınız."
    },
    "careEvent": {
        "food": "Mama",
        "medicine": "İlaç",
        "litter": "Kum",
        "water": "Su",
        "walk": "Yürüyüş",
        "bath": "Banyo",
        "grooming": "Tüy/Tarama",
        "other": "Diğer"
    },
    "careSchedule": {
        "none": "Tek sefer",
        "daily": "Günlük",
        "weekly": "Haftalık",
        "monthly": "Aylık"
    },
    "species": {
        "cat": "Kedi",
        "dog": "Köpek",
        "bird": "Kuş",
        "rabbit": "Tavşan",
        "other": "Diğer"
    },
    "gender": {
        "male": "♂ Erkek",
        "female": "♀ Dişi",
        "unknown": "Bilinmiyor"
    },
    "roles": {
        "owner": "Sahip",
        "editor": "Editör",
        "viewer": "Görüntüleyen"
    },
    "pet": {
        "microchip": "Çip",
        "details": "Detaylar",
        "profile": "PROFiL",
        "breed": "Irk",
        "age": "Yaş",
        "notes": "Not",
        "loading": "Pet bilgileri yükleniyor...",
        "loadError": "Pet bilgisi yüklenemedi.",
        "ageUnknown": "Yaş bilinmiyor",
        "years": "yaş",
        "months": "aylık",
        "yearsOld": "yaşında",
        "monthsOld": "aylık",
        "daysOld": "günlük",
        "members": "Aile Üyeleri",
        "membersSubtitle": "{{activeCount}}/2 aktif bakıcı",
        "membersLoading": "Üyeler yükleniyor...",
        "membersEmptyTitle": "Henüz üye görünmüyor.",
        "membersEmptyDesc": "Bakıcılar burada listelenecek."
    },
    "date": {
        "day": "GÜN",
        "month": "AY",
        "year": "YIL",
        "months": ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    },
    "common": {
        "loading": "Yükleniyor…",
        "done": "Tamam",
        "cancel": "İptal",
        "me": "Ben",
        "close": "Kapat"
    },
    "auth": {
        "firebaseConfigError": "Firebase yapılandırması eksik. Lütfen .env.local içinde EXPO_PUBLIC_FIREBASE_* değerlerini tanımlayın.",
        "accountInactiveError": "Bu hesap pasife alınmış. Devam etmek için yeni bir hesap oluşturun.",
        "emailInUse": "Bu e-posta ile kayıtlı bir hesap var.",
        "invalidEmail": "Geçerli bir e-posta adresi girin.",
        "invalidCredential": "E-posta veya şifre hatalı.",
        "weakPassword": "Şifre en az 6 karakter olmalı.",
        "operationNotAllowed": "Misafir girişi Firebase Console üzerinde etkin değil. Lütfen Authentication > Sign-in method altından Anonim (Anonymous) girişi aktif edin.",
        "permissionDenied": "Bu işlem için yetkiniz yok. Firestore rules ayarlarını kontrol edin.",
        "defaultError": "Bir hata oluştu. Lütfen tekrar deneyin.",
        "guestUser": "Misafir Kullanıcı",
        "loginRequired": "Hesap işlemi için giriş yapmalısınız.",
        "sessionClosed": "Oturum açık değil.",
        "nameEmpty": "İsim boş olamaz."
    },
    "expense": {
        "newExpense": "Yeni Masraf",
        "expenseDetail": "Masraf Detayı",
        "titleRequired": "Masraf başlığı zorunlu.",
        "validAmountRequired": "Geçerli bir tutar girmelisiniz.",
        "saveError": "Bir hata oluştu.",
        "delete": "Sil",
        "deleteConfirm": "Bu masrafı silmek istediğinize emin misiniz?",
        "deleteError": "Silinirken bir hata oluştu.",
        "category": "Kategori",
        "amount": "Tutar (₺)",
        "title": "Başlık",
        "titlePlaceholder": "Örn: Royal Canin 15kg",
        "date": "Tarih",
        "notes": "Özel Not",
        "notesPlaceholder": "İsteğe bağlı...",
        "save": "Kaydet",
        "saveChanges": "Değişiklikleri Kaydet",
        "selectDate": "Tarih Seçin"
    },
    "expenseCategories": {
        "food": "Mama",
        "vet": "Veteriner",
        "toy": "Oyuncak",
        "grooming": "Kuaför",
        "accessory": "Aksesuar",
        "other": "Diğer"
    },
    "invite": {
        "title": "Davet",
        "careInvite": "Bakıcı daveti",
        "subtitle": "Bir evcil dostun bakım ekibine katılmak üzeresin.",
        "loading": "Davet bilgileri yükleniyor",
        "errorTitle": "Davet açılamadı.",
        "error": "Davet yüklenemedi.",
        "pet": "Pet",
        "invitedBy": "Davet eden",
        "role": "Rol",
        "status": "Durum",
        "accept": "Daveti kabul et",
        "backHome": "Ana ekrana dön",
        "inviteTitle": "Bakıcı Davet Et",
        "inviteSubtitle": "Ortak bakıcı davet edin. (Maksimum 2 kişi)"
    },
    "inviteStatus": {
        "active": "Aktif",
        "invited": "Davet Edildi",
        "pending": "Bekliyor",
        "accepted": "Kabul Edildi"
    }
}

def merge_dict(target, source):
    for k, v in source.items():
        if isinstance(v, dict):
            target[k] = merge_dict(target.get(k, {}), v)
        else:
            target[k] = v
    return target

merge_dict(en, new_keys_en)
merge_dict(tr, new_keys_tr)

with open('locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

with open('locales/tr.json', 'w', encoding='utf-8') as f:
    json.dump(tr, f, ensure_ascii=False, indent=2)

print("Updated locales successfully!")
