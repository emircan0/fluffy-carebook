import json

def update_locale(filepath, lang):
    with open(filepath, 'r') as f:
        data = json.load(f)

    if 'expenses' not in data:
        data['expenses'] = {}
        
    if lang == 'tr':
        data['expenses'].update({
            "forPet": "için harcama takibi",
            "selectPet": "Dost seç",
            "loading": "Yükleniyor...",
            "noPetTitle": "Henüz dost yok",
            "noPetDesc": "Harcama takibi için önce Dostlarım sekmesinden bir profil oluştur.",
            "categoryDistribution": "Kategori Dağılımı",
            "allExpenses": "Tüm Masraflar",
            "loadingExpenses": "Masraflar yükleniyor...",
            "noExpensesTitle": "Henüz masraf yok",
            "noExpensesDesc": "Sağ alt köşedeki butondan ilk harcamayı ekleyebilirsin."
        })
    else:
        data['expenses'].update({
            "forPet": "expense tracking",
            "selectPet": "Select pet",
            "loading": "Loading...",
            "noPetTitle": "No pets yet",
            "noPetDesc": "Create a profile from My Pets to track expenses.",
            "categoryDistribution": "Category Distribution",
            "allExpenses": "All Expenses",
            "loadingExpenses": "Loading expenses...",
            "noExpensesTitle": "No expenses yet",
            "noExpensesDesc": "You can add your first expense using the button on the bottom right."
        })

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_locale('locales/tr.json', 'tr')
update_locale('locales/en.json', 'en')
