# docs/FIRESTORE_MODEL.md - Fluffy Carebook Firestore Veri Modeli

Fluffy Carebook, aileler ve ortak bakicilar icin evcil hayvan bakim takip uygulamasidir. Veri modeli ortak bakim, Quick Log, reminders ve aile ici gorunurluk etrafinda korunur.

## Temel ilke

Faz 1 veri modeli `pets/{petId}` etrafinda doner. Bir kullanici sadece uyesi oldugu pet verilerini okuyabilir. Owner/editor/viewer yetkileri hem UI'da hem Firebase Security Rules tarafinda uygulanir.

Firestore sabit degerleri Ingilizce tutulur; UI'da Turkce label mapping kullanilir.

## Koleksiyon yapisi

```text
users/{userId}

pets/{petId}
pets/{petId}/members/{userId}
pets/{petId}/careTasks/{taskId}
pets/{petId}/careEvents/{eventId}
pets/{petId}/reminders/{reminderId}
pets/{petId}/activityLogs/{logId}

invites/{inviteToken}

notificationTokens/{userId}/tokens/{tokenId}
```

Belge arsivi / Firebase Storage metadata modeli Faz 2 backlog'a tasinmistir; Sprint 11'de aktif koleksiyon veya Storage akisi eklenmez.

## users/{userId}

Kullanici profil dokumani.

Alanlar:
- `email`: string | null
- `fullName`: string | null
- `avatarUrl`: string | null
- `accountStatus`: `active` | `inactive`
- `deactivatedAt`: timestamp | null
- `isAnonymous`: boolean
- `onboardingCompleted`: boolean
- `onboardingCompletedAt`: timestamp | null
- `notificationPreferences`: map
  - `vaccine`: boolean
  - `internal_parasite`: boolean
  - `external_parasite`: boolean
  - `medicine`: boolean
  - `vet`: boolean
  - `other`: boolean
- `notificationPreferencesUpdatedAt`: timestamp | null
- `createdAt`: timestamp
- `updatedAt`: timestamp

Sprint 14 notu:
- Bildirim tercihleri reminder type bazlidir.
- Varsayilan olarak `vaccine`, `internal_parasite`, `external_parasite`, `medicine` ve `vet` aciktir; `other` kapali gelir.
- Food, water, litter, walk gibi care event tipleri bu preference modeline dahil degildir.

Hesap lifecycle notu:
- Misafir giris Firebase anonymous auth ile acilir ve `isAnonymous: true` profil alanini yazar.
- Hesap silme istegi Auth kullanicisini fiziksel silmez; `accountStatus: inactive` ve `deactivatedAt` set edilerek hesap pasife alinir.
- Pasif hesaplar client tarafindan tekrar active yapilamaz.

## pets/{petId}

Pet profil dokumani.

Alanlar:
- `ownerId`: string
- `name`: string
- `species`: `cat` | `dog` | `bird` | `rabbit` | `other`
- `breed`: string | null
- `birthDate`: timestamp | null
- `gender`: `male` | `female` | `unknown`
- `photoPath`: string | null
- `microchipNo`: string | null
- `notes`: string | null
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `deletedAt`: timestamp | null

Sprint 3'te pet olusturma client tarafinda Firestore batch ile yapilir. Ayni commit icinde `pets/{petId}` ve `pets/{petId}/members/{ownerId}` owner kaydi olusturulur.

## pets/{petId}/members/{userId}

Pet erisim kontrolunun merkezi.

Alanlar:
- `userId`: string
- `role`: `owner` | `editor` | `viewer`
- `status`: `active` | `removed`
- `invitedBy`: string | null
- `joinedAt`: timestamp
- `updatedAt`: timestamp

Kurallar:
- Owner her seyi yonetebilir.
- Editor care task, care event ve reminder olusturabilir.
- Viewer sadece okuyabilir.

