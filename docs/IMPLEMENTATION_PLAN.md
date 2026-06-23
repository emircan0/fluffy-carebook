# docs/IMPLEMENTATION_PLAN.md - YuvioPet Faz 1 Uygulama Plani

YuvioPet, aileler ve ortak bakicilar icin evcil hayvan bakim takip uygulamasidir. Ana deger onerisi ortak bakim, Quick Log, hatirlaticilar, asi/ilac/vet hatirlaticilari ve aile ici gorunurluktur.

## Faz 1 ana basari kriteri

Iki farkli kullanici ayni pet uzerinde bakim gorevlerini anlik olarak takip edebiliyor. Owner/editor islem yapabiliyor. Viewer sadece izleyebiliyor. Pet uyesi olmayan kullanici hicbir veriyi goremiyor.

## Sprint 0 - Proje iskeleti

Amac: Temiz, surdurulebilir Expo projesi kurmak.

Yapilacaklar:
- Expo + TypeScript proje kurulumu
- Expo Router kurulumu
- React Query provider
- Zustand app store
- Temel klasor yapisi
- `.env.local` ornegi
- Basit ana ekran

Dosyalar:
- `app/_layout.tsx`
- `app/index.tsx`
- `lib/queryClient.ts`
- `store/appStore.ts`
- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `.env.example`

Test:
- `npm install`
- `npx expo start`
- Ana ekranda YuvioPet gorunmeli
- TypeScript hatasi olmamali

Bu sprintte yapilmayacaklar:
- Auth yok
- Database migration yok
- Realtime yok
- UI suslemesi yok

## Sprint 1 - Firebase mimari iskeleti

Amac: Firebase tabanli backend omurgasini ve guvenlik modelini dokumante edip uygulamaya init katmanini eklemek.

Yapilacaklar:
- Firebase SDK kurulumu
- `.env.example` Firebase degiskenleri
- `lib/firebase.ts`
- Firestore veri modeli dokumani
- Firestore Security Rules taslagi
- Firebase Storage rules taslagi
- Eski backend referanslarini temizleme

Test:
- TypeScript hatasi olmamali
- Expo uygulamasi acilmali
- Firebase config env'den okunmali
- `lib/firebase.ts` import edilebilmeli
- Analytics kullanilmamali

Bu sprintte yapilmayacaklar:
- Auth ekranlari yok
- Realtime listener implementasyonu yok
- Belge yukleme akisi yok
- Cloud Functions deploy yok
- Faz 2 ozellikleri yok

## Sprint 2 - Firebase Auth + user profile

Amac: Kullanici Firebase Auth ile kayit/giris yapabilsin ve giris yapan kullanici icin Firestore'da `users/{userId}` dokumani olussun veya okunsun.

Yapilacaklar:
- Email/password ile kayit olma
- Email/password ile giris yapma
- Cikis yapma
- Auth state listener
- Loading/error state
- Firestore `users/{userId}` profile dokumani
- Auth ekranlari
- Route guard
- Minimum `firestore.rules`

Test:
- Yeni kullanici kayit olabilir
- Kayit sonrasi Firestore'da `users/{uid}` dokumani olusur
- Kullanici cikis yapabilir
- Ayni kullanici tekrar giris yapabilir
- Giris yapmadan ana ekrana erisemez
- Giris yaptiktan sonra auth ekraninda kalmaz
- TypeScript hatasi olmamali
- Expo uygulamasi acilmali
- Firebase env eksikse uygulama crash olmaz, anlasilir hata verir

Bu sprintte yapilmayacaklar:
- Pet olusturma yok
- Member sistemi yok
- Care task yok
- Realtime yok
- Belge yukleme yok
- Push notification yok

## Sprint 3 - Pet olusturma ve owner/member temeli

Amac: Giris yapan kullanici pet profili olusturabilsin. Pet olusturulunca Firestore'da hem `pets/{petId}` hem de `pets/{petId}/members/{userId}` owner kaydi ayni islemde olussun.

Yapilacaklar:
- Pet ve member TypeScript tipleri
- Firestore pet servisleri
- Pet olusturma mutation'i
- Owner pet listeleme query'si
- Pet ekleme formu
- Empty state
- Pet listesi ve pet karti
- Firestore Security Rules owner/member temel kurallari

