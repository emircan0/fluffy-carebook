# docs/FIRESTORE_RULES.md - YuvioPet Firebase Security Rules Notlari

YuvioPet, aileler ve ortak bakicilar icin evcil hayvan bakim takip uygulamasidir. Rules katmani pet bazli ortak bakim verisini member rolleriyle korur.

## Guvenlik prensibi

Client tarafindaki role kontrolleri sadece UI icindir. Asil guvenlik Firestore Security Rules ve gerekli yerlerde Cloud Functions ile saglanir.

Pet verileri icin merkezi yetki kaydi:

```text
pets/{petId}/members/{userId}
```

Aktif uye olmayan kullanici pet verisini okuyamaz. Legacy/yarim kalmis owner kayitlari icin `pets/{petId}.ownerId == request.auth.uid` owner fallback'i olarak kabul edilir. Viewer sadece okuyabilir. Owner/editor bakim task, care event ve reminder yazabilir. Owner invite/member yonetebilir.

Uygulanan guncel rules kaynagi `firestore.rules` dosyasidir. Bu dokuman karar ve risk notlarini tutar.

## Sprint 11 hardening ozeti

- `pets/{petId}` ve pet alt koleksiyonlari active member tarafindan okunur; owner kaydinda member dokumani eksik/uyumsuzsa `ownerId` fallback'i owner erisimini korur.
- `users/{userId}` create/update path user'i ile sinirli kalir ve sadece beklenen profile alanlarini kabul eder.
- Sprint 12 ile `users/{userId}` icin `onboardingCompleted` ve `onboardingCompletedAt` alanlari beklenen profile alanlarina eklenmistir.
- Sprint 14 ile `users/{userId}` icin `notificationPreferences` ve `notificationPreferencesUpdatedAt` alanlari beklenen profile alanlarina eklenmistir.
- Misafir giris ve hesap lifecycle icin `users/{userId}` alanlarina `isAnonymous`, `accountStatus` ve `deactivatedAt` eklenmistir.
- Hesap silme soft delete davranisidir: kullanici dokumani `accountStatus: inactive` olur; client inactive hesabi tekrar active yapamaz.
- `notificationPreferences` sadece `vaccine`, `internal_parasite`, `external_parasite`, `medicine`, `vet`, `other` key'lerini kabul eder ve tum degerler boolean olmalidir.
- `pets`, `members`, `careTasks`, `careEvents`, `reminders`, `invites` ve `notificationTokens` create/update payload'lari `keys().hasOnly(...)` / `hasAll(...)` ile daraltilmistir.
- Viewer write yapamaz; owner/editor yalniz care task, care event ve reminder yazabilir.
- Editor/viewer invite/member yonetemez.
- Notification token kaydi sadece `notificationTokens/{request.auth.uid}/tokens/{tokenId}` altina yazilabilir.

## Invite accept guvenligi

`invites/{token}` update sirasinda kabul akisi disindaki alanlar korunur.

Degisebilen alanlar:

- `status`: `pending` -> `accepted`
- `acceptedBy`: `request.auth.uid`
- `acceptedAt`
- Opsiyonel `updatedAt`

Korunan alanlar:

- `petId`
- `petName`
- `invitedBy`
- `invitedByName`
- `role`
- `token`
- `id`
- `createdAt`
- `expiresAt`

Expired, cancelled veya daha once accepted davetler kabul edilemez. Member create islemi de ayni transaction/batch icinde invite'in `accepted` hale gelmesini `getAfter(...)` ile bekler; sadece pending invite'e dayanarak direkt member dokumani olusturulamaz.

## Care event guvenligi

`pets/{petId}/careEvents/{eventId}` create icin:

- Kullanici active member ve owner/editor olmalidir.
- `request.auth.uid == userId` olmalidir.
- Path `petId` ile data `petId` eslesmelidir.
- `eventType` ve `status` izinli degerlerden olmalidir.
- `taskId`, `taskTitle` ve `clientEventId` bos olmayan string olmalidir.
- `doneAt` ve `createdAt` timestamp olmalidir.
- Ek alan kabul edilmez.
- Update/delete client'a kapali kalir.

Firestore Rules global unique `clientEventId` garantisi vermez. MVP'de `allowMultiplePerDay == false` icin deterministik document id + transaction kullanilir; kesin cozum Cloud Function veya emulator testleriyle desteklenen server-side accept/event yazimidir.

## Reminder guvenligi

`pets/{petId}/reminders/{reminderId}` icin:

- Active member okuyabilir.
- Sadece owner/editor create/update yapabilir.
- `id`, `petId`, `createdBy` ve `createdAt` update sirasinda korunur.
- `reminderType`, `recurrence`, `notifyEnabled`, `isActive`, `remindAt` ve timestamp alanlari dogrulanir.
- Physical delete kapali kalir.
- Soft delete sadece owner/editor update'iyle `isActive: false` ve `deletedAt` timestamp olarak yapilir.

## Member limit riski

Pet basina 2 active member limiti MVP'de uygulama/transaction seviyesinde kontrol edilir. Firestore Rules collection count yapamadigi icin eszamanli invite accept durumunda teorik race condition vardir.

Beta oncesi kabul edilebilir risk: Dusuk/orta. Faz 1 beta icin dokumante edilmis risk olarak kalabilir; kesin cozum Faz 2 backlog'da Cloud Function ile invite accept/member limit enforcement yapmaktir.

## Notification token guvenligi

- Kullanici sadece kendi token path'ini okuyabilir/yazabilir.
- `id == tokenId`, `userId == request.auth.uid`, `expoPushToken`, `platform`, `deviceId`, `isActive`, `createdAt`, `updatedAt` dogrulanir.
- Baska kullanicinin token dokumanlari client tarafindan okunamaz veya yazilamaz.

## Notification preferences guvenligi

- Kullanici sadece kendi `users/{uid}` dokumanindaki tercihleri okuyabilir/yazabilir.
- Baska kullanici `users/{uid}` dokumanini okuyamaz veya yazamaz.
- Gecersiz preference key'i veya boolean olmayan degerler rules tarafindan reddedilir.
- Care event tipleri (`food`, `water`, `litter`, `walk` vb.) Sprint 14 preference modeline dahil degildir.

## Realtime notlari

Realtime listener'lar ayni read rules'u kullanir. Active member olmayan kullanici pet altindaki `members`, `careTasks`, `careEvents` veya `reminders` snapshot'larini dinleyemez. Viewer realtime veriyi okuyabilir, ancak yazma yetkisi kazanmaz.

## Faz 2 backlog

- Belge arsivi / Firebase Storage rules ve upload akisi
- Rules emulator otomasyonlari genisletme
- Cloud Function ile invite accept/member limit kesinlestirme
- Reminder push scheduler production kurulumu
