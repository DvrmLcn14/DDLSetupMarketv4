import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'tr' | 'it' | 'de' | 'es';

export const translations = {
  en: {
    // Header & Brand
    brandSubtitle: 'Official F1 24, F1 25 & F1 26 Setup Marketplace',
    setupsTab: 'Setups',
    favoritesTab: 'Favorites',
    adminReview: 'Admin Review',
    panelBadge: 'Panel',
    submitSetup: 'Submit Setup',
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',

    // Language selector label
    languageLabel: 'Language',
    turkish: 'Türkçe',
    english: 'English',
    italian: 'Italiano',
    german: 'Deutsch',
    spanish: 'Español',

    // Marketplace Titles & Filters
    marketplaceTitle: 'F1® Telemetry & Race Setup Database',
    marketplaceSubtitle:
      'Verified esports telemetry setups, lap time screenshots, and setup sheets for F1® 24, F1® 25, and F1® 26.',
    searchPlaceholder: 'Search by track, car, creator or setup notes...',
    allTracks: 'All Tracks',
    allWeather: 'All Weather',
    dryOnly: 'Dry Setups',
    wetOnly: 'Wet Setups',
    intermediate: 'Intermediate',
    allTypes: 'All Types',
    timeTrial: 'Time Trial',
    race: 'Race',
    qualifying: 'Qualifying',

    // Sort options
    sortBy: 'Sort By',
    highestRated: 'Highest Rated',
    mostRecent: 'Most Recent',
    topSpeed: 'Top Speed',
    mostFavorited: 'Most Favorited',
    mostDownloaded: 'Most Downloaded',
    verifiedOnly: 'Verified Only',

    // Status Badges
    telemetryVerified: 'Telemetry Verified',
    verifiedProof: 'Proof Verified',
    pendingVerification: 'Pending Verification',
    rejected: 'Rejected',

    // Setup Card & Modal
    viewSetup: 'View Setup',
    setupCopied: 'Setup Copied!',
    downloadSetup: 'Download Setup',
    bestLapTime: 'Best Lap Time',
    downforceLevel: 'Downforce',
    creator: 'Creator',
    addedDate: 'Added',
    downloads: 'Downloads',
    favorites: 'Favorites',

    // Tuning Spec Categories
    aerodynamics: 'Aerodynamics',
    frontWing: 'Front Wing Aero',
    rearWing: 'Rear Wing Aero',

    transmission: 'Transmission & Differential',
    diffOnThrottle: 'Diff On Throttle',
    diffOffThrottle: 'Diff Off Throttle',

    suspensionGeometry: 'Suspension Geometry',
    frontCamber: 'Front Camber',
    rearCamber: 'Rear Camber',
    frontToe: 'Front Toe',
    rearToe: 'Rear Toe',

    suspension: 'Suspension & Anti-Roll Bar',
    frontSuspension: 'Front Suspension',
    rearSuspension: 'Rear Suspension',
    frontAntiRollBar: 'Front Anti-Roll Bar',
    rearAntiRollBar: 'Rear Anti-Roll Bar',
    frontRideHeight: 'Front Ride Height',
    rearRideHeight: 'Rear Ride Height',

    brakes: 'Brakes',
    brakePressure: 'Brake Pressure',
    brakeBias: 'Brake Bias',

    tyres: 'Tyre Pressures',
    frontLeftTyre: 'Front Left',
    frontRightTyre: 'Front Right',
    rearLeftTyre: 'Rear Left',
    rearRightTyre: 'Rear Right',

    notesAndStrategy: 'Creator Notes & Strategy',
    reviewsAndDiscussions: 'Discussions & Reviews',
    writeReviewPlaceholder: 'Share feedback or ask questions about this setup...',
    submitReview: 'Post Review',
    noReviewsYet: 'No reviews yet for this setup. Be the first to post feedback!',

    // Submit Modal
    submitModalTitle: 'Submit F1 Setup Sheet & Telemetry',
    submitModalSubtitle: 'Share your esports setup with lap time proof and telemetry screenshots.',
    setupTitleLabel: 'Setup Title',
    gameLabel: 'Game Version',
    trackLabel: 'Track Location',
    carLabel: 'Car Model',
    lapTimeLabel: 'Best Lap Time (e.g. 1:28.452)',
    conditionLabel: 'Weather Condition',
    typeLabel: 'Session Type',
    notesLabel: 'Setup Notes / Driving Tips',
    proofScreenshotLabel: 'Lap Time / Telemetry Screenshot Proof',
    submitButtonText: 'Submit Setup for Verification',
    closeModal: 'Close',

    // Weather & Track Conditions
    dryWeather: 'Dry Weather',
    wetWeather: 'Wet Weather',
    trackConditionAll: 'TRACK CONDITION: All',
    trackConditionDry: 'TRACK CONDITION: Dry',
    trackConditionWet: 'TRACK CONDITION: Wet',

    // Verification & Setup Types
    adminVerified: 'Admin Verified',
    pending: 'Pending',
    racePace: 'Race Pace',
    showing: 'Showing',
    setupsCountText: 'setups',
    filterAll: 'All',

    // Card Actions & Buttons
    copySetup: 'Copy Setup',
    copiedSetup: 'Copied',
    discuss: 'Discuss',
    edit: 'Edit',
    delete: 'Delete',
    viewDetails: 'View Details',

    // Ratings & Reviews
    noRatingsYet: 'No ratings yet',
    ratedStar: 'Rated',
    reviewsCountText: 'reviews',
    rateButton: '+ Rate',

    // Hero Header
    activeGameLabel: 'ACTIVE GAME:',

    // Floating Banner Ads
    adBadgeText: 'ADVERTISEMENT',
    announcementBadge1: 'ANNOUNCEMENT 1',
    announcementBadge2: 'ANNOUNCEMENT 2',
    sponsorBadge: 'SPONSOR / AD',
    onlineText: 'online',

    // No Results
    noSetupsFound: 'No setups found matching your active filters.',
    resetFilters: 'Reset All Filters',
  },
  tr: {
    // Header & Brand
    brandSubtitle: 'Resmî F1 24, F1 25 ve F1 26 Setup Pazarı',
    setupsTab: 'Setuplar',
    favoritesTab: 'Favoriler',
    adminReview: 'Admin İnceleme',
    panelBadge: 'Panel',
    submitSetup: 'Setup Gönder',
    signIn: 'Giriş Yap',
    register: 'Kayıt Ol',
    signOut: 'Çıkış Yap',

    // Language selector label
    languageLabel: 'Dil',
    turkish: 'Türkçe',
    english: 'English',
    italian: 'Italiano',
    german: 'Deutsch',
    spanish: 'Español',

    // Marketplace Titles & Filters
    marketplaceTitle: 'F1® Telemetri ve Yarış Setup Veritabanı',
    marketplaceSubtitle:
      'F1® 24, F1® 25 ve F1® 26 için doğrulanmış espor telemetri setupları, tur zamanı ekran görüntüleri ve ayar sayfaları.',
    searchPlaceholder: 'Pist, araç, geliştirici veya setup notlarına göre ara...',
    allTracks: 'Tüm Pistler',
    allWeather: 'Tüm Hava Durumu',
    dryOnly: 'Kuru Zemin Setupları',
    wetOnly: 'Islak Zemin Setupları',
    intermediate: 'Geçiş / Orta Islak',
    allTypes: 'Tüm Setup Tipleri',
    timeTrial: 'Zaman Turu',
    race: 'Yarış',
    qualifying: 'Sıralama',

    // Weather & Track Conditions
    dryWeather: 'Kuru Hava',
    wetWeather: 'Yağışlı Hava',
    trackConditionAll: 'PİST DURUMU: Tümü',
    trackConditionDry: 'PİST DURUMU: Kuru',
    trackConditionWet: 'PİST DURUMU: Yağışlı',

    // Verification & Setup Types
    adminVerified: 'Admin Onaylı',
    pending: 'Beklemede',
    racePace: 'Yarış Temposu',
    showing: 'Gösterilen',
    setupsCountText: 'adet setup',
    filterAll: 'Tümü',

    // Card Actions & Buttons
    copySetup: "Setup'u Kopyala",
    copiedSetup: 'Kopyalandı',
    discuss: 'Tartışma',
    edit: 'Düzenle',
    delete: 'Sil',
    viewDetails: 'Detayları Gör',

    // Ratings & Reviews
    noRatingsYet: 'Henüz puan yok',
    ratedStar: 'Puan',
    reviewsCountText: 'değerlendirme',
    rateButton: '+ Puan Ver',

    // Hero Header
    activeGameLabel: 'AKTİF OYUN:',

    // Sort options
    sortBy: 'Sırala',
    highestRated: 'En Yüksek Puan',
    mostRecent: 'En Yeniler',
    topSpeed: 'En Yüksek Hız',
    mostFavorited: 'En Çok Favorilenen',
    mostDownloaded: 'En Çok İndirilen',
    verifiedOnly: 'Sadece Doğrulanmışlar',

    // Status Badges
    telemetryVerified: 'Telemetri Doğrulanmış',
    verifiedProof: 'Kanıt Doğrulandı',
    pendingVerification: 'Doğrulama Bekliyor',
    rejected: 'Reddedildi',

    // Setup Card & Modal
    viewSetup: "Setup'ı İncele",
    setupCopied: 'Setup Kopyalandı!',
    downloadSetup: 'Setup\'ı İndir',
    bestLapTime: 'En İyi Tur Zamanı',
    downforceLevel: 'Basma Kuvveti (Downforce)',
    creator: 'Geliştirici',
    addedDate: 'Eklendi',
    downloads: 'İndirmeler',
    favorites: 'Favoriler',

    // Tuning Spec Categories
    aerodynamics: 'Aerodinami',
    frontWing: 'Ön Kanat Aerodinami',
    rearWing: 'Arka Kanat Aerodinami',

    transmission: 'Şanzıman ve Diferansiyel',
    diffOnThrottle: 'Hızlanmada Diferansiyel (On-Throttle)',
    diffOffThrottle: 'Yavaşlamada Diferansiyel (Off-Throttle)',

    suspensionGeometry: 'Süspansiyon Geometrisi',
    frontCamber: 'Ön Kamber',
    rearCamber: 'Arka Kamber',
    frontToe: 'Ön Toe',
    rearToe: 'Arka Toe',

    suspension: 'Süspansiyon ve Viraj Demiri',
    frontSuspension: 'Ön Süspansiyon',
    rearSuspension: 'Arka Süspansiyon',
    frontAntiRollBar: 'Ön Viraj Demiri (ARB)',
    rearAntiRollBar: 'Arka Viraj Demiri (ARB)',
    frontRideHeight: 'Ön Araç Yüksekliği',
    rearRideHeight: 'Arka Araç Yüksekliği',

    brakes: 'Frenler',
    brakePressure: 'Fren Basıncı',
    brakeBias: 'Ön Fren Dengesi (Bias)',

    tyres: 'Lastik Basınçları',
    frontLeftTyre: 'Sol Ön Lastik',
    frontRightTyre: 'Sağ Ön Lastik',
    rearLeftTyre: 'Sol Arka Lastik',
    rearRightTyre: 'Sağ Arka Lastik',

    notesAndStrategy: 'Geliştirici Notları ve Strateji',
    reviewsAndDiscussions: 'Tartışmalar ve Değerlendirmeler',
    writeReviewPlaceholder: 'Bu setup hakkında görüşlerinizi paylaşın veya soru sorun...',
    submitReview: 'Yorum Yayınla',
    noReviewsYet: 'Bu setup için henüz yorum yazılmadı. İlk yorum yapan siz olun!',

    // Submit Modal
    submitModalTitle: 'F1 Setup Sayfası ve Telemetri Gönder',
    submitModalSubtitle: 'Espor setup ayarlarınızı tur zamanı kanıtı ve telemetri ekran görüntüleri ile paylaşın.',
    setupTitleLabel: 'Setup Başlığı',
    gameLabel: 'Oyun Sürümü',
    trackLabel: 'Pist Seçimi',
    carLabel: 'Araç Modeli',
    lapTimeLabel: 'En İyi Tur Zamanı (Örn. 1:28.452)',
    conditionLabel: 'Hava Durumu',
    typeLabel: 'Seans Tipi',
    notesLabel: 'Setup Notları / Sürüş İpuçları',
    proofScreenshotLabel: 'Tur Zamanı / Telemetri Ekran Görüntüsü Kanıtı',
    submitButtonText: 'Setup\'ı İncelemeye Gönder',
    closeModal: 'Kapat',

    // Floating Banner Ads
    adBadgeText: 'REKLAM',
    announcementBadge1: 'DUYURU 1',
    announcementBadge2: 'DUYURU 2',
    sponsorBadge: 'SPONSOR / REKLAM',
    onlineText: 'çevrim içi',

    // No Results
    noSetupsFound: 'Filtrelerinize uygun setup bulunamadı.',
    resetFilters: 'Tüm Filtreleri Sıfırla',
  },
  it: {
    // Header & Brand
    brandSubtitle: 'Mercato Ufficiale Setup F1 24, F1 25 & F1 26',
    setupsTab: 'Setup',
    favoritesTab: 'Preferiti',
    adminReview: 'Revisione Admin',
    panelBadge: 'Pannello',
    submitSetup: 'Invia Setup',
    signIn: 'Accedi',
    register: 'Registrati',
    signOut: 'Esci',

    // Language selector label
    languageLabel: 'Lingua',
    turkish: 'Türkçe',
    english: 'English',
    italian: 'Italiano',
    german: 'Deutsch',
    spanish: 'Español',

    // Marketplace Titles & Filters
    marketplaceTitle: 'Database Setup di Gara e Telemetria F1®',
    marketplaceSubtitle:
      'Setup di telemetria esports verificati, screenshot dei tempi sul giro e schede setup per F1® 24, F1® 25 e F1® 26.',
    searchPlaceholder: 'Cerca per circuito, auto, creatore o note...',
    allTracks: 'Tutti i Circuiti',
    allWeather: 'Meteo Tutti',
    dryOnly: 'Setup Asciutto',
    wetOnly: 'Setup Bagnato',
    intermediate: 'Intermedio',
    allTypes: 'Tutti i Tipi',
    timeTrial: 'Time Trial',
    race: 'Gara',
    qualifying: 'Qualifica',

    // Weather & Track Conditions
    dryWeather: 'Tempo Asciutto',
    wetWeather: 'Tempo Bagnato',
    trackConditionAll: 'CONDIZIONI PISTA: Tutte',
    trackConditionDry: 'CONDIZIONI PISTA: Asciutto',
    trackConditionWet: 'CONDIZIONI PISTA: Bagnato',

    // Verification & Setup Types
    adminVerified: 'Verificato da Admin',
    pending: 'In Attesa',
    racePace: 'Passo Gara',
    showing: 'Mostrando',
    setupsCountText: 'setup',
    filterAll: 'Tutti',

    // Card Actions & Buttons
    copySetup: 'Copia Setup',
    copiedSetup: 'Copiato',
    discuss: 'Discussione',
    edit: 'Modifica',
    delete: 'Elimina',
    viewDetails: 'Vedi Dettagli',

    // Ratings & Reviews
    noRatingsYet: 'Nessuna valutazione',
    ratedStar: 'Voto',
    reviewsCountText: 'recensioni',
    rateButton: '+ Valuta',

    // Hero Header
    activeGameLabel: 'GIOCO ATTIVO:',

    // Sort options
    sortBy: 'Ordina per',
    highestRated: 'Valutazione Più Alta',
    mostRecent: 'Più Recenti',
    topSpeed: 'Velocità Massima',
    mostFavorited: 'Più Preferiti',
    mostDownloaded: 'Più Scaricati',
    verifiedOnly: 'Solo Verificati',

    // Status Badges
    telemetryVerified: 'Telemetria Verificata',
    verifiedProof: 'Prova Verificata',
    pendingVerification: 'In Attesa di Verifica',
    rejected: 'Rifiutato',

    // Setup Card & Modal
    viewSetup: 'Visualizza Setup',
    setupCopied: 'Setup Copiato!',
    downloadSetup: 'Scarica Setup',
    bestLapTime: 'Miglior Tempo sul Giro',
    downforceLevel: 'Carico Aerodinamico',
    creator: 'Creatore',
    addedDate: 'Aggiunto',
    downloads: 'Download',
    favorites: 'Preferiti',

    // Tuning Spec Categories
    aerodynamics: 'Aerodinamica',
    frontWing: 'Ala Anteriore',
    rearWing: 'Ala Posteriore',

    transmission: 'Trasmissione e Differenziale',
    diffOnThrottle: 'Differenziale in Accelerazione',
    diffOffThrottle: 'Differenziale in Rilascio',

    suspensionGeometry: 'Geometria Sospensioni',
    frontCamber: 'Camber Anteriore',
    rearCamber: 'Camber Posteriore',
    frontToe: 'Toe Anteriore',
    rearToe: 'Toe Posteriore',

    suspension: 'Sospensioni e Barre Antirollio',
    frontSuspension: 'Sospensione Anteriore',
    rearSuspension: 'Sospensione Posteriore',
    frontAntiRollBar: 'Barra Antirollio Anteriore',
    rearAntiRollBar: 'Barra Antirollio Posteriore',
    frontRideHeight: 'Altezza da Terra Anteriore',
    rearRideHeight: 'Altezza da Terra Posteriore',

    brakes: 'Freni',
    brakePressure: 'Pressione Freni',
    brakeBias: 'Bilanciamento Freni',

    tyres: 'Pressione Pneumatici',
    frontLeftTyre: 'Anteriore Sinistra',
    frontRightTyre: 'Anteriore Destra',
    rearLeftTyre: 'Posteriore Sinistra',
    rearRightTyre: 'Posteriore Destra',

    notesAndStrategy: 'Note del Creatore e Strategia',
    reviewsAndDiscussions: 'Discussioni e Recensioni',
    writeReviewPlaceholder: 'Condividi un feedback o fai una domanda...',
    submitReview: 'Invia Recensione',
    noReviewsYet: 'Nessuna recensione per questo setup. Sii il primo!',

    // Submit Modal
    submitModalTitle: 'Invia Scheda Setup F1 e Telemetria',
    submitModalSubtitle: 'Condividi il tuo setup esports con screenshot di tempo e telemetria.',
    setupTitleLabel: 'Titolo Setup',
    gameLabel: 'Versione Gioco',
    trackLabel: 'Circuito',
    carLabel: 'Modello Auto',
    lapTimeLabel: 'Miglior Tempo (es. 1:28.452)',
    conditionLabel: 'Condizioni Meteo',
    typeLabel: 'Tipo Sessione',
    notesLabel: 'Note Setup / Consigli di Guida',
    proofScreenshotLabel: 'Prova Screenshot Telemetria / Tempo',
    submitButtonText: 'Invia Setup per la Verifica',
    closeModal: 'Chiudi',

    // Floating Banner Ads
    adBadgeText: 'PUBBLICITÀ',
    announcementBadge1: 'ANNUNCIO 1',
    announcementBadge2: 'ANNUNCIO 2',
    sponsorBadge: 'SPONSOR / PUBBLICITÀ',
    onlineText: 'online',

    // No Results
    noSetupsFound: 'Nessun setup trovato con i filtri attivi.',
    resetFilters: 'Ripristina Filtri',
  },
  de: {
    // Header & Brand
    brandSubtitle: 'Offizieller F1 24, F1 25 & F1 26 Setup-Marktplatz',
    setupsTab: 'Setups',
    favoritesTab: 'Favoriten',
    adminReview: 'Admin-Prüfung',
    panelBadge: 'Konsole',
    submitSetup: 'Setup Einreichen',
    signIn: 'Anmelden',
    register: 'Registrieren',
    signOut: 'Abmelden',

    // Language selector label
    languageLabel: 'Sprache',
    turkish: 'Türkçe',
    english: 'English',
    italian: 'Italiano',
    german: 'Deutsch',
    spanish: 'Español',

    // Marketplace Titles & Filters
    marketplaceTitle: 'F1® Telemetrie & Renn-Setup-Datenbank',
    marketplaceSubtitle:
      'Verifizierte Esports-Telemetrie-Setups, Rundenzeit-Screenshots und Setup-Blätter für F1® 24, F1® 25 und F1® 26.',
    searchPlaceholder: 'Suche nach Strecke, Auto, Ersteller oder Notizen...',
    allTracks: 'Alle Strecken',
    allWeather: 'Alle Wetter',
    dryOnly: 'Trocken-Setups',
    wetOnly: 'Nass-Setups',
    intermediate: 'Intermediates',
    allTypes: 'Alle Typen',
    timeTrial: 'Zeitfahren',
    race: 'Rennen',
    qualifying: 'Qualifikation',

    // Weather & Track Conditions
    dryWeather: 'Trockenes Wetter',
    wetWeather: 'Nasses Wetter',
    trackConditionAll: 'STRECKENZUSTAND: Alle',
    trackConditionDry: 'STRECKENZUSTAND: Trocken',
    trackConditionWet: 'STRECKENZUSTAND: Nass',

    // Verification & Setup Types
    adminVerified: 'Admin Verifiziert',
    pending: 'Ausstehend',
    racePace: 'Rennpace',
    showing: 'Angezeigt',
    setupsCountText: 'Setups',
    filterAll: 'Alle',

    // Card Actions & Buttons
    copySetup: 'Setup Kopieren',
    copiedSetup: 'Kopiert',
    discuss: 'Diskutieren',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    viewDetails: 'Details Ansehen',

    // Ratings & Reviews
    noRatingsYet: 'Noch keine Bewertung',
    ratedStar: 'Bewertet',
    reviewsCountText: 'Bewertungen',
    rateButton: '+ Bewerten',

    // Hero Header
    activeGameLabel: 'AKTIVES SPIEL:',

    // Sort options
    sortBy: 'Sortieren nach',
    highestRated: 'Höchste Bewertung',
    mostRecent: 'Neueste',
    topSpeed: 'Höchstgeschwindigkeit',
    mostFavorited: 'Beliebteste',
    mostDownloaded: 'Meistgeladen',
    verifiedOnly: 'Nur Verifizierte',

    // Status Badges
    telemetryVerified: 'Telemetrie Verifiziert',
    verifiedProof: 'Nachweis Verifiziert',
    pendingVerification: 'Ausstehende Verifizierung',
    rejected: 'Abgelehnt',

    // Setup Card & Modal
    viewSetup: 'Setup Ansehen',
    setupCopied: 'Setup Kopiert!',
    downloadSetup: 'Setup Herunterladen',
    bestLapTime: 'Beste Rundenzeit',
    downforceLevel: 'Abtrieb (Downforce)',
    creator: 'Ersteller',
    addedDate: 'Hinzugefügt',
    downloads: 'Downloads',
    favorites: 'Favoriten',

    // Tuning Spec Categories
    aerodynamics: 'Aerodynamik',
    frontWing: 'Vorderflügel',
    rearWing: 'Heckflügel',

    transmission: 'Getriebe & Differenzial',
    diffOnThrottle: 'Differenzial bei Gas',
    diffOffThrottle: 'Differenzial ohne Gas',

    suspensionGeometry: 'Aufhängungsgeometrie',
    frontCamber: 'Sturz Vorne',
    rearCamber: 'Sturz Hinten',
    frontToe: 'Spur Vorne',
    rearToe: 'Spur Hinten',

    suspension: 'Aufhängung & Stabilisator',
    frontSuspension: 'Vorderradaufhängung',
    rearSuspension: 'Hinterradaufhängung',
    frontAntiRollBar: 'Stabilisator Vorne',
    rearAntiRollBar: 'Stabilisator Hinten',
    frontRideHeight: 'Bodenfreiheit Vorne',
    rearRideHeight: 'Bodenfreiheit Hinten',

    brakes: 'Bremsen',
    brakePressure: 'Bremsdruck',
    brakeBias: 'Bremskraftverteilung',

    tyres: 'Reifendruck',
    frontLeftTyre: 'Vorne Links',
    frontRightTyre: 'Vorne Rechts',
    rearLeftTyre: 'Hinten Links',
    rearRightTyre: 'Hinten Rechts',

    notesAndStrategy: 'Ersteller-Notizen & Strategie',
    reviewsAndDiscussions: 'Diskussionen & Bewertungen',
    writeReviewPlaceholder: 'Feedback teilen oder Fragen stellen...',
    submitReview: 'Bewertung Senden',
    noReviewsYet: 'Noch keine Bewertungen. Sei der Erste!',

    // Submit Modal
    submitModalTitle: 'F1 Setup-Blatt & Telemetrie Einreichen',
    submitModalSubtitle: 'Teile dein Esports-Setup mit Rundenzeit-Nachweis und Telemetrie-Screenshots.',
    setupTitleLabel: 'Setup-Titel',
    gameLabel: 'Spielversion',
    trackLabel: 'Strecke',
    carLabel: 'Fahrzeugmodell',
    lapTimeLabel: 'Beste Rundenzeit (z.B. 1:28.452)',
    conditionLabel: 'Wetterbedingungen',
    typeLabel: 'Session-Typ',
    notesLabel: 'Setup-Notizen / Fahr-Tipps',
    proofScreenshotLabel: 'Rundenzeit / Telemetrie-Screenshot Nachweis',
    submitButtonText: 'Setup zur Prüfung Einreichen',
    closeModal: 'Schließen',

    // Floating Banner Ads
    adBadgeText: 'WERBUNG',
    announcementBadge1: 'ANKÜNDIGUNG 1',
    announcementBadge2: 'ANKÜNDIGUNG 2',
    sponsorBadge: 'SPONSOR / WERBUNG',
    onlineText: 'online',

    // No Results
    noSetupsFound: 'Keine Setups mit diesen Filtern gefunden.',
    resetFilters: 'Alle Filter Zurücksetzen',
  },
  es: {
    // Header & Brand
    brandSubtitle: 'Mercado Oficial de Setups F1 24, F1 25 & F1 26',
    setupsTab: 'Setups',
    favoritesTab: 'Favoritos',
    adminReview: 'Revisión de Admin',
    panelBadge: 'Panel',
    submitSetup: 'Enviar Setup',
    signIn: 'Iniciar Sesión',
    register: 'Registrarse',
    signOut: 'Cerrar Sesión',

    // Language selector label
    languageLabel: 'Idioma',
    turkish: 'Türkçe',
    english: 'English',
    italian: 'Italiano',
    german: 'Deutsch',
    spanish: 'Español',

    // Marketplace Titles & Filters
    marketplaceTitle: 'Base de Datos de Telemetría y Setups de F1®',
    marketplaceSubtitle:
      'Setups de telemetría esports verificados, capturas de pantalla de tiempos de vuelta y hojas de setup para F1® 24, F1® 25 y F1® 26.',
    searchPlaceholder: 'Buscar por circuito, coche, creador o notas...',
    allTracks: 'Todos los Circuitos',
    allWeather: 'Todo Clima',
    dryOnly: 'Setups en Seco',
    wetOnly: 'Setups en Mojado',
    intermediate: 'Intermedio',
    allTypes: 'Todos los Tipos',
    timeTrial: 'Contrarreloj',
    race: 'Carrera',
    qualifying: 'Clasificación',

    // Weather & Track Conditions
    dryWeather: 'Clima Seco',
    wetWeather: 'Clima Lluvioso',
    trackConditionAll: 'ESTADO DE PISTA: Todos',
    trackConditionDry: 'ESTADO DE PISTA: Seco',
    trackConditionWet: 'ESTADO DE PISTA: Mojado',

    // Verification & Setup Types
    adminVerified: 'Verificado por Admin',
    pending: 'Pendiente',
    racePace: 'Ritmo de Carrera',
    showing: 'Mostrando',
    setupsCountText: 'setups',
    filterAll: 'Todos',

    // Card Actions & Buttons
    copySetup: 'Copiar Setup',
    copiedSetup: 'Copiado',
    discuss: 'Discusión',
    edit: 'Editar',
    delete: 'Eliminar',
    viewDetails: 'Ver Detalles',

    // Ratings & Reviews
    noRatingsYet: 'Sin valoraciones',
    ratedStar: 'Valoración',
    reviewsCountText: 'reseñas',
    rateButton: '+ Valorar',

    // Hero Header
    activeGameLabel: 'JUEGO ACTIVO:',

    // Sort options
    sortBy: 'Ordenar por',
    highestRated: 'Mejor Valorado',
    mostRecent: 'Más Recientes',
    topSpeed: 'Velocidad Máxima',
    mostFavorited: 'Más Favoritos',
    mostDownloaded: 'Más Descargados',
    verifiedOnly: 'Solo Verificados',

    // Status Badges
    telemetryVerified: 'Telemetría Verificada',
    verifiedProof: 'Prueba Verificada',
    pendingVerification: 'Verificación Pendiente',
    rejected: 'Rechazado',

    // Setup Card & Modal
    viewSetup: 'Ver Setup',
    setupCopied: '¡Setup Copiado!',
    downloadSetup: 'Descargar Setup',
    bestLapTime: 'Mejor Tiempo de Vuelta',
    downforceLevel: 'Carga Aerodinámica',
    creator: 'Creador',
    addedDate: 'Añadido',
    downloads: 'Descargas',
    favorites: 'Favoritos',

    // Tuning Spec Categories
    aerodynamics: 'Aerodinámica',
    frontWing: 'Alerón Delantero',
    rearWing: 'Alerón Trasero',

    transmission: 'Transmisión y Diferencial',
    diffOnThrottle: 'Diferencial con Acelerador',
    diffOffThrottle: 'Diferencial sin Acelerador',

    suspensionGeometry: 'Geometría de Suspensión',
    frontCamber: 'Cámber Delantero',
    rearCamber: 'Cámber Trasero',
    frontToe: 'Convergencia Delantera',
    rearToe: 'Convergencia Trasera',

    suspension: 'Suspensión y Barras Estabilizadoras',
    frontSuspension: 'Suspensión Delantera',
    rearSuspension: 'Suspensión Trasera',
    frontAntiRollBar: 'Barra Estabilizadora Delantera',
    rearAntiRollBar: 'Barra Estabilizadora Trasera',
    frontRideHeight: 'Altura de Chasis Delantera',
    rearRideHeight: 'Altura de Chasis Trasera',

    brakes: 'Frenos',
    brakePressure: 'Presión de Freno',
    brakeBias: 'Reparto de Frenada',

    tyres: 'Presión de Neumáticos',
    frontLeftTyre: 'Delantero Izquierdo',
    frontRightTyre: 'Delantero Derecho',
    rearLeftTyre: 'Trasero Izquierdo',
    rearRightTyre: 'Trasero Derecho',

    notesAndStrategy: 'Notas del Creador y Estrategia',
    reviewsAndDiscussions: 'Discusiones y Reseñas',
    writeReviewPlaceholder: 'Comparte tus comentarios o haz preguntas...',
    submitReview: 'Publicar Reseña',
    noReviewsYet: 'Aún no hay reseñas. ¡Sé el primero en opinar!',

    // Submit Modal
    submitModalTitle: 'Enviar Hoja de Setup F1 y Telemetría',
    submitModalSubtitle: 'Comparte tu setup de esports con prueba de tiempo de vuelta y capturas.',
    setupTitleLabel: 'Título del Setup',
    gameLabel: 'Versión del Juego',
    trackLabel: 'Circuito',
    carLabel: 'Modelo del Coche',
    lapTimeLabel: 'Mejor Tiempo de Vuelta (ej. 1:28.452)',
    conditionLabel: 'Condición Climática',
    typeLabel: 'Tipo de Sesión',
    notesLabel: 'Notas de Setup / Consejos de Conducción',
    proofScreenshotLabel: 'Captura de Pantalla de Prueba de Tiempo / Telemetría',
    submitButtonText: 'Enviar Setup para Verificación',
    closeModal: 'Cerrar',

    // Floating Banner Ads
    adBadgeText: 'PUBLICIDAD',
    announcementBadge1: 'ANUNCIO 1',
    announcementBadge2: 'ANUNCIO 2',
    sponsorBadge: 'PATROCINADOR / AD',
    onlineText: 'en línea',

    // No Results
    noSetupsFound: 'No se encontraron setups con los filtros activos.',
    resetFilters: 'Restablecer Filtros',
  },
};