Listeleme karari:
- Sprint 3'te davet/member listeleme akisi olmadigi icin pet listesi `pets` collection uzerinde `ownerId == currentUserId` sorgusuyla gelir.
- Ortak bakici daveti tamamlaninca member bazli listeleme stratejisi genisletilecek.

Test:
- Giris yapmis kullanici pet olusturabilir
- Firestore'da `pets/{petId}` olusur
- Firestore'da `pets/{petId}/members/{currentUserId}` owner olarak olusur
- Kullanici kendi petini listede gorur
- Cikis/giris sonrasi pet listesi tekrar gelir
- Baska kullanici ayni peti goremez
- Pet adi bosken form submit olmaz
- TypeScript hatasi olmamali
- Expo uygulamasi acilmali
- Firebase env eksikse uygulama crash olmaz

Bu sprintte yapilmayacaklar:
- Ortak bakici daveti yok
- Care task yok
- Care event yok
- Reminders yok
- Realtime yok
- Belge yukleme yok
- Push notification yok

## Sonraki sprintler

## Sprint 4 - Ortak bakici daveti ve member rolleri

Amac: Owner kendi pet'ine editor veya viewer rolunde bakici daveti olusturabilsin. Davet kabul edilince `pets/{petId}/members/{userId}` altinda aktif member kaydi olussun ve pet listesi member bazli calissin.

Yapilacaklar:
- Invite ve member TypeScript tipleri
- Invite olusturma mutation'i
- Invite kabul mutation'i
- Token ile invite okuma query'si
- Pet members query'si
- Pet detay ekrani
- Invite kabul ekrani
- Owner-only davet UI'i
- Role badge gosterimi
- Collection group ile member bazli pet listeleme
- Firestore Security Rules invite/member temel kurallari

Listeleme karari:
- Pet listesi `collectionGroup('members')` ile `userId == currentUserId` ve `status == active` sorgusundan pet id'leri bulur.
- Bulunan pet id'lerinin `pets/{petId}` dokumanlari okunur.
- Owner-only sorgu davranisi bu yolla kapsanir; duplicate pet gosterilmez.

Limit karari:
- Faz 1 ucretsiz planda pet basina en fazla 2 active member vardir. Owner bu sayiya dahildir.
- Client servisinde invite olusturma ve invite kabul oncesi active member sayisi kontrol edilir.
- Eszamanli kabul/davet yarislari icin nihai limit enforcement Cloud Function'a tasinmalidir.

Bu sprintte yapilmayacaklar:
- Care task yok
- Care event yok
- Reminders yok
- Realtime yok
- Belge yukleme yok
- Push notification yok

## Sonraki sprintler

## Sprint 5 - Care task + care event

Amac: Owner/editor pet altinda bakim gorevleri olusturabilsin ve tek dokunusla tamamlayabilsin. Viewer sadece gorevleri ve gecmisi okuyabilsin.

Yapilacaklar:
- CareTask ve CareEvent TypeScript tipleri
- Care task servisleri ve query/mutation hook'lari
- Care event isaretleme mutation'i
- Pet detay ekraninda bakim gorevleri bolumu
- Pet detay ekraninda son bakim hareketleri bolumu
- Firestore Security Rules careTasks/careEvents kurallari

Duplicate stratejisi:
- `allowMultiplePerDay == false` iken event id `taskId + occurrenceKey` uzerinden deterministik uretilir.
- Transaction icinde bu event dokumani varsa yeni event olusturulmaz.
- `allowMultiplePerDay == true` iken her isaretleme yeni event dokumani olusturur.

Bu sprintte yapilmayacaklar:
- Realtime listener yok
- Reminders yok
- Belge yukleme yok
- Push notification yok
- Activity log client yazimi yok

## Sprint 6 - Bugun / Yaklasanlar dashboard

Amac: Ana ekran kullanicinin secili pet'i icin gunluk bakim akisini gostersin. Kullanici pet'leri arasinda gecis yapabilsin, owner/editor bugunun gorevlerini tamamlayabilsin, viewer sadece okuyabilsin.

