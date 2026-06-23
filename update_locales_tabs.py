import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'tabs' not in data:
        data['tabs'] = {}

    if lang == 'tr':
        data['tabs'].update({
            "today": "Bugün",
            "pets": "Dostlarım",
            "reminders": "Hatırlatıcı",
            "expenses": "Masraflar",
            "profile": "Profil"
        })
    else:
        data['tabs'].update({
            "today": "Today",
            "pets": "My Pets",
            "reminders": "Reminders",
            "expenses": "Expenses",
            "profile": "Profile"
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