export const countryTranslations: Record<string, Partial<Record<Language, string>>> = {
  Belgium: { tr: 'Belçika', it: 'Belgio', de: 'Belgien', es: 'Bélgica' },
  'Great Britain': { tr: 'Büyük Britanya', it: 'Gran Bretagna', de: 'Großbritannien', es: 'Gran Bretaña' },
  Italy: { tr: 'İtalya', it: 'Italia', de: 'Italien', es: 'Italia' },
  Spain: { tr: 'İspanya', it: 'Spagna', de: 'Spanien', es: 'España' },
  Netherlands: { tr: 'Hollanda', it: 'Paesi Bassi', de: 'Niederlande', es: 'Países Bajos' },
  Japan: { tr: 'Japonya', it: 'Giappone', de: 'Japan', es: 'Japón' },
  Bahrain: { tr: 'Bahreyn', it: 'Bahrein', de: 'Bahrain', es: 'Bahréin' },
  'Saudi Arabia': { tr: 'Suudi Arabistan', it: 'Arabia Saudita', de: 'Saudi-Arabien', es: 'Arabia Saudita' },
  Australia: { tr: 'Avustralya', it: 'Australia', de: 'Australien', es: 'Australia' },
  China: { tr: 'Çin', it: 'Cina', de: 'China', es: 'China' },
  Miami: { tr: 'Miami', it: 'Miami', de: 'Miami', es: 'Miami' },
  Monaco: { tr: 'Monako', it: 'Monaco', de: 'Monaco', es: 'Mónaco' },
  Canada: { tr: 'Kanada', it: 'Canada', de: 'Kanada', es: 'Canadá' },
  Austria: { tr: 'Avusturya', it: 'Austria', de: 'Österreich', es: 'Austria' },
  Hungary: { tr: 'Macaristan', it: 'Ungheria', de: 'Ungarn', es: 'Hungría' },
  Singapore: { tr: 'Singapur', it: 'Singapore', de: 'Singapur', es: 'Singapur' },
  'United States': { tr: 'Amerika Birleşik Devletleri', it: 'Stati Uniti', de: 'Vereinigte Staaten', es: 'Estados Unidos' },
  Mexico: { tr: 'Meksika', it: 'Messico', de: 'Mexiko', es: 'México' },
  Brazil: { tr: 'Brezilya', it: 'Brasile', de: 'Brasilien', es: 'Brasil' },
  'Las Vegas': { tr: 'Las Vegas', it: 'Las Vegas', de: 'Las Vegas', es: 'Las Vegas' },
  Qatar: { tr: 'Katar', it: 'Qatar', de: 'Katar', es: 'Catar' },
  'Abu Dhabi': { tr: 'Abu Dabi', it: 'Abu Dhabi', de: 'Abu Dhabi', es: 'Abu Dabi' },
  Azerbaijan: { tr: 'Azerbaycan', it: 'Azerbaigian', de: 'Aserbaidschan', es: 'Azerbaiyán' },
};

export function translateLocation(country: string, lang: Language): string {
  if (countryTranslations[country] && countryTranslations[country][lang]) {
    return countryTranslations[country][lang]!;
  }
  return country;
}

export type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('ddl_language') as Language;
      if (['en', 'tr', 'it', 'de', 'es'].includes(saved)) return saved;
    } catch {
      // ignore fallback
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('ddl_language', language);
    } catch {
      // ignore
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