Yapilacaklar:
- Ana ekrani dashboard olarak duzenle
- Pet selector ile member oldugu pet'ler arasinda gecis
- `useTodayDashboard` ile careTasks ve careEvents verisini normal Firestore query'leriyle oku
- Bugunun gorevlerini dueTime ve basliga gore sirala
- Completion durumunu occurrenceKey ve bugunku event kayitlarina gore hesapla
- Son bakim hareketleri ve Yaklasanlar placeholder bolumleri
- `Yapildi` sonrasi React Query invalidation ile dashboard'u yenile

Completion stratejisi:
- `daily`: `YYYY-MM-DD`
- `weekly`: `YYYY-WW`
- `monthly`: `YYYY-MM`
- `none`: son event bilgisi gosterilir.
- `allowMultiplePerDay == false` icin ayni occurrence event'i varsa gorev yapildi kabul edilir.
- `allowMultiplePerDay == true` icin bugunku event sayisi gosterilir.

Bu sprintte yapilmayacaklar:
- Realtime listener yok
- Hatirlatici olusturma ekrani yok
- Belge yukleme yok
- Push notification yok
- Faz 2 modulleri yok

## Sprint 7 - Firestore realtime listeners

Amac: Ayni pet'e uye kullanicilarin bakim gorevi ve bakim hareketi degisiklikleri manuel refresh olmadan dashboard ve pet detay ekranina yansisin.

Yapilacaklar:
- Secili pet icin `onSnapshot` tabanli realtime hook
- Dashboard'da secili pet `careTasks`, `careEvents` ve `members` dinleme
- Pet detayda `pets/{petId}`, `members`, `careTasks` ve `careEvents` dinleme
- Snapshot degisikliklerinde sadece ilgili pet'in React Query key'lerini invalidate etme
- Pet degisimi, ekran kapanisi ve logout sirasinda unsubscribe cleanup

Realtime prensipleri:
- Filtresiz/global collection listener yasaktir.
- Faz 1'de sadece secili pet dinlenir; tum pet'leri ayni anda dinlemek zorunlu degildir.
- Listener read yetkisi Security Rules'a baglidir. Member olmayan kullanici veri dinleyemez.
- Viewer realtime veriyi okuyabilir, ancak yazma yetkisi kazanmaz.
- Initial snapshot refetch tetiklemek icin kullanilmaz; sonraki degisiklikler query invalidation yapar.

Bu sprintte yapilmayacaklar:
- Reminders olusturma ekrani yok
- Belge yukleme yok
- Push notification yok
- Tam offline sync yok
- Faz 2 modulleri yok

## Sonraki sprintler

## Sprint 9 - Reminders / Hatirlaticilar

Amac: Kullanici secili pet icin asi, ic parazit, dis parazit, ilac ve veteriner kontrolu gibi tarih bazli hatirlaticilar olusturabilsin. Aktif hatirlaticilar Reminders ekraninda listelensin ve dashboard Yaklasanlar bolumunde onumuzdeki 30 gun icin gorunsun.

Yapilacaklar:
- Reminder, ReminderType ve ReminderRecurrence TypeScript tipleri
- Reminder servisleri ve React Query query/mutation hook'lari
- Owner/editor icin reminder olusturma, guncelleme ve soft delete
- Viewer icin read-only reminder listesi
- `app/(tabs)/reminders.tsx` Reminders ekrani
- Dashboard Yaklasanlar bolumunun gercek reminders verisini kullanmasi
- Secili pet'in `reminders` subcollection'i icin realtime listener invalidation'i
- Firestore Security Rules reminder read/write kurallari

Dashboard Yaklasanlar karari:
- Secili pet icin `isActive == true` reminder kayitlari okunur.
- Client tarafinda `deletedAt == null` olmayan kayitlar elenir.
- Bugunden itibaren 30 gun icindeki reminder kayitlari gosterilir.
- Gecmis reminder dashboard'da gosterilmez.
- 30 gunden sonraki reminder dashboard'da gosterilmez, ancak Reminders ekraninda kalir.

Silme karari:
- Reminder fiziksel olarak silinmez.
- Soft delete sirasinda `deletedAt` set edilir ve `isActive` false yapilir.
- Firestore `allow delete` kapali tutulur.

