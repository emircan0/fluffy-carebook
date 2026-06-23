import re

with open('app/(tabs)/index.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function HomeScreen() {",
    "export default function HomeScreen() {\n  const { t } = useTranslation();"
)

# Constants mapping using string format
# Notice that `const quickActions` is outside the component.
# To properly translate it, we should move it inside the component or translate at render.
# Let's move it inside the component.
content = re.sub(
    r'(const quickActions.*?\];)',
    r'',
    content,
    flags=re.DOTALL
)

# We insert quickActions inside HomeScreen
content = content.replace(
    "export default function HomeScreen() {\n  const { t } = useTranslation();",
    "export default function HomeScreen() {\n  const { t } = useTranslation();\n\n  const quickActions = [\n    { type: 'food', label: t('careEvents.food'), icon: 'coffee', allowMultiplePerDay: true },\n    { type: 'water', label: t('careEvents.water'), icon: 'droplet', allowMultiplePerDay: true },\n    { type: 'litter', label: t('careEvents.litter'), icon: 'archive', allowMultiplePerDay: true },\n    { type: 'medicine', label: t('careEvents.medicine'), icon: 'plus-circle', allowMultiplePerDay: false },\n    { type: 'walk', label: t('careEvents.walk'), icon: 'navigation', allowMultiplePerDay: false },\n  ] as const;\n\n"
)

# Same for roleLabels
content = re.sub(r'const roleLabels: Record<string, string> = {.*?};\n', '', content, flags=re.DOTALL)
content = content.replace(
    "export default function HomeScreen() {\n  const { t } = useTranslation();",
    "export default function HomeScreen() {\n  const { t } = useTranslation();\n\n  const roleLabels: Record<string, string> = {\n    owner: 'Owner',\n    editor: t('roles.editor'),\n    viewer: t('roles.viewer'),\n  };\n\n"
)

# Other strings
content = content.replace("'Kullanıcı'", "t('common.user')")
content = content.replace("'Yapıldı'", "t('common.done')")
content = content.replace("'Pet seçili değil.'", "t('index.noPetSelected')")
content = content.replace("'Bu işlem için yetkin yok.'", "t('errors.editOnly')")
content = content.replace(">Bugün<", ">{t('index.today')}<")
content = content.replace('label="Petler yükleniyor"', 'label={t("index.loadingPets")}')
content = content.replace('title="İlk petini ekleyerek başlayalım"', 'title={t("index.addFirstPetTitle")}')
content = content.replace('text="Birkaç adımda bakım akışını kur."', 'text={t("index.addFirstPetDesc")}')
content = content.replace(
    "{pet.species === 'cat' ? 'Kedi' : pet.species === 'dog' ? 'Köpek' :\n                       pet.species === 'bird' ? 'Kuş' : pet.species === 'rabbit' ? 'Tavşan' : 'Diğer'}",
    "{t(`species.${pet.species}`)}"
)
content = content.replace("'Üye'", "t('common.member')")
content = content.replace(">Bugünkü İlerleme<", ">{t('index.todayProgress')}<")
content = content.replace('label="Vazgeç"', 'label={t("common.cancel")}')
content = content.replace('label="Oluştur"', 'label={t("common.create")}')


with open('app/(tabs)/index.tsx', 'w') as f:
    f.write(content)

