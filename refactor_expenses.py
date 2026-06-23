import re

with open('app/(tabs)/expenses.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function ExpensesScreen() {",
    "export default function ExpensesScreen() {\n  const { t } = useTranslation();"
)

content = content.replace(
    "{selectedPet ? `${selectedPet.name} için harcama takibi` : 'Dost seç'}",
    "{selectedPet ? `${selectedPet.name} ${t('expenses.forPet')}` : t('expenses.selectPet')}"
)

content = content.replace('label="Yükleniyor..."', 'label={t("expenses.loading")}')
content = content.replace('title="Henüz dost yok"', 'title={t("expenses.noPetTitle")}')
content = content.replace('text="Harcama takibi için önce Dostlarım sekmesinden bir profil oluştur."', 'text={t("expenses.noPetDesc")}')

content = content.replace(">Kategori Dağılımı<", ">{t('expenses.categoryDistribution')}<")
content = content.replace(">Tüm Masraflar<", ">{t('expenses.allExpenses')}<")

content = content.replace('label="Masraflar yükleniyor..."', 'label={t("expenses.loadingExpenses")}')
content = content.replace('title="Henüz masraf yok"', 'title={t("expenses.noExpensesTitle")}')
content = content.replace('text="Sağ alt köşedeki butondan ilk harcamayı ekleyebilirsin."', 'text={t("expenses.noExpensesDesc")}')

with open('app/(tabs)/expenses.tsx', 'w') as f:
    f.write(content)