Bu sprintte yapilmayacaklar:
- Push notification yok
- Belge yukleme yok
- Analytics yok
- Faz 2 ozellikleri yok

Sonraki sprintler:
## Sprint 10 - Expo push notification temeli

Amac: Kullanici manuel aksiyonla bildirim izni verebilsin, cihazinin Expo push token'i Firestore'a kaydedilsin ve kritik reminder'lar icin server-side gonderim mimarisi hazirlansin.

Yapilacaklar:
- `expo-notifications` paketi ve mevcut `expo-constants` cihaz/session bilgisi
- Notification permission helper'lari
- Expo push token alma helper'i
- `notificationTokens/{userId}/tokens/{tokenId}` token kaydi
- Duplicate token dokumani olusmamasi icin deterministik token id
- Profile ekraninda yumusak bildirim karti
- Notification token Security Rules
- Cloud Function/Scheduler reminder gonderim taslagi dokumani

Push kapsam karari:
- Varsayilan push kapsamindaki reminder tipleri: `medicine`, `vaccine`, `internal_parasite`, `external_parasite`, `vet`.
- Food/water/litter/walk gibi sik bakim event'leri icin push bu sprintte yoktur.
- Push izni uygulama acilisinda otomatik istenmez; kullanici Profile ekranindaki karttan baslatir.
- Web push bu sprintte aktif degildir; mobil Expo/development build testine hazir altyapi kurulur.

Gonderim karari:
- Client sadece token alir ve kullanicinin kendi path'ine yazar.
- Reminder push gonderimi Cloud Function/Scheduler tarafinda yapilacaktir.
- Duplicate push engeli icin Function tarafinda `lastNotifiedAt` veya `notificationLogs` modeli kullanilacaktir.

Bu sprintte yapilmayacaklar:
- Production cron deploy yok
- Belge yukleme yok
- Analytics yok
- Supabase yok
- Faz 2 ozellikleri yok

Sonraki sprintler:
- Sprint 11: Rules hardening, guvenlik kontrolu ve beta oncesi teknik saglamlastirma

## Sprint 12 - Onboarding ve ilk kurulum

Amac: Yeni kullanici kayit olduktan sonra bos ekranda kalmadan ilk petini, temel bakim gorevlerini ve opsiyonel bakici davetini kurabilsin.

Yapilacaklar:
- `app/onboarding.tsx` route'u
- Route guard icinde `onboardingCompleted` kontrolu
- Mevcut `createPet` mutation'i ile ilk pet olusturma
- Mevcut `createCareTask` mutation'i ile secilen varsayilan gorevleri olusturma
- Ayni `title + eventType` varsa duplicate task olusturmama
- Mevcut `createInvite` mutation'i ile opsiyonel bakici daveti
- `users/{uid}` dokumaninda `onboardingCompleted` ve `onboardingCompletedAt`
- Dashboard pet-yok empty state'inden kuruluma yonlendirme

Bu sprintte yapilmayacaklar:
- Yeni backend mimarisi yok
- Belge arsivi / Firebase Storage yok
- Push scheduler / production cron yok
- Faz 2 ozellikleri yok

Sonraki sprintler:

## Sprint 13 - Quick Log / Hizli Bakim deneyimi

Amac: Dashboard uzerinde secili pet icin sik bakim aksiyonlari tek dokunusla isaretlenebilsin.

Yapilacaklar:
- Dashboard quick log alanini `Mama`, `Su`, `Kum`, `Ilac`, `Yuruyus` kartlariyla guclendirme
- Aktif `eventType` care task varsa mevcut `markCareEvent` mutation'i ile event olusturma
- Aktif task yoksa owner/editor onayi ile mevcut `createCareTask` mutation'i uzerinden gunluk task olusturma
- Task olustuktan sonra ayni task uzerinden `markCareEvent` calistirma
- `food` ve `water` icin `allowMultiplePerDay: true`
- `medicine`, `litter`, `walk` icin `allowMultiplePerDay: false`
- Viewer icin quick log kartlarini read-only gosterme
- Basarili/hata/loading feedback'i ekleme

