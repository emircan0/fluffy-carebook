# docs/EMULATOR_TEST_PLAN.md - Sprint 11 Firebase Emulator Test Plani

## Kapsam

Bu dosya beta oncesi Firestore Security Rules test senaryolarini tarif eder. Sprint 11'de Firebase Emulator kurulumu veya otomasyon paketi eklenmez.

Hedef:

- Active member olmayan kullanici pet verisi okuyamasin.
- Viewer hicbir write islemi yapamasin.
- Owner/editor care task, care event ve reminder akisini bozmasin.
- Owner invite/member yonetimini tek yetkili rol olarak korusun.
- Notification token path'i user bazli izole kalsin.

## Auth

- `userA` kendi `users/{userA}` profile dokumanini okuyabilir.
- `userA` kendi `users/{userA}` profile dokumanini yazabilir.
- `userB`, `users/{userA}` profile dokumanini yazamaz.
- Giris yapmamis kullanici profile okuyamaz/yazamaz.

## Pets

- Owner `pets/{petId}` create yapabilir.
- Owner kendi member dokumani olustuktan sonra pet dokumanini okuyabilir.
- Active member pet dokumanini okuyabilir.
- Non-member pet dokumanini okuyamaz.
- Viewer pet update/delete yapamaz.
- Editor pet update/delete yapamaz.
- Owner pet update/delete yapabilir.

## Members

- Owner member list okuyabilir.
- Editor member list okuyabilir.
- Viewer member list okuyabilir.
- Non-member member list okuyamaz.
- Editor member create/update/delete yapamaz.
- Viewer member create/update/delete yapamaz.
- Invite accept transaction'i disinda direkt pending invite ile member create yapilamaz.

## Invites

- Owner invite create yapabilir.
- Editor invite create yapamaz.
- Viewer invite create yapamaz.
- Pending invite token'ini bilen signed-in kullanici invite okuyabilir.
- Accepted invite tekrar kabul edilemez.
- Expired invite kabul edilemez.
- Cancelled invite kabul edilemez.
- Accept update sirasinda `petId`, `invitedBy`, `invitedByName`, `role`, `token`, `id`, `createdAt`, `expiresAt` degistirilemez.
- Accept update sadece `status`, `acceptedBy`, `acceptedAt` ve opsiyonel `updatedAt` alanlarini degistirebilir.

## Care Tasks / Events

- Owner care task create yapabilir.
- Editor care task create yapabilir.
- Viewer care task create yapamaz.
- Owner/editor care task update yapabilir.
- Non-member care task okuyamaz/yazamaz.
- Owner care event create yapabilir.
- Editor care event create yapabilir.
- Viewer care event create yapamaz.
- Non-member care event okuyamaz/yazamaz.
- Care event create icin `userId == request.auth.uid` zorunludur.
- Care event create icin path `petId` ile data `petId` eslesmelidir.
- Care event create icin `eventType`, `status`, `taskId`, `clientEventId`, `doneAt`, `createdAt` dogrulanir.
- Care event update/delete reddedilir.

## Reminders

- Owner reminder create yapabilir.
- Editor reminder create yapabilir.
- Viewer reminder create yapamaz.
- Owner/editor reminder update yapabilir.
- Viewer sadece reminder okuyabilir.
- Non-member reminder okuyamaz/yazamaz.
- Reminder soft delete owner/editor update'i ile yapilabilir.
- Reminder physical delete reddedilir.
- Reminder update sirasinda `id`, `petId`, `createdBy`, `createdAt` degistirilemez.

## Notification Tokens

- Kullanici kendi `notificationTokens/{userId}/tokens/{tokenId}` dokumanini yazabilir.
- Kullanici kendi token dokumanini okuyabilir.
- Kullanici baska user token dokumanini okuyamaz.
- Kullanici baska user token dokumanini yazamaz.
- Token create/update icin `id`, `userId`, `expoPushToken`, `platform`, `deviceId`, `isActive`, `createdAt`, `updatedAt` dogrulanir.

## Realtime

- Sadece active member oldugu pet icin pet listener calisir.
- Sadece active member oldugu pet icin `members`, `careTasks`, `careEvents`, `reminders` listener'lari calisir.
- Non-member realtime veri alamaz.
- Viewer realtime veri okuyabilir, ancak write yetkisi kazanmaz.

## Bilinen Riskler

- Firestore Rules collection count yapamadigi icin 2 active member limiti kesin olarak rules tarafinda enforce edilemez.
- Eszamanli invite accept durumunda member limit race condition teorik olarak mumkundur.
- `clientEventId` global unique constraint degildir; duplicate event riski nihai olarak Cloud Function veya deterministik id stratejisinin emulator testleriyle guclendirilmesiyle kapanir.
- Rules emulator otomasyonu Faz 2 backlog'a alinmistir.
