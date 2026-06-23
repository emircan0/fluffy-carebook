import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'reminders' not in data:
        data['reminders'] = {}
        
    if lang == 'tr':
        data['reminders'].update({
            "vaccine": "Aşı",
            "internalParasite": "İç Parazit",
            "externalParasite": "Dış Parazit",
            "medicine": "İlaç",
            "other": "Diğer",
            "daily": "Günlük",
            "weekly": "Haftalık",
            "monthly": "Aylık",
            "yearly": "Yıllık",
            "notificationsEnabled": "Bildirim Açık",
            "notificationsDisabled": "Kapalı",
            "editReminder": "Düzenle",
            "newReminder": "Yeni Hatırlatıcı",
            "reminders": "Hatırlatıcılar",
            "formDesc": "Evcil dostunuzun aşı, ilaç veya veteriner gününü planlayın.",
            "forPet": "için aşı ve takvim planı",
            "selectPet": "Dost seç",
            "loading": "Yükleniyor...",
            "noPetTitle": "Henüz dost yok",
            "noPetDesc": "Hatırlatıcı eklemek için önce Dostlarım sekmesinden bir profil oluştur.",
            "title": "Başlık",
            "titlePlaceholder": "Örn: Kuduz Aşısı, İç Parazit...",
            "type": "Tür",
            "remind": "Hatırlatma",
            "update": "Güncelle",
            "save": "Kaydet",
            "loadingReminders": "Hatırlatıcılar yükleniyor...",
            "noRemindersTitle": "Henüz plan yok",
            "noRemindersDesc": "İlk aşı, parazit hapı veya veteriner randevusunu planlayarak takibi kolaylaştırın.",
            "selectDate": "Tarih Seçin",
            "selectTime": "Saat Seçin"
        })
    else:
        data['reminders'].update({
            "vaccine": "Vaccine",
            "internalParasite": "Internal Parasite",
            "externalParasite": "External Parasite",
            "medicine": "Medicine",
            "other": "Other",
            "daily": "Daily",
            "weekly": "Weekly",
            "monthly": "Monthly",
            "yearly": "Yearly",
            "notificationsEnabled": "Enabled",
            "notificationsDisabled": "Disabled",
            "editReminder": "Edit",
            "newReminder": "New Reminder",
            "reminders": "Reminders",
            "formDesc": "Plan your pet's vaccine, medicine, or vet appointments.",
            "forPet": "vaccine and calendar plan for",
            "selectPet": "Select pet",
            "loading": "Loading...",
            "noPetTitle": "No pets yet",
            "noPetDesc": "Create a profile from My Pets to add a reminder.",
            "title": "Title",
            "titlePlaceholder": "e.g., Rabies Vaccine, Internal Parasite...",
            "type": "Type",
            "remind": "Remind",
            "update": "Update",
            "save": "Save",
            "loadingReminders": "Loading reminders...",
            "noRemindersTitle": "No plans yet",
            "noRemindersDesc": "Plan your first vaccine, parasite pill, or vet appointment.",
            "selectDate": "Select Date",
            "selectTime": "Select Time"
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