Model karari:
- Quick Log yeni backend modeli degildir.
- `careTasks` ve `careEvents` mevcut modeli uzerinde UX katmani olarak calisir.
- Duplicate task olusturmamak icin once aktif `eventType` task'i aranir.
- Duplicate event korumasi mevcut `markCareEvent` transaction/deterministic id stratejisinde kalir.

Bu sprintte yapilmayacaklar:
- Yeni backend mimarisi yok
- Firestore modelinde buyuk degisiklik yok
- Security Rules degisikligi yok
- Belge arsivi / Firebase Storage yok
- Push scheduler / production cron yok
- Faz 2 ozellikleri yok

Sonraki sprintler:

## Sprint 14 - Bildirim tercihleri

Amac: Kullanici profil ekranindan hangi reminder tipleri icin bildirim almak istedigini yonetebilsin.

Yapilacaklar:
- `NotificationPreferences` TypeScript modeli
- Yeni kullanici profilinde varsayilan `notificationPreferences`
- Eski kullanici icin fallback default preference
- Profile ekraninda `Aşı`, `İç parazit`, `Dış parazit`, `İlaç`, `Veteriner`, `Diğer` toggle listesi
- Toggle degisince `users/{uid}` dokumaninda `notificationPreferences` update'i
- `notificationPreferencesUpdatedAt` timestamp'i
- Security Rules icinde sadece beklenen preference key'lerini ve boolean degerleri kabul etme
- Push dokumaninda scheduler karar sirasini preference ile genisletme

Model karari:
- Bildirim tercihleri user bazlidir ve `users/{uid}` dokumaninda saklanir.
- Tercihler reminder type bazlidir; food/water/litter/walk gibi care event tipleri dahil degildir.
- Production push scheduler bu sprintte kurulmaz.

Bu sprintte yapilmayacaklar:
- Production push scheduler veya Cloud Function cron yok
- Test push butonu yok
- Yeni backend mimarisi yok
- Faz 2 ozellikleri yok

Sonraki sprintler:

## Sprint 15 - Beta polish ve build hazirligi

Amac: Ilk gercek cihaz/beta testine cikmadan once metadata, env ornegi, EAS build taslagi, QA checklist ve bilinen riskleri hazirlamak.

Yapilacaklar:
- App metadata kontrolu: name, slug, scheme, version, bundle identifier, Android package
- Splash background ve mevcut placeholder asset kontrolu
- `.env.example` beta degiskenleri
- `eas.json` development / preview / production taslagi
- Push gercek cihaz test notlari
- `docs/BETA_QA_CHECKLIST.md`
- `docs/KNOWN_RISKS.md`
- RN Web shadow warning icin design system duzeltmesi

Bu sprintte yapilmayacaklar:
- Production build calistirma yok
- Cloud Function cron yok
- Test push butonu yok
- Yeni urun ozelligi yok
- Faz 2 ozellikleri yok

## Faz 1 tamamlanan omurga

- Auth
- Onboarding
- Pet
- Invite/member
- Care task/event
- Quick Log
- Dashboard
- Realtime
- UI/UX light-mode temel tasarim
- Reminders
- Push token altyapisi
- Notification preferences
- Rules hardening
- Beta QA dokumantasyonu

## Faz 2 backlog

- Belge arsivi / Firebase Storage
- Kilo/gelisim grafigi
- Masraf takibi
- PDF rapor
- Rules emulator otomasyonlari genisletme
- Cloud Function ile invite accept/member limit kesinlestirme
- Reminder push scheduler production kurulumu
- Native date picker
- RevenueCat premium

## Realtime prensibi

Realtime sadece kullanicinin uye oldugu ve ekranda secili olan pet icin acilir. Global koleksiyon listener'i yasaktir. Listener kuran her hook pet degisimi, ekran kapanisi ve logout sirasinda unsubscribe etmelidir.

## Offline tolerans

Faz 1'de tam offline sync yoktur. Minimum tolerans: React Query retry 3, network hatasinda toast, care_event icin sade optimistic UI ve `client_event_id` ile duplicate onleme.

## Codex calisma kurali

Her sprintte sadece sprint kapsamini yap. Faz 2 ozellikleri, gereksiz UI animasyonu, marketplace, AI, veteriner paneli, masraf/kilo modulu ve public storage URL ekleme.
