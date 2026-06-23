# docs/PUSH_NOTIFICATIONS.md - YuvioPet Push Notification Taslagi

YuvioPet push kapsaminda asi, ilac, parazit ve veteriner hatirlaticilariyla aile ici bakim gorunurlugunu destekler.

## Kapsam

Sprint 10'da client sadece bildirim izni ister, Expo push token alir ve Firestore'a kaydeder.
Production cron, deploy script ve tam Cloud Functions kurulumu bu sprintte yapilmaz.

## Client akisi

1. Kullanici giris yapar.
2. Profile ekraninda bildirim kartini gorur.
3. Kullanici `Bildirimleri ac` butonuna basarsa permission istenir.
4. Izin verilirse Expo push token alinir.
5. Token `notificationTokens/{userId}/tokens/{tokenId}` altina yazilir.

Uygulama acilisinda agresif permission prompt yoktur.

## Token modeli

Path:

```text
notificationTokens/{userId}/tokens/{tokenId}
```

Alanlar:

- `id`: string
- `userId`: string
- `expoPushToken`: string
- `platform`: `ios` | `android` | `web`
- `deviceId`: string | null
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

`tokenId`, Expo push token'dan deterministik uretilir. Ayni token tekrar kaydedilirse duplicate dokuman olusmaz; mevcut dokuman merge ile guncellenir.

## Security

- Kullanici sadece kendi `notificationTokens/{userId}/tokens` kayitlarini okuyabilir/yazabilir.
- `userId` path degeri `request.auth.uid` ile ayni olmalidir.
- `request.resource.data.userId == request.auth.uid` olmalidir.
- `expoPushToken` string olmalidir.
- `isActive` boolean olmalidir.

## Push kapsami

Kritik reminder tipleri:

- `medicine`
- `vaccine`
- `internal_parasite`
- `external_parasite`
- `vet`

Bu sprintte food/water/litter/walk gibi sik bakim event'leri icin push yoktur.

## Bildirim tercihleri

Sprint 14 ile kullanici tercihleri `users/{userId}.notificationPreferences` alaninda saklanir.

Varsayilanlar:

- `vaccine`: true
- `internal_parasite`: true
- `external_parasite`: true
- `medicine`: true
- `vet`: true
- `other`: false

Bu tercihler reminder type bazlidir. Food, water, litter, walk gibi care event tipleri Sprint 14 kapsaminda preference modeline dahil degildir.

Production scheduler ileride reminder gonderirken su karar sirasi ile ilerlemelidir:

1. `reminder.isActive == true` ve `reminder.deletedAt == null` olmali.
2. `reminder.notifyEnabled == true` olmali.
3. Kullanici `notificationPreferences[reminder.reminderType] == true` olmali.
4. Kullaniciya ait active push token bulunmali.

`reminder.notifyEnabled` false ise bildirim gonderilmez. `reminder.notifyEnabled` true olsa bile ilgili user preference false ise bildirim gonderilmez.

## Cloud Function taslagi

Function/Scheduler mantigi:

1. Simdi ile yakin zaman penceresindeki reminder kayitlarini bul.
2. Sadece `isActive == true`, `deletedAt == null`, `notifyEnabled == true` kayitlari isle.
3. Sadece kritik `reminderType` degerlerini isle.
4. Reminder'in `petId` degeriyle pet dokumanini oku.
5. `pets/{petId}/members` altindaki active member kayitlarini bul.
6. Her member icin `users/{userId}.notificationPreferences` alanini oku.
7. `notificationPreferences[reminder.reminderType] == true` degilse o kullaniciyi atla.
8. Her member icin `notificationTokens/{userId}/tokens` altindaki `isActive == true` tokenlari oku.
9. Expo Push API'ye bildirim gonder.

Ornek bildirimler:

- `Zeytin'in ilaci zamani geldi.`
- `Pamuk'un ic parazit hatirlaticisi bugun.`
- `Zeytin icin veteriner kontrolu zamani.`

Pseudo-code:

```ts
const criticalTypes = [
  'medicine',
  'vaccine',
  'internal_parasite',
  'external_parasite',
  'vet',
];

export async function sendReminderNotifications() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 15 * 60 * 1000);

  const reminders = await db
    .collectionGroup('reminders')
    .where('isActive', '==', true)
    .where('notifyEnabled', '==', true)
    .where('reminderType', 'in', criticalTypes)
    .where('remindAt', '>=', now)
    .where('remindAt', '<=', windowEnd)
    .get();

  for (const reminderDoc of reminders.docs) {
    const reminder = reminderDoc.data();
    if (reminder.deletedAt) continue;

    const pet = await db.doc(`pets/${reminder.petId}`).get();
    if (!pet.exists) continue;

    const members = await db
      .collection(`pets/${reminder.petId}/members`)
      .where('status', '==', 'active')
      .get();

    for (const memberDoc of members.docs) {
      const member = memberDoc.data();
      const user = await db.doc(`users/${member.userId}`).get();
      const preferences = user.data()?.notificationPreferences ?? {};

      if (preferences[reminder.reminderType] === false) continue;

      const tokens = await db
        .collection(`notificationTokens/${member.userId}/tokens`)
        .where('isActive', '==', true)
        .get();

      // Expo Push API'ye batch halinde gonder.
    }
  }
}
```

## Duplicate push korumasi

Bu sprintte client tarafinda push gonderimi yoktur.

Production Function uygulanirken ayni reminder icin tekrar tekrar push gitmemesi icin su yaklasimlardan biri secilmelidir:

- Reminder dokumaninda `lastNotifiedAt` tutulur.
- Reminder + occurrence icin `notificationLogs/{logId}` tutulur.
- Recurring reminder'larda `notificationSentFor` gibi period key kullanilir.

## Test notlari

- Push notification beta oncesi gercek mobil cihazda veya uygun development build ortaminda test edilmelidir.
- Web push bu sprintte aktif degildir.
- Expo Go/development build davranisi platforma ve credentials durumuna gore fark gosterebilir.

## Gercek cihaz beta test hazirligi

Sprint 15 ile app metadata ve EAS build taslagi beta testine hazirlanmistir. Gercek push token testinden once:

1. `.env` icinde `EXPO_PUBLIC_EXPO_PROJECT_ID` tanimli olmalidir.
2. EAS projesi bagli degilse `eas init` veya `eas build:configure` ile proje baglantisi yapilmalidir.
3. Android icin preview APK build alinabilir: `eas build --profile preview --platform android`.
4. iOS icin Apple Developer hesabi ve cihaz/provisioning ayarlari gerekir.
5. Mobil cihazda Profile ekranindan `Bildirimleri ac` aksiyonu denenmelidir.
6. Firestore'da `notificationTokens/{userId}/tokens/{tokenId}` dokumani olustugu kontrol edilmelidir.

Bu sprintte test push butonu, production cron veya Cloud Function scheduler eklenmez.
