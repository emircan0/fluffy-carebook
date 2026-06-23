import re

with open('app/onboarding.tsx', 'r') as f:
    content = f.read()

# Add useTranslation import
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

# Add useTranslation hook
content = content.replace(
    "export default function OnboardingScreen() {",
    "export default function OnboardingScreen() {\n  const { t, i18n } = useTranslation();"
)

# Fix normalizeTaskKey
content = content.replace(
    "function normalizeTaskKey(title: string, eventType: CareEventType) {\n  return `${title.trim().toLocaleLowerCase('tr-TR')}::${eventType}`;\n}",
    "function normalizeTaskKey(title: string, eventType: CareEventType, locale: string = 'tr-TR') {\n  return `${title.trim().toLocaleLowerCase(locale)}::${eventType}`;\n}"
)
content = content.replace(
    "normalizeTaskKey(task.title, task.eventType)",
    "normalizeTaskKey(task.title, task.eventType, i18n.language)"
)

# Replace speciesOptions strings in UI
content = content.replace("{option.label}", "{t(`species.${option.value}`)}")
# Replace genderOptions strings in UI
content = content.replace("{option.label}", "{t(`genders.${option.value}`)}")

# Replace task templates strings in UI (It's already using careEventLabels[task.eventType], we'll update careEventLabels later or use t directly)
content = content.replace("{careEventLabels[task.eventType]}", "{t(`careEvents.${task.eventType}`)}")

# Error messages
content = content.replace("'Pet adı zorunlu.'", "t('errors.petNameRequired')")
content = content.replace("'Önce pet oluşturmalısınız.'", "t('errors.mustCreatePetFirst')")
content = content.replace("'Davet için önce pet oluşturmalısınız.'", "t('errors.mustCreatePetFirstToInvite')")
content = content.replace("'Davet linki kopyalandı.'", "t('errors.inviteLinkCopied')")

# UI Texts
content = content.replace("YuvioPet’e hoş geldin", "{t('onboarding.welcomeTitle')}")
content = content.replace("Evcil dostunun bakımını birlikte takip et.", "{t('onboarding.welcomeDesc1')}")
content = content.replace("Mama, ilaç, kum, yürüyüş ve hatırlatmaları evdeki herkes tek yerden görsün.", "{t('onboarding.welcomeDesc2')}")
content = content.replace('"Kurulum kontrol ediliyor"', "{t('onboarding.checkingSetup')}")
content = content.replace(">Mevcut petlerin hazır<", ">{t('onboarding.petsReadyTitle')}<")
content = content.replace("Kurulumu tamamlayıp dashboard’a geçebilirsin.", "{t('onboarding.petsReadyDesc')}")
content = content.replace('"Kurulumu tamamla"', "t('onboarding.completeSetup')")
content = content.replace('"Başlayalım"', "t('onboarding.start')")
content = content.replace(">İlk pet<", ">{t('onboarding.firstPet')}<")
content = content.replace(">Dostunu ekle<", ">{t('onboarding.addFriend')}<")
content = content.replace('"Pet adı"', "t('onboarding.petName')")
content = content.replace('"Örn: Zeytin"', "t('onboarding.petNamePlaceholder')")
content = content.replace(">Tür<", ">{t('onboarding.species')}<")
content = content.replace(">Cinsiyet<", ">{t('onboarding.gender')}<")
content = content.replace(">Doğum tarihi<", ">{t('onboarding.birthDate')}<")
content = content.replace("'Seçmek için dokunun'", "t('onboarding.tapToSelect')")
content = content.replace('"Geri"', "t('onboarding.back')")
content = content.replace('"Devam"', "t('onboarding.continue')")
content = content.replace(">Temel görevleri seç<", ">{t('onboarding.selectTasks')}<")
content = content.replace('"Mevcut görevler kontrol ediliyor"', "{t('onboarding.checkingTasks')}")
content = content.replace('"Görevleri ekle"', "t('onboarding.addTasks')")
content = content.replace(">Opsiyonel<", ">{t('onboarding.optional')}<")
content = content.replace(">Bakımı birlikte mi takip edeceksiniz?<", ">{t('onboarding.trackTogetherTitle')}<")
content = content.replace("Eşini, aileni veya bakıcını davet ederek aynı peti birlikte yönetebilirsiniz.", "{t('onboarding.trackTogetherDesc')}")
content = content.replace(">Davet linki<", ">{t('onboarding.inviteLink')}<")
content = content.replace('"Kopyala"', "t('onboarding.copy')")
content = content.replace('"Bakıcı davet et"', "t('onboarding.inviteCaregiver')")
content = content.replace("'Dashboard’a geç' : 'Şimdilik geç'", "t('onboarding.goToDashboard') : t('onboarding.skipForNow')")
content = content.replace(">Doğum Tarihi Seçin<", ">{t('onboarding.selectBirthDate')}<")
content = content.replace(">Tamam<", ">{t('onboarding.done')}<")

# Update date formatting
content = content.replace(
    ".toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })",
    ".toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })"
)
content = content.replace(
    'locale="tr-TR"',
    'locale={i18n.language}'
)

# taskTemplates title translation - wait, taskTemplates is outside.
# Let's just fix it inside handleCreateSelectedTasks where it creates the task
content = content.replace(
    "title: task.title,",
    "title: t(`careEvents.${task.eventType}`),"
)

with open('app/onboarding.tsx', 'w') as f:
    f.write(content)