Sprint 3 notu:
- Sprint 4 ile member bazli listeleme baslamistir.
- Uygulama `collectionGroup('members')` ile `userId == currentUserId` ve `status == active` kayitlarini bulur.
- Bu kayitlardan pet id listesi cikarilir ve ilgili `pets/{petId}` dokumanlari okunur.

## pets/{petId}/careTasks/{taskId}

Rutin bakim gorevi tanimi.

Alanlar:
- `id`: string
- `petId`: string
- `createdBy`: string
- `title`: string
- `eventType`: `food` | `medicine` | `litter` | `water` | `walk` | `bath` | `grooming` | `other`
- `scheduleType`: `none` | `daily` | `weekly` | `monthly`
- `dueTime`: string | null
- `isActive`: boolean
- `allowMultiplePerDay`: boolean
- `notifyEnabled`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `deletedAt`: timestamp | null

Faz 1'de karmasik RRULE yoktur.

## pets/{petId}/careEvents/{eventId}

Bakim tamamlandiginda veya atlandiginda olusan kayit.

Alanlar:
- `id`: string
- `petId`: string
- `taskId`: string | null
- `taskTitle`: string
- `userId`: string
- `userName`: string | null
- `eventType`: `food` | `medicine` | `litter` | `water` | `walk` | `bath` | `grooming` | `other`
- `status`: `done` | `skipped`
- `doneAt`: timestamp
- `occurrenceKey`: string | null
- `clientEventId`: string
- `note`: string | null
- `createdAt`: timestamp

`clientEventId` duplicate event onlemek icin kullanilir. Firestore'da global unique constraint olmadigi icin nihai duplicate kontrolu Cloud Functions veya deterministik document id stratejisiyle guclendirilmelidir.

Sprint 5 notu:
- Owner/editor `careTasks` olusturabilir.
- Viewer sadece gorevleri ve event gecmisini okuyabilir.
- `allowMultiplePerDay == false` icin event document id deterministik olarak `taskId + occurrenceKey` uzerinden uretilir ve transaction icinde mevcut event kontrol edilir.
- `allowMultiplePerDay == true` icin her isaretlemede yeni event dokumani olusur.
- Activity log yazimi bu sprintte yoktur; care event tamamlandiginda activity log yazimi ileride Cloud Function ile yapilacaktir.

Sprint 6 dashboard notu:
- Ana ekran secili pet icin `careTasks` ve `careEvents` koleksiyonlarini normal Firestore query ile okur.
- Dashboard `isActive == true` ve `deletedAt == null` gorevleri listeler.
- `daily`, `weekly` ve `monthly` gorevlerde completion durumu `occurrenceKey` ile hesaplanir.
- `none` gorevlerde dashboard son event bilgisini gosterir.
- Sprint 7 ile secili pet'in `careTasks` ve `careEvents` subcollection'lari realtime dinlenir.
- Realtime degisiklikleri local cache yerine ilgili React Query key'lerini invalidate ederek dashboard'u yeniler.

Sprint 13 quick log notu:
- Quick Log yeni bir backend modeli degildir; `careTasks` ve `careEvents` uzerinde calisan UX katmanidir.
- Secili `eventType` icin aktif care task varsa mevcut task uzerinden `careEvents` olusturulur.
- Aktif task yoksa owner/editor onayi ile gunluk care task olusturulur, ardindan ayni task uzerinden event isaretlenir.
- Duplicate task olusturmamak icin aktif `eventType` task'i once kullanilir.

## pets/{petId}/reminders/{reminderId}

Tarih bazli hatirlaticilar.

Alanlar:
- `id`: string
- `petId`: string
- `createdBy`: string
- `title`: string
- `reminderType`: `vaccine` | `internal_parasite` | `external_parasite` | `medicine` | `vet` | `other`
- `remindAt`: timestamp
- `recurrence`: `none` | `weekly` | `monthly` | `yearly`
- `notifyEnabled`: boolean
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `deletedAt`: timestamp | null

