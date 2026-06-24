const fs = require('fs');

const missingEn = {
  pet: {
    authRequiredForMeasurement: "You must log in to add measurements."
  },
  notifications: {
    missingAuth: "You must log in to enable notifications.",
    unsupportedWeb: "Push notifications are not supported on the web yet. Please use a mobile device.",
    denied: "Notification permission was denied. You can enable it from your device settings later.",
    registered: "Notifications enabled. You won't miss any reminders.",
    tokenFailed: "Failed to get push token. Try again on a mobile device.",
    channelName: "Reminders"
  },
  reminders: {
    types: {
      vaccine: "Vaccine",
      internal_parasite: "Internal Parasite",
      external_parasite: "External Parasite",
      medicine: "Medicine",
      vet: "Vet",
      other: "Other"
    },
    recurrence: {
      none: "Once",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly"
    },
    missingAuth: "You must log in for reminder operations.",
    missingTitle: "Reminder title is required.",
    missingDate: "Reminder date is required.",
    editOnly: "You need owner or editor role for this operation.",
    invalidDate: "Invalid date format.",
    genericError: "Could not complete reminder operation. Please try again."
  },
  date: {
    today: "Today",
    tomorrow: "Tomorrow",
    daysLater: "{{count}} days later"
  },
  preferences: {
    vaccineDesc: "Don't miss vaccination days.",
    internalParasiteDesc: "Remember regular parasite tracking.",
    externalParasiteDesc: "Track external parasite applications.",
    medicineDesc: "Don't forget medication times.",
    vetDesc: "Appointments and check-up days.",
    otherDesc: "Receive notifications for other reminders."
  },
  onboarding: {
    missingAuth: "You must log in to complete setup.",
    completed: "Setup completed.",
    genericError: "Could not complete setup. Please try again."
  },
  expense: {
    categories: {
      food: "Food",
      vet: "Vet",
      medicine: "Medicine",
      accessory: "Litter/Accessory",
      other: "Other"
    },
    addAuthError: "You must log in to add expenses.",
    deleteAuthError: "You must log in to delete expenses.",
    updateAuthError: "You must log in to update expenses.",
    notFoundError: "Expense not found."
  },
  care: {
    missingAuth: "You must log in for care operations.",
    missingTitle: "Task title is required.",
    editOnly: "You do not have permission for this operation.",
    alreadyDone: "This task is already marked today.",
    genericError: "Could not complete care operation. Please try again."
  }
};

const missingTr = {
  pet: {
    authRequiredForMeasurement: "Ölçüm eklemek için giriş yapmalısınız."
  },
  notifications: {
    missingAuth: "Bildirimleri açmak için giriş yapmalısınız.",
    unsupportedWeb: "Web tarafında push desteği bu sprintte aktif değil. Mobil cihazda deneyin.",
    denied: "Bildirim izni verilmedi. Cihaz ayarlarından daha sonra açabilirsiniz.",
    registered: "Bildirimler açık. Hatırlatmaları kaçırmayacaksın.",
    tokenFailed: "Push token alınamadı. Mobil cihazda veya development build üzerinde tekrar deneyin.",
    channelName: "Hatırlatıcılar"
  },
  reminders: {
    types: {
      vaccine: "Aşı",
      internal_parasite: "İç parazit",
      external_parasite: "Dış parazit",
      medicine: "İlaç",
      vet: "Veteriner",
      other: "Diğer"
    },
    recurrence: {
      none: "Tek sefer",
      daily: "Günlük",
      weekly: "Haftalık",
      monthly: "Aylık",
      yearly: "Yıllık"
    },
    missingAuth: "Hatırlatıcı işlemleri için giriş yapmalısınız.",
    missingTitle: "Hatırlatıcı başlığı zorunlu.",
    missingDate: "Hatırlatıcı tarihi zorunlu.",
    editOnly: "Bu işlem için owner veya editor rolü gerekir.",
    invalidDate: "Tarih formatı geçerli değil.",
    genericError: "Hatırlatıcı işlemi tamamlanamadı. Lütfen tekrar deneyin."
  },
  date: {
    today: "Bugün",
    tomorrow: "Yarın",
    daysLater: "{{count}} gün sonra"
  },
  preferences: {
    vaccineDesc: "Aşı günlerini kaçırma.",
    internalParasiteDesc: "Düzenli parazit takibini hatırla.",
    externalParasiteDesc: "Dış parazit uygulamalarını takip et.",
    medicineDesc: "İlaç saatlerini unutma.",
    vetDesc: "Randevu ve kontrol günleri.",
    otherDesc: "Diğer hatırlatmalar için bildirim al."
  },
  onboarding: {
    missingAuth: "Kurulumu tamamlamak için giriş yapmalısınız.",
    completed: "Kurulum tamamlandı.",
    genericError: "Kurulum tamamlanamadı. Lütfen tekrar deneyin."
  },
  expense: {
    categories: {
      food: "Mama",
      vet: "Veteriner",
      medicine: "İlaç",
      accessory: "Kum/Aksesuar",
      other: "Diğer"
    },
    addAuthError: "Masraf eklemek için giriş yapmalısınız.",
    deleteAuthError: "Masraf silmek için giriş yapmalısınız.",
    updateAuthError: "Masraf güncellemek için giriş yapmalısınız.",
    notFoundError: "Masraf bulunamadı."
  },
  care: {
    missingAuth: "Bakım işlemleri için giriş yapmalısınız.",
    missingTitle: "Görev başlığı zorunlu.",
    editOnly: "Bu işlem için yetkiniz yok.",
    alreadyDone: "Bu görev bugün zaten işaretlenmiş.",
    genericError: "Bakım işlemi tamamlanamadı. Lütfen tekrar deneyin."
  }
};

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

const enPath = './locales/en.json';
const trPath = './locales/tr.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));

fs.writeFileSync(enPath, JSON.stringify(deepMerge(enData, missingEn), null, 2));
fs.writeFileSync(trPath, JSON.stringify(deepMerge(trData, missingTr), null, 2));

console.log('Locales updated!');
