import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'scheduleTypes' not in data:
        data['scheduleTypes'] = {}

    if lang == 'tr':
        data['scheduleTypes']['none'] = "Tek Seferlik"
    else:
        data['scheduleTypes']['none'] = "One Time"

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
