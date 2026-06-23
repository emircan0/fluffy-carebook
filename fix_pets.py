import re

with open('app/(tabs)/pets.tsx', 'r') as f:
    content = f.read()

# Remove the constants from outside
content = re.sub(r'const speciesOptions.*?\];\n', '', content, flags=re.DOTALL)
content = re.sub(r'const genderOptions.*?\];\n', '', content, flags=re.DOTALL)

# Insert them inside PetsScreen
insertion = """  const speciesOptions: Array<{ label: string; value: PetSpecies }> = [
    { label: `🐱 ${t('species.cat')}`, value: 'cat' },
    { label: `🐶 ${t('species.dog')}`, value: 'dog' },
    { label: `🐦 ${t('species.bird')}`, value: 'bird' },
    { label: `🐰 ${t('species.rabbit')}`, value: 'rabbit' },
    { label: `🐾 ${t('species.other')}`, value: 'other' },
  ];

  const genderOptions: Array<{ label: string; value: PetGender }> = [
    { label: t('genders.unknown'), value: 'unknown' },
    { label: t('genders.female'), value: 'female' },
    { label: t('genders.male'), value: 'male' },
  ];
"""

content = content.replace(
    "export default function PetsScreen() {\n  const { t, i18n } = useTranslation();",
    "export default function PetsScreen() {\n  const { t, i18n } = useTranslation();\n\n" + insertion
)

with open('app/(tabs)/pets.tsx', 'w') as f:
    f.write(content)

