# docs/KNOWN_RISKS.md - Fluffy Carebook Bilinen Riskler

## Beta Oncesi Teknik Riskler

- Firestore Rules emulator testleri tam otomatik kosulmadi; Sprint 11'de manuel test plani ve rules parse kontrolu yapildi.
- 2 active member limiti Cloud Function olmadan race condition'a aciktir.
- Care event duplicate enforcement kotu niyetli client'a karsi Cloud Function kadar guclu degildir; MVP'de transaction + deterministic id stratejisi kullanilir.
- Push notification gercek cihaz veya development build gerektirir; web push Sprint 15 kapsaminda aktif degildir.
- `npm audit` moderate vulnerability raporu vardir; Expo/Firebase uyumu bozulmamasi icin otomatik fix uygulanmadi.
- Belge arsivi / Firebase Storage Faz 2'ye tasindi.
- Date input alanlari ileride native date picker ile iyilestirilecektir.
- Firebase Auth native persistence ileride AsyncStorage persistence ile iyilestirilebilir.
- Production reminder push scheduler henuz kurulmadı.
- Local `ios/` metadata Sprint 15'te Expo config ile esitlendi; ileride `npx expo prebuild` calistirilirsa native diff yeniden kontrol edilmelidir.
- Marka adi Fluffy Carebook olarak guncellendi. Store yayinindan once Google Play, App Store, domain ve marka tescil kontrolu yapilmalidir.
- Kesin hukuki uygunluk icin marka danismani veya avukat kontrolu gerekir.
- TODO: Fluffy Carebook icin ozel app icon ve splash hazirlanacak.
