import re

with open('app/(tabs)/pets.tsx', 'r') as f:
    content = f.read()

# Add useTranslation
content = content.replace(
    "import { useRouter } from 'expo-router';",
    "import { useRouter } from 'expo-router';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "export default function PetsScreen() {",
    "export default function PetsScreen() {\n  const { t, i18n } = useTranslation();"
)

# Constants
content = content.replace("{ label: '🐱 Kedi',    value: 'cat' },", "{ label: `🐱 ${t('species.cat')}`, value: 'cat' },")
content = content.replace("{ label: '🐶 Köpek',  value: 'dog' },", "{ label: `🐶 ${t('species.dog')}`, value: 'dog' },")
content = content.replace("{ label: '🐦 Kuş',    value: 'bird' },", "{ label: `🐦 ${t('species.bird')}`, value: 'bird' },")
content = content.replace("{ label: '🐰 Tavşan', value: 'rabbit' },", "{ label: `🐰 ${t('species.rabbit')}`, value: 'rabbit' },")
content = content.replace("{ label: '🐾 Diğer',  value: 'other' },", "{ label: `🐾 ${t('species.other')}`, value: 'other' },")

content = content.replace("{ label: 'Dişi',       value: 'female' },", "{ label: t('genders.female'), value: 'female' },")
content = content.replace("{ label: 'Erkek',      value: 'male' },", "{ label: t('genders.male'), value: 'male' },")
content = content.replace("{ label: 'Bilinmiyor', value: 'unknown' },", "{ label: t('genders.unknown'), value: 'unknown' },")

content = content.replace("'Pet adı zorunlu.'", "t('errors.petNameRequired')")
content = content.replace(
    "{isFormOpen ? 'Yeni Dost Ekle' : 'Dostlarım'}",
    "{isFormOpen ? t('pets.addNewPet') : t('pets.myPets')}"
)
content = content.replace(
    ": 'Bakım ekibinde yer aldığınız tüm canlar'}",
    ": t('pets.careTeamPets')}"
)

content = content.replace('label="İsim"', 'label={t("pets.name")}')
content = content.replace('placeholder="Dostunuzun adı"', 'placeholder={t("pets.namePlaceholder")}')
content = content.replace('>Tür<', '>{t("onboarding.species")}<')
content = content.replace('placeholder="Örn: Golden Retriever, Tekir..."', 'placeholder={t("pets.breedPlaceholder")}')
content = content.replace('>Doğum Tarihi<', '>{t("onboarding.birthDate")}<')
content = content.replace("'Seçmek için dokunun'", "t('onboarding.tapToSelect')")
content = content.replace('label="Mikroçip No"', 'label={t("pets.microchip")}')
content = content.replace('placeholder="İsteğe bağlı"', 'placeholder={t("pets.optional")}')
content = content.replace('label="Özel Not"', 'label={t("pets.specialNote")}')
content = content.replace('placeholder="Alerji, beslenme alışkanlıkları, önemli bilgiler…"', 'placeholder={t("pets.notePlaceholder")}')
content = content.replace('label="Vazgeç"', 'label={t("common.cancel")}')

content = content.replace('label="Evcil hayvanlar yükleniyor…"', 'label={t("pets.loadingPets")}')
content = content.replace('title="Henüz dost eklemedin"', 'title={t("pets.noPetsTitle")}')
content = content.replace('text="İlk evcil dostunu kaydederek bakım planını yapmaya başla."', 'text={t("pets.noPetsDesc")}')

content = content.replace(
    "{pet.species === 'cat' ? 'Kedi' : pet.species === 'dog' ? 'Köpek' :\n                              pet.species === 'bird' ? 'Kuş' : pet.species === 'rabbit' ? 'Tavşan' : 'Diğer'}",
    "{t(`species.${pet.species}`)}"
)

content = content.replace(
    "` · ${pet.gender === 'male' ? 'Erkek' : 'Dişi'}`",
    "` · ${t(`genders.${pet.gender}`)}`"
)

content = content.replace(">Doğum Tarihi Seçin<", ">{t('onboarding.selectBirthDate')}<")
content = content.replace(">Tamam<", ">{t('onboarding.done')}<")

content = content.replace(".toLocaleDateString('tr-TR',", ".toLocaleDateString(i18n.language,")
content = content.replace('locale="tr-TR"', 'locale={i18n.language}')

# speciesOptions and genderOptions might be outside the component.
# I'll just check if they break logic. They are inside PetsScreen?
# Let's write the modified file and run tsc to check.
with open('app/(tabs)/pets.tsx', 'w') as f:
    f.write(content)

