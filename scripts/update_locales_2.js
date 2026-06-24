const fs = require('fs');

const missingEn = {
  pet: {
    measurementTitle: "Body Measurements",
    measurementSubtitle: "Weight and height tracking.",
    weight: "Weight",
    height: "Height",
    recentMeasurements: "Recent Measurements",
    addMeasurement: "Add Measurement",
    measurementDate: "Measurement Date",
    invalidWeight: "Please enter a valid weight.",
    invalidHeight: "Please enter a valid height.",
    addMeasurementError: "An error occurred while adding the measurement.",
    seeAllHistory: "See All History",
    noMeasurementDesc: "Add measurements to see the growth chart.",
    noMeasurement: "No measurements yet.",
    growthHistory: "Growth History",
    recentCareEvents: "Recent Care Events",
    recentCareEventsSubtitle: "Completed care routines.",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    loadingEvents: "Loading events...",
    noEventsDesc: "No care events were recorded in this period.",
    noEventsTitle: "A quiet period.",
    times: "times",
    userDidTask: "{{userName}} completed {{taskName}}."
  }
};

const missingTr = {
  pet: {
    measurementTitle: "Vücut Ölçüleri",
    measurementSubtitle: "Kilo ve boy takibi.",
    weight: "Kilo",
    height: "Boy",
    recentMeasurements: "Son Ölçümler",
    addMeasurement: "Ölçüm Ekle",
    measurementDate: "Ölçüm Tarihi",
    invalidWeight: "Lütfen geçerli bir kilo değeri girin.",
    invalidHeight: "Lütfen geçerli bir boy değeri girin.",
    addMeasurementError: "Ölçüm eklenirken bir hata oluştu.",
    seeAllHistory: "Tüm Geçmişi Gör",
    noMeasurementDesc: "Grafik oluşturulabilmesi için ölçüm girilmelidir.",
    noMeasurement: "Henüz ölçüm yok.",
    growthHistory: "Gelişim Geçmişi",
    recentCareEvents: "Son Bakım Hareketleri",
    recentCareEventsSubtitle: "Tamamlanan bakım rutinleri.",
    today: "Bugün",
    thisWeek: "Bu Hafta",
    thisMonth: "Bu Ay",
    loadingEvents: "Hareketler yükleniyor...",
    noEventsDesc: "Bu aralıkta henüz bir bakım yapılmadı.",
    noEventsTitle: "Sakin bir dönem.",
    times: "kez",
    userDidTask: "{{userName}}, {{taskName}} görevini yaptı."
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
