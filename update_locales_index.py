import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'index' not in data:
        data['index'] = {}
    if 'common' not in data:
        data['common'] = {}

    if lang == 'tr':
        data['common'].update({
            "cancel": "Vazgeç",
            "create": "Oluştur",
            "user": "Kullanıcı",
            "done": "Yapıldı",
            "member": "Üye"
        })
        data['index'].update({
            "noPetSelected": "Pet seçili değil.",
            "today": "Bugün",
            "loadingPets": "Petler yükleniyor",
            "addFirstPetTitle": "İlk petini ekleyerek başlayalım",
            "addFirstPetDesc": "Birkaç adımda bakım akışını kur.",
            "todayProgress": "Bugünkü İlerleme"
        })
    else:
        data['common'].update({
            "cancel": "Cancel",
            "create": "Create",
            "user": "User",
            "done": "Done",
            "member": "Member"
        })
        data['index'].update({
            "noPetSelected": "No pet selected.",
            "today": "Today",
            "loadingPets": "Loading pets",
            "addFirstPetTitle": "Let's start by adding your first pet",
            "addFirstPetDesc": "Set up the care routine in a few steps.",
            "todayProgress": "Today's Progress"
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
