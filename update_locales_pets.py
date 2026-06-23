import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'pets' not in data:
        data['pets'] = {}
        
    if lang == 'tr':
        data['pets'].update({
            "addNewPet": "Yeni Dost Ekle",
            "myPets": "Dostlarım",
            "careTeamPets": "Bakım ekibinde yer aldığınız tüm canlar",
            "name": "İsim",
            "namePlaceholder": "Dostunuzun adı",
            "breedPlaceholder": "Örn: Golden Retriever, Tekir...",
            "microchip": "Mikroçip No",
            "optional": "İsteğe bağlı",
            "specialNote": "Özel Not",
            "notePlaceholder": "Alerji, beslenme alışkanlıkları, önemli bilgiler…",
            "loadingPets": "Evcil hayvanlar yükleniyor…",
            "noPetsTitle": "Henüz dost eklemedin",
            "noPetsDesc": "İlk evcil dostunu kaydederek bakım planını yapmaya başla."
        })
    else:
        data['pets'].update({
            "addNewPet": "Add New Pet",
            "myPets": "My Pets",
            "careTeamPets": "All pets in your care team",
            "name": "Name",
            "namePlaceholder": "Your pet's name",
            "breedPlaceholder": "e.g., Golden Retriever, Tabby...",
            "microchip": "Microchip No",
            "optional": "Optional",
            "specialNote": "Special Note",
            "notePlaceholder": "Allergies, eating habits, important info…",
            "loadingPets": "Loading pets…",
            "noPetsTitle": "You haven't added a pet yet",
            "noPetsDesc": "Start planning care by registering your first pet."
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
