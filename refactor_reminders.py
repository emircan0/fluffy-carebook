import re

with open('app/(tabs)/reminders.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function RemindersScreen() {",
    "export default function RemindersScreen() {\n  const { t, i18n } = useTranslation();"
)

# Constants outside the component.
content = re.sub(r'const reminderTypes.*?\];\n', '', content, flags=re.DOTALL)
content = re.sub(r'const scheduleTypes.*?\];\n', '', content, flags=re.DOTALL)
content = re.sub(r'const notificationOptions.*?\];\n', '', content, flags=re.DOTALL)

insertion = """  const reminderTypes: Array<{ label: string; value: ReminderType }> = [
    { label: t('reminders.vaccine'), value: 'vaccine' },
    { label: t('reminders.internalParasite'), value: 'internal_parasite' },
    { label: t('reminders.externalParasite'), value: 'external_parasite' },
    { label: t('reminders.medicine'), value: 'medicine' },
    { label: t('reminders.other'), value: 'other' },
  ];

  const scheduleTypes: Array<{ label: string; value: ReminderScheduleType }> = [
    { label: t('scheduleTypes.none'), value: 'none' },
    { label: t('reminders.daily'), value: 'daily' },
    { label: t('reminders.weekly'), value: 'weekly' },
    { label: t('reminders.monthly'), value: 'monthly' },
    { label: t('reminders.yearly'), value: 'yearly' },
  ];

  const notificationOptions: Array<{ label: string; value: 'enabled' | 'disabled' }> = [
    { label: t('reminders.notificationsEnabled'), value: 'enabled' },
    { label: t('reminders.notificationsDisabled'), value: 'disabled' },
  ];
"""

content = content.replace(
    "export default function RemindersScreen() {\n  const { t, i18n } = useTranslation();",
    "export default function RemindersScreen() {\n  const { t, i18n } = useTranslation();\n\n" + insertion
)

content = content.replace(
    "{isFormOpen ? (editingReminder ? 'Düzenle' : 'Yeni Hatırlatıcı') : 'Hatırlatıcılar'}",
    "{isFormOpen ? (editingReminder ? t('reminders.editReminder') : t('reminders.newReminder')) : t('reminders.reminders')}"
)

content = content.replace(
    "? 'Evcil dostunuzun aşı, ilaç veya veteriner gününü planlayın.'",
    "? t('reminders.formDesc')"
)

content = content.replace(
    ": (selectedPet ? `${selectedPet.name} için aşı ve takvim planı` : 'Dost seç')}",
    ": (selectedPet ? `${selectedPet.name} ${t('reminders.forPet')}` : t('reminders.selectPet'))}"
)

content = content.replace('label="Yükleniyor..."', 'label={t("reminders.loading")}')
content = content.replace('title="Henüz dost yok"', 'title={t("reminders.noPetTitle")}')
content = content.replace('text="Hatırlatıcı eklemek için önce Dostlarım sekmesinden bir profil oluştur."', 'text={t("reminders.noPetDesc")}')

content = content.replace('label="Başlık"', 'label={t("reminders.title")}')
content = content.replace('placeholder="Örn: Kuduz Aşısı, İç Parazit..."', 'placeholder={t("reminders.titlePlaceholder")}')
content = content.replace('>Tür<', '>{t("reminders.type")}<')
content = content.replace('>Hatırlatka<', '>{t("reminders.remind")}<')
content = content.replace('label="Vazgeç"', 'label={t("common.cancel")}')
content = content.replace("label={editingReminder ? 'Güncelle' : 'Kaydet'}", "label={editingReminder ? t('reminders.update') : t('reminders.save')}")

content = content.replace('label="Hatırlatıcılar yükleniyor..."', 'label={t("reminders.loadingReminders")}')
content = content.replace('title="Henüz plan yok"', 'title={t("reminders.noRemindersTitle")}')
content = content.replace('text="İlk aşı, parazit hapı veya veteriner randevusunu planlayarak takibi kolaylaştırın."', 'text={t("reminders.noRemindersDesc")}')

content = content.replace(">Tarih Seçin<", ">{t('reminders.selectDate')}<")
content = content.replace(">Saat Seçin<", ">{t('reminders.selectTime')}<")

content = content.replace(".toLocaleDateString('tr-TR',", ".toLocaleDateString(i18n.language,")
content = content.replace('locale="tr-TR"', 'locale={i18n.language}')
content = content.replace(".toLocaleTimeString('tr-TR',", ".toLocaleTimeString(i18n.language,")

with open('app/(tabs)/reminders.tsx', 'w') as f:
    f.write(content)

