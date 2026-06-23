import re

with open('app/onboarding.tsx', 'r') as f:
    content = f.read()

# Fix un-braced t() calls in attributes like label=t(...) -> label={t(...)}
content = re.sub(r'(\w+)=t\((.*?)\)', r'\1={t(\2)}', content)

# Fix conditional un-braced t()
# label={inviteLink ? t('onboarding.goToDashboard') : t('onboarding.skipForNow')}
# The python replacement was: content.replace("'Dashboard’a geç' : 'Şimdilik geç'", "t('onboarding.goToDashboard') : t('onboarding.skipForNow')")
# which resulted in: label={inviteLink ? t('onboarding.goToDashboard') : t('onboarding.skipForNow')} which is CORRECT because it's inside { } already.

with open('app/onboarding.tsx', 'w') as f:
    f.write(content)

