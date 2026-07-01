# docs/BETA_QA_CHECKLIST.md - Fluffy Carebook Beta QA Checklist

## Auth

- [ ] Yeni kullanici kayit olabilir.
- [ ] Mevcut kullanici giris yapabilir.
- [ ] Kullanici cikis yapabilir.
- [ ] Firebase env eksikken uygulama crash olmaz ve anlasilir hata gosterir.

## Onboarding

- [ ] Yeni kullanici onboarding ekranina yonlenir.
- [ ] Ilk pet olusturulur.
- [ ] Varsayilan bakim gorevleri secilir.
- [ ] Davet adimi gecilebilir.
- [ ] Davet adiminda invite olusturulabilir.
- [ ] Cikis/giris sonrasi onboarding tekrar acilmaz.

## Pet

- [ ] Pet olusturulabilir.
- [ ] Cikis/giris sonrasi pet listesi gelir.
- [ ] Baska kullanici member olmadigi peti goremez.

## Invite / Member

- [ ] Owner invite olusturabilir.
- [ ] Editor invite olusturamaz.
- [ ] Viewer invite olusturamaz.
- [ ] Invite accept ile member kaydi olusur.
- [ ] 2 active member limiti client akisi icinde korunur.
- [ ] Accepted invite tekrar kabul edilemez.
- [ ] Expired invite kabul edilemez.

## Care

- [ ] Owner/editor care task olusturabilir.
- [ ] Quick Log task yokken task olusturur ve event isaretler.
- [ ] Quick Log mevcut task varsa yeni task olusturmaz.
- [ ] Care event isaretlenebilir.
- [ ] Duplicate event engeli calisir.
- [ ] Viewer care ekranlarini read-only gorur.

## Dashboard

- [ ] Today status dogru gorunur.
- [ ] Recent events gorunur.
- [ ] Secili pet degistirilebilir.
- [ ] Realtime A/B testinde ikinci cihaz/event guncellemesi gelir.

## Reminders

- [ ] Reminder olusturulur.
- [ ] Reminder guncellenir.
- [ ] Reminder soft delete edilir.
- [ ] Dashboard upcoming bolumunde reminder gorunur.
- [ ] 30 gun filtresi calisir.

## Push

- [ ] Mobil cihazda permission istenir.
- [ ] Permission sonrasi Expo push token kaydedilir.
- [ ] Ayni token tekrar kaydedilince duplicate dokuman olusmaz.
- [ ] Web'de unsupported mesaji gorunur.

## Notification Preferences

- [ ] Yeni kullanicida default preferences olusur.
- [ ] Toggle degisince `users/{uid}` guncellenir.
- [ ] Baska user preferences alanini degistiremez.

## Rules

- [ ] Non-member pet verisine erisemez.
- [ ] Viewer write yapamaz.
- [ ] Owner/editor care task, care event ve reminder yazabilir.

## UI

- [ ] Kucuk ekranda login tasmaz.
- [ ] Kucuk ekranda dashboard tasmaz.
- [ ] Kucuk ekranda profile tasmaz.
- [ ] Kucuk ekranda pet detail tasmaz.
- [ ] Kucuk ekranda reminders tasmaz.
- [ ] Kucuk ekranda onboarding tasmaz.
- [ ] Loading state'ler anlasilir.
- [ ] Empty state'ler anlasilir.
- [ ] Error state'ler anlasilir.
