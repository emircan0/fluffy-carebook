const fs = require('fs');

const missingEn = {
  common: {
    save: "Save",
    done: "Done"
  },
  pets: {
    breed: "Breed / Species",
    gender: "Gender"
  },
  reminders: {
    date: "Date",
    addTimeOptional: "Add Time (Optional)",
    timeLabel: "Time",
    recurrenceLabel: "Repeat",
    status: "Status",
    readOnlyMode: "Read-Only Mode"
  },
  expenses: {
    title: "Expenses",
    thisMonthTotal: "This Month's Total",
    loadError: "An error occurred while loading expenses: {{error}}"
  }
};

const missingTr = {
  common: {
    save: "Kaydet",
    done: "Tamam"
  },
  pets: {
    breed: "Irk / Cins",
    gender: "Cinsiyet"
  },
  reminders: {
    date: "Tarih",
    addTimeOptional: "Saat Ekle (Opsiyonel)",
    timeLabel: "Saat",
    recurrenceLabel: "Tekrar",
    status: "Durum",
    readOnlyMode: "Salt Okunur Mod"
  },
  expenses: {
    title: "Masraflar",
    thisMonthTotal: "Bu Ayki Toplam",
    loadError: "Masraflar yüklenirken bir hata oluştu: {{error}}"
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
