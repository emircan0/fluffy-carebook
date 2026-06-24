const fs = require('fs');

const missingEn = {
  common: {
    share: "Share"
  },
  invite: {
    inviteTitle: "Invite Caregiver",
    inviteSubtitle: "Invite a co-caregiver. (Max 2 people)",
    createLink: "Create Invite Link",
    ticketTitle: "{{petName}} Care Team",
    ticketSubtitle: "You're invited to help care for this pet.",
    inviteCode: "INVITE CODE",
    ticketExpiry: "Valid for 48 hours"
  }
};

const missingTr = {
  common: {
    share: "Paylaş"
  },
  invite: {
    inviteTitle: "Bakıcı Davet Et",
    inviteSubtitle: "Ortak bakıcı davet edin. (Maksimum 2 kişi)",
    createLink: "Davet Bağlantısı Oluştur",
    ticketTitle: "{{petName}} Bakım Ekibi",
    ticketSubtitle: "Bu can dostumuzun bakımına davetlisiniz.",
    inviteCode: "DAVET KODU",
    ticketExpiry: "48 saat geçerlidir"
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

console.log('Locales updated for invite section!');
