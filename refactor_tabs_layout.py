import re

with open('app/(tabs)/_layout.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { Tabs } from 'expo-router';",
    "import { Tabs } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function TabsLayout() {",
    "export default function TabsLayout() {\n  const { t } = useTranslation();"
)

content = content.replace("title: 'Bugün'", "title: t('tabs.today')")
content = content.replace("title: 'Dostlarım'", "title: t('tabs.pets')")
content = content.replace("title: 'Hatırlatıcı'", "title: t('tabs.reminders')")
content = content.replace("title: 'Masraflar'", "title: t('tabs.expenses')")
content = content.replace("title: 'Profil'", "title: t('tabs.profile')")

with open('app/(tabs)/_layout.tsx', 'w') as f:
    f.write(content)

