import re

with open('app/(tabs)/reminders.tsx', 'r') as f:
    content = f.read()

# Add useTranslation and ReminderScheduleType
content = content.replace(
    "import { useQueryClient } from '@tanstack/react-query';",
    "import { useQueryClient } from '@tanstack/react-query';\nimport { useTranslation } from 'react-i18next';"
)

content = content.replace(
    "import type { Reminder, ReminderType } from '../../types/app';",
    "import type { Reminder, ReminderType, ReminderScheduleType } from '../../types/app';"
)

with open('app/(tabs)/reminders.tsx', 'w') as f:
    f.write(content)

