const fs = require('fs');

const missingEn = {
  common: {
    copy: "Copy"
  },
  invite: {
    copySuccess: "Invite link copied!"
  }
};

const missingTr = {
  common: {
    copy: "Kopyala"
  },
  invite: {
    copySuccess: "Davet linki kopyalandı!"
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

console.log('Locales updated for missing copy keys!');