Sprint 9 notlari:
- Owner/editor pet altinda reminder olusturabilir, guncelleyebilir ve soft delete yapabilir.
- Viewer reminder okuyabilir, ancak olusturamaz/guncelleyemez/silemez.
- Silme gercek delete degildir; `deletedAt` set edilir ve `isActive` false yapilir.
- Reminders ekrani `deletedAt == null` ve `isActive == true` kayitlari listeler.
- Dashboard Yaklasanlar bolumu secili pet icin bugunden itibaren 30 gun icindeki aktif reminder kayitlarini `remindAt` tarihine gore siralar.
- Reminder realtime dinleme sadece secili pet'in `pets/{petId}/reminders` subcollection'i icin acilir.

## Faz 2 backlog: pets/{petId}/documents/{documentId}

Private Firebase Storage dosyasinin metadata kaydi Faz 2 backlog kapsamindadir. Sprint 11'de bu koleksiyon, client akisi veya Storage upload ozelligi eklenmez.

Alanlar:
- `petId`: string
- `uploadedBy`: string
- `title`: string
- `category`: `vaccine` | `lab` | `prescription` | `invoice` | `operation` | `other`
- `filePath`: string
- `fileType`: `image` | `pdf`
- `fileSize`: number | null
- `documentDate`: timestamp | null
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `deletedAt`: timestamp | null

Public URL saklanmaz. Dosya yolu `pets/{petId}/documents/{documentId}/{filename}` formatinda tutulur.

## pets/{petId}/activityLogs/{logId}

Ortak kullanimda "kim ne yapti?" akisi.

Alanlar:
- `petId`: string
- `actorId`: string
- `action`: string
- `targetType`: string | null
- `targetId`: string | null
- `metadata`: map | null
- `createdAt`: timestamp

Onerilen action degerleri:
- `pet_created`
- `pet_updated`
- `member_invited`
- `member_joined`
- `member_role_changed`
- `care_task_created`
- `care_task_completed`
- `reminder_created`
- `reminder_updated`
- `document_uploaded`
- `document_deleted`

## invites/{inviteToken}

Pet davet dokumani.

Alanlar:
- `id`: string
- `petId`: string
- `petName`: string
- `token`: string
- `role`: `editor` | `viewer`
- `invitedBy`: string
- `invitedByName`: string | null
- `acceptedBy`: string | null
- `status`: `pending` | `accepted` | `expired` | `cancelled`
- `expiresAt`: timestamp
- `createdAt`: timestamp
- `acceptedAt`: timestamp | null

Sprint 4 notlari:
- Invite token dokuman id'si olarak kullanilir.
- Token `crypto.getRandomValues` ile uretilen 18 byte hex string'dir.
- Davet linki uygulama ici `/invite/{token}` formatindadir.
- Pet basina active member limiti 2'dir; owner bu sayiya dahildir.

## notificationTokens/{userId}/tokens/{tokenId}

Expo push token kayitlari.

Alanlar:
- `id`: string
- `userId`: string
- `expoPushToken`: string
- `platform`: `ios` | `android` | `web`
- `deviceId`: string | null
- `isActive`: boolean
- `createdAt`: timestamp
- `updatedAt`: timestamp

Sprint 10 notlari:
- Expo push token client tarafinda Expo Notifications ile alinir.
- Token sadece `notificationTokens/{currentUserId}/tokens/{tokenId}` altina yazilir.
- `tokenId` Expo push token'dan deterministik uretilir; ayni token tekrar kaydedilirse duplicate dokuman olusmaz, mevcut dokuman guncellenir.
- Push reminder gonderimi client tarafindan yapilmaz; Cloud Function/Scheduler tarafinda tasarlanir.
- Push kapsaminda varsayilan kritik reminder tipleri: `medicine`, `vaccine`, `internal_parasite`, `external_parasite`, `vet`.
- Food/water/litter/walk gibi sik bakim event'leri icin bu sprintte push yoktur.
- Duplicate push korumasi icin Function tarafinda `lastNotifiedAt` veya ayri `notificationLogs` modeli kullanilmalidir.
