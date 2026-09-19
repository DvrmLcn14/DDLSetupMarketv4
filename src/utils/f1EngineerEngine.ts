import { TRACKS } from '../data/mockData';
import { Language } from '../i18n/LanguageContext';

export interface DriverSetupValues {
  // 1. Aerodynamics
  frontWing: number; // 0 - 50
  rearWing: number; // 0 - 50

  // 2. Transmission
  diffOnThrottle: number; // 10 - 100%
  diffOffThrottle: number; // 10 - 100%

  // 3. Suspension Geometry
  frontCamber: number; // -3.50° to -2.50°
  rearCamber: number; // -2.20° to -0.70°
  frontToe: number; // 0.00° to 0.50° (Front Toe-Out)
  rearToe: number; // 0.00° to 0.50° (Rear Toe-In)

  // 4. Suspension
  frontSuspension: number; // 1 - 41
  rearSuspension: number; // 1 - 41
  frontARB: number; // 1 - 21 (Front Anti-Roll Bar)
  rearARB: number; // 1 - 21 (Rear Anti-Roll Bar)
  frontRideHeight: number; // 10 - 45
  rearRideHeight: number; // 30 - 65

  // 5. Brakes
  brakePressure: number; // 80 - 100%
  brakeBias: number; // 50 - 70% (Front Brake Bias)

  // 6. Tyres (4 Individual Corners)
  flTyrePressure: number; // 20.0 - 29.5 PSI (Front Left)
  frTyrePressure: number; // 20.0 - 29.5 PSI (Front Right)
  rlTyrePressure: number; // 19.0 - 26.5 PSI (Rear Left)
  rrTyrePressure: number; // 19.0 - 26.5 PSI (Rear Right)
}

export const DEFAULT_SETUP_PRESETS: Record<string, { labelTr: string; labelEn: string; values: DriverSetupValues }> = {
  balanced: {
    labelTr: '⚖️ Dengeli / Standart Espor (36-32)',
    labelEn: '⚖️ Balanced / Standard Esports (36-32)',
    values: {
      frontWing: 36,
      rearWing: 32,
      diffOnThrottle: 58,
      diffOffThrottle: 52,
      frontCamber: -2.50,
      rearCamber: -1.00,
      frontToe: 0.00,
      rearToe: 0.10,
      frontSuspension: 30,
      rearSuspension: 22,
      frontARB: 8,
      rearARB: 5,
      frontRideHeight: 35,
      rearRideHeight: 40,
      brakePressure: 100,
      brakeBias: 55,
      flTyrePressure: 22.5,
      frTyrePressure: 22.5,
      rlTyrePressure: 20.5,
      rrTyrePressure: 20.5,
    },
  },
  high_downforce: {
    labelTr: '🏙️ Yüksek Kanat / Şehir Pisti (46-42)',
    labelEn: '🏙️ High Downforce / Street Circuit (46-42)',
    values: {
      frontWing: 46,
      rearWing: 42,
      diffOnThrottle: 54,
      diffOffThrottle: 50,
      frontCamber: -2.50,
      rearCamber: -1.20,
      frontToe: 0.02,
      rearToe: 0.12,
      frontSuspension: 24,
      rearSuspension: 18,
      frontARB: 6,
      rearARB: 3,
      frontRideHeight: 36,
      rearRideHeight: 41,
      brakePressure: 100,
      brakeBias: 55,
      flTyrePressure: 22.5,
      frTyrePressure: 22.5,
      rlTyrePressure: 20.5,
      rrTyrePressure: 20.5,
    },
  },
  low_drag: {
    labelTr: '🚀 Düşük Drag / Hız Tapınağı (24-19)',
    labelEn: '🚀 Low Drag / Speed Temple (24-19)',
    values: {
      frontWing: 24,
      rearWing: 19,
      diffOnThrottle: 60,
      diffOffThrottle: 54,
      frontCamber: -2.70,
      rearCamber: -0.90,
      frontToe: 0.00,
      rearToe: 0.08,
      frontSuspension: 34,
      rearSuspension: 26,
      frontARB: 9,
      rearARB: 6,
      frontRideHeight: 33,
      rearRideHeight: 38,
      brakePressure: 100,
      brakeBias: 54,
      flTyrePressure: 23.0,
      frTyrePressure: 23.0,
      rlTyrePressure: 21.0,
      rrTyrePressure: 21.0,
    },
  },
  wet_weather: {
    labelTr: '🌧️ Islak Zemin / Yağmur Şablonu (48-44)',
    labelEn: '🌧️ Wet Weather / Rain Spec (48-44)',
    values: {
      frontWing: 48,
      rearWing: 44,
      diffOnThrottle: 50,
      diffOffThrottle: 50,
      frontCamber: -2.50,
      rearCamber: -1.00,
      frontToe: 0.05,
      rearToe: 0.15,
      frontSuspension: 18,
      rearSuspension: 14,
      frontARB: 4,
      rearARB: 2,
      frontRideHeight: 40,
      rearRideHeight: 46,
      brakePressure: 95,
      brakeBias: 53,
      flTyrePressure: 21.5,
      frTyrePressure: 21.5,
      rlTyrePressure: 20.0,
      rrTyrePressure: 20.0,
    },
  },
};

export interface SetupAdjustment {
  category: 'Aero' | 'Transmission' | 'Geometry' | 'Suspension' | 'Brakes' | 'Tyres';
  parameter: string;
  currentValue: string | number;
  recommendedValue: string | number;
  changeDelta: string;
  adjustment: string;
  impact: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface DiagnosisResult {
  title: string;
  summary: string;
  problemAnalysis: string;
  adjustments: SetupAdjustment[];
  telemetryTip: string;
  quickActionSummary: string;
}

export interface HandlingIssue {
  id: string;
  label: string;
  category: 'oversteer' | 'understeer' | 'speed' | 'braking' | 'tyres' | 'kerbs' | 'wet';
  icon: string;
  description: string;
}

export function getCommonHandlingIssues(lang: Language = 'tr'): HandlingIssue[] {
  const isTr = lang === 'tr';
  return [
    {
      id: 'lack_of_top_speed',
      label: isTr ? 'Düzlük Hızım Yetersiz / Aşırı Drag' : 'Low Top Speed / Excessive Drag',
      category: 'speed',
      icon: '🚀',
      description: isTr
        ? 'Düzlüklerde ve DRS bölgelerinde rakiplere göre son hızım düşük kalıyor.'
        : 'Struggling with top speed and straight-line acceleration on DRS straights.',
    },
    {
      id: 'exit_oversteer',
      label: isTr ? 'Viraj Çıkışında Arkadan Kayma / Arkası Kopuyor (Snap Oversteer)' : 'Rear Instability on Exit / Rear Snapping Out',
      category: 'oversteer',
      icon: '🏎️',
      description: isTr
        ? 'Apexten çıkarken gaza basıldığında arka tekerleklerin aniden tutuşu bırakması.'
        : 'The rear snaps or steps out when applying throttle upon corner exit.',
    },
    {
      id: 'low_speed_understeer',
      label: isTr ? 'Yavaş Virajlarda & Şikanlarda Kafadan Kayma (Understeer)' : 'Understeer in Slow Corners & Chicanes (Front Wash)',
      category: 'understeer',
      icon: '🛑',
      description: isTr
        ? 'Direksiyon çevrilmesine rağmen aracın burnu viraja girmiyor, dışa açılıyor.'
        : 'The front tires fail to grip at low speeds, washing out and missing apexes.',
    },
    {
      id: 'high_speed_understeer',
      label: isTr ? 'Hızlı Virajlarda Apexe Oturmama (Aero Understeer)' : 'High-Speed Corner Washout (Aero Understeer)',
      category: 'understeer',
      icon: '🌀',
      description: isTr
        ? 'Yüksek hızlı akıcı virajlarda aracın dışa doğru sürüklenmesi.'
        : 'Car lacks front downforce in high-speed sweeping corners like Copse or Pouhon.',
    },
    {
      id: 'entry_oversteer',
      label: isTr ? 'Viraj Girişinde & Fren Anında Arka Savrulması' : 'Entry Instability & Trail-Braking Oversteer',
      category: 'oversteer',
      icon: '⚡',
      description: isTr
        ? 'Frenleme sırasında ve direksiyon ilk çevrildiğinde arka aksın dengesizleşmesi.'
        : 'Rear axle becomes loose when turning in under deceleration or trail braking.',
    },
    {
      id: 'braking_instability',
      label: isTr ? 'Frenlemede Ön/Arka Kilitlenme (Lock-Up) & Dengesizlik' : 'Brake Lock-Up & Braking Zone Instability',
      category: 'braking',
      icon: '🎯',
      description: isTr
        ? 'Sert frenleme anında ön tekerlekler kilitleniyor veya arka kayıyor.'
        : 'Front wheels lock up easily or the car pulls laterally under heavy braking.',
    },
    {
      id: 'kerb_instability',
      label: isTr ? 'Kerblerde / Bordürlerde Sekme ve Taban Vurma' : 'Instability Over Kerbs & Bottoming Out',
      category: 'kerbs',
      icon: '🚧',
      description: isTr
        ? 'Bordürlerin üstünden geçerken araç zıplıyor ve taban yere vuruyor.'
        : 'Violent bouncing, jarring vibrations, or loss of control when clipping kerbs.',
    },
    {
      id: 'qualifying_one_shot',
      label: isTr ? 'Tek Tur / Sıralama Turu (Qualifying & Time Trial) Fizik Metası' : 'Qualifying / Time Trial Peak Performance Meta',
      category: 'tyres',
      icon: '⏱️',
      description: isTr
        ? 'Sıralamada 1. turdan itibaren maksimum karkas sertliği, anında reaksiyon ve çıkış turunda hızlı ısınma.'
        : 'Maximize tire carcass rigidity, instantaneous turn-in response, and fast out-lap core temp build for Q1/Q3.',
    },
    {
      id: 'rear_tyre_overheating',
      label: isTr ? 'Arka Lastiklerin Aşırı Isınması & Hızlı Aşınma' : 'Rear Tyre Overheating & Thermal Degradation',
      category: 'tyres',
      icon: '🔥',
      description: isTr
        ? 'Yarış içinde arka lastik sıcaklıkları kırmızıya (105°C+) çıkıyor.'
        : 'Rear surface temps spiking past 105°C, causing early traction loss.',
    },
    {
      id: 'wet_weather_struggle',
      label: isTr ? 'Yağmurlu Zeminde Tutuşsuzluk & Kızaklama' : 'Wet Weather Lack of Traction & Aquaplaning',
      category: 'wet',
      icon: '🌧️',
      description: isTr
        ? 'Islak pistte su birikintilerinde kızaklama ve virajlarda genel tutunma kaybı.'
        : 'Car slides uncontrollably or aquaplanes on standing water puddles.',
    },
  ];
}

export function parseSetupFromText(input: string, base: DriverSetupValues): DriverSetupValues {
  const result = { ...base };
  const str = input.toLowerCase();

  // Helper to extract first number after any matched pattern
  const extractNum = (regexes: RegExp[]): number | null => {
    for (const rx of regexes) {
      const m = str.match(rx);
      if (m && m[1] !== undefined) {
        const val = parseFloat(m[1]);
        if (!isNaN(val)) return val;
      }
    }
    return null;
  };

  // 1. Aerodynamics: Front Wing, Rear Wing
  const fw = extractNum([
    /(?:front\s*wing|ön\s*kanat|f_wing|fw)\s*[:=]?\s*(\d+)/i,
  ]);
  if (fw !== null) result.frontWing = Math.min(50, Math.max(0, Math.round(fw)));

  const rw = extractNum([
    /(?:rear\s*wing|arka\s*kanat|r_wing|rw)\s*[:=]?\s*(\d+)/i,
  ]);
  if (rw !== null) result.rearWing = Math.min(50, Math.max(0, Math.round(rw)));

  const wingComboMatch =
    str.match(/(?:wings?|kanatlar?|aero)\s*[:=]?\s*(\d+)\s*[-/,\s]+\s*(\d+)/i) ||
    str.match(/(\d+)\s*[-/]\s*(\d+)\s*(?:wings?|kanat)/i);
  if (wingComboMatch && fw === null && rw === null) {
    result.frontWing = Math.min(50, Math.max(0, parseInt(wingComboMatch[1], 10)));
    result.rearWing = Math.min(50, Math.max(0, parseInt(wingComboMatch[2], 10)));
  }

  // 2. Transmission: Diff On-Throttle, Diff Off-Throttle (No Engine Braking in F1 25/26)
  const diffOn = extractNum([
    /(?:differential\s*(?:adjustment)?\s*on\s*throttle|diff\s*on\s*throttle|on\s*throttle\s*diff|on-throttle|diff\s*on|gaza\s*basarken\s*diferansiyel|gaza\s*basarken)\s*[:=]?\s*(\d+)/i,
  ]);
  if (diffOn !== null) result.diffOnThrottle = Math.min(100, Math.max(10, Math.round(diffOn)));

  const diffOff = extractNum([
    /(?:differential\s*(?:adjustment)?\s*off\s*throttle|diff\s*off\s*throttle|off\s*throttle\s*diff|off-throttle|diff\s*off|gaz\s*keserken\s*diferansiyel|gaz\s*keserken|gaz\s*kesme)\s*[:=]?\s*(\d+)/i,
  ]);
  if (diffOff !== null) result.diffOffThrottle = Math.min(100, Math.max(10, Math.round(diffOff)));

  const diffCombo = str.match(/(?:diff|diferansiyel)\s*[:=]?\s*(\d+)%?\s*[-/,\s]+\s*(\d+)%?/i);
  if (diffCombo && diffOn === null && diffOff === null) {
    result.diffOnThrottle = Math.min(100, Math.max(10, parseInt(diffCombo[1], 10)));
    result.diffOffThrottle = Math.min(100, Math.max(10, parseInt(diffCombo[2], 10)));
  }

  // 3. Suspension Geometry: Front Camber, Rear Camber, Front Toe-Out, Rear Toe-In
  const fc = extractNum([
    /(?:front\s*camber|ön\s*kamber|f_camber)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
  ]);
  if (fc !== null) {
    const normFC = fc > 0 ? -fc : fc;
    result.frontCamber = Math.min(-2.50, Math.max(-3.50, parseFloat(normFC.toFixed(2))));
  }

  const rc = extractNum([
    /(?:rear\s*camber|arka\s*kamber|r_camber)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
  ]);
  if (rc !== null) {
    const normRC = rc > 0 ? -rc : rc;
    result.rearCamber = Math.min(-0.70, Math.max(-2.20, parseFloat(normRC.toFixed(2))));
  }

  const camberCombo = str.match(/(?:camber|kamber)\s*[:=]?\s*(-?\d+\.?\d*)\s*[-/,\s]+\s*(-?\d+\.?\d*)/i);
  if (camberCombo && fc === null && rc === null) {
    const c1 = parseFloat(camberCombo[1]);
    const c2 = parseFloat(camberCombo[2]);
    result.frontCamber = Math.min(-2.50, Math.max(-3.50, c1 > 0 ? -c1 : c1));
    result.rearCamber = Math.min(-0.70, Math.max(-2.20, c2 > 0 ? -c2 : c2));
  }

  const fToe = extractNum([
    /(?:front\s*toe(?:-out)?|front\s*toe\s*out|ön\s*toe(?:-out)?|f_toe)\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (fToe !== null) result.frontToe = Math.min(0.50, Math.max(0.00, parseFloat(fToe.toFixed(2))));

  const rToe = extractNum([
    /(?:rear\s*toe(?:-in)?|rear\s*toe\s*in|arka\s*toe(?:-in)?|r_toe)\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (rToe !== null) result.rearToe = Math.min(0.50, Math.max(0.00, parseFloat(rToe.toFixed(2))));

  const toeCombo = str.match(/(?:toe)\s*[:=]?\s*(\d+\.?\d*)\s*[-/,\s]+\s*(\d+\.?\d*)/i);
  if (toeCombo && fToe === null && rToe === null) {
    result.frontToe = Math.min(0.50, Math.max(0.00, parseFloat(toeCombo[1])));
    result.rearToe = Math.min(0.50, Math.max(0.00, parseFloat(toeCombo[2])));
  }

  // 4. Suspension: Front Suspension, Rear Suspension, Front ARB, Rear ARB, Front Ride Height, Rear Ride Height
  const fSusp = extractNum([
    /(?:front\s*suspension|front\s*susp|ön\s*süspansiyon|front\s*springs?|ön\s*yay(?:lar)?)\s*[:=]?\s*(\d+)/i,
  ]);
  if (fSusp !== null) result.frontSuspension = Math.min(41, Math.max(1, Math.round(fSusp)));

  const rSusp = extractNum([
    /(?:rear\s*suspension|rear\s*susp|arka\s*süspansiyon|rear\s*springs?|arka\s*yay(?:lar)?)\s*[:=]?\s*(\d+)/i,
  ]);
  if (rSusp !== null) result.rearSuspension = Math.min(41, Math.max(1, Math.round(rSusp)));

  const suspCombo = str.match(/(?:suspension|süspansiyon|springs?|yaylar?)\s*[:=]?\s*(\d+)\s*[-/,\s]+\s*(\d+)/i);
  if (suspCombo && fSusp === null && rSusp === null) {
    result.frontSuspension = Math.min(41, Math.max(1, parseInt(suspCombo[1], 10)));
    result.rearSuspension = Math.min(41, Math.max(1, parseInt(suspCombo[2], 10)));
  }

  const fARB = extractNum([
    /(?:front\s*(?:anti-roll\s*bar|anti\s*roll\s*bar|arb)|ön\s*(?:viraj\s*demiri|arb))\s*[:=]?\s*(\d+)/i,
  ]);
  if (fARB !== null) result.frontARB = Math.min(21, Math.max(1, Math.round(fARB)));

  const rARB = extractNum([
    /(?:rear\s*(?:anti-roll\s*bar|anti\s*roll\s*bar|arb)|arka\s*(?:viraj\s*demiri|arb))\s*[:=]?\s*(\d+)/i,
  ]);
  if (rARB !== null) result.rearARB = Math.min(21, Math.max(1, Math.round(rARB)));

  const arbCombo = str.match(/(?:anti-roll\s*bar|anti\s*roll\s*bar|arb|viraj\s*demiri)\s*[:=]?\s*(\d+)\s*[-/,\s]+\s*(\d+)/i);
  if (arbCombo && fARB === null && rARB === null) {
    result.frontARB = Math.min(21, Math.max(1, parseInt(arbCombo[1], 10)));
    result.rearARB = Math.min(21, Math.max(1, parseInt(arbCombo[2], 10)));
  }

  const fRide = extractNum([
    /(?:front\s*ride\s*height|front\s*ride|ön\s*sürüş\s*yüksekliği|ön\s*taban)\s*[:=]?\s*(\d+)/i,
  ]);
  if (fRide !== null) result.frontRideHeight = Math.min(45, Math.max(10, Math.round(fRide)));

  const rRide = extractNum([
    /(?:rear\s*ride\s*height|rear\s*ride|arka\s*sürüş\s*yüksekliği|arka\s*taban)\s*[:=]?\s*(\d+)/i,
  ]);
  if (rRide !== null) result.rearRideHeight = Math.min(65, Math.max(30, Math.round(rRide)));

  const rideCombo = str.match(/(?:ride\s*height|sürüş\s*yüksekliği|taban\s*yüksekliği|taban)\s*[:=]?\s*(\d+)\s*[-/,\s]+\s*(\d+)/i);
  if (rideCombo && fRide === null && rRide === null) {
    result.frontRideHeight = Math.min(45, Math.max(10, parseInt(rideCombo[1], 10)));
    result.rearRideHeight = Math.min(65, Math.max(30, parseInt(rideCombo[2], 10)));
  }

  // 5. Brakes: Brake Pressure, Front Brake Bias
  const bPress = extractNum([
    /(?:brake\s*pressure|fren\s*basıncı|fren\s*basınç)\s*[:=]?\s*(\d+)/i,
  ]);
  if (bPress !== null) result.brakePressure = Math.min(100, Math.max(80, Math.round(bPress)));

  const bBias = extractNum([
    /(?:front\s*brake\s*bias|brake\s*bias|fren\s*dengesi|ön\s*fren\s*bias|ön\s*fren\s*dengesi|bias)\s*[:=]?\s*(\d+)/i,
  ]);
  if (bBias !== null) result.brakeBias = Math.min(70, Math.max(50, Math.round(bBias)));

  // 6. Tyres: 4 Individual Corner Pressures (FL, FR, RL, RR)
  // Individual corners
  const fl = extractNum([
    /(?:front\s*left|ön\s*sol|fl)\s*(?:tyres?|tires?|lastik|psi|pressure)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (fl !== null) result.flTyrePressure = Math.min(29.5, Math.max(20.0, parseFloat(fl.toFixed(1))));

  const fr = extractNum([
    /(?:front\s*right|ön\s*sağ|fr)\s*(?:tyres?|tires?|lastik|psi|pressure)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (fr !== null) result.frTyrePressure = Math.min(29.5, Math.max(20.0, parseFloat(fr.toFixed(1))));

  const rl = extractNum([
    /(?:rear\s*left|arka\s*sol|rl)\s*(?:tyres?|tires?|lastik|psi|pressure)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (rl !== null) result.rlTyrePressure = Math.min(26.5, Math.max(19.0, parseFloat(rl.toFixed(1))));

  const rr = extractNum([
    /(?:rear\s*right|arka\s*sağ|rr)\s*(?:tyres?|tires?|lastik|psi|pressure)?\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (rr !== null) result.rrTyrePressure = Math.min(26.5, Math.max(19.0, parseFloat(rr.toFixed(1))));

  // 4-tyre combo: e.g. "tyres: 22.5 22.5 20.5 20.5" or "psi 22.5, 22.5, 20.5, 20.5"
  const fourTyreCombo = str.match(/(?:tyres?|tires?|lastik(?:ler)?|psi|pressures?)\s*[:=]?\s*(\d+\.?\d*)\s*[-/,\s]+\s*(\d+\.?\d*)\s*[-/,\s]+\s*(\d+\.?\d*)\s*[-/,\s]+\s*(\d+\.?\d*)/i);
  if (fourTyreCombo && fl === null && fr === null && rl === null && rr === null) {
    result.flTyrePressure = Math.min(29.5, Math.max(20.0, parseFloat(fourTyreCombo[1])));
    result.frTyrePressure = Math.min(29.5, Math.max(20.0, parseFloat(fourTyreCombo[2])));
    result.rlTyrePressure = Math.min(26.5, Math.max(19.0, parseFloat(fourTyreCombo[3])));
    result.rrTyrePressure = Math.min(26.5, Math.max(19.0, parseFloat(fourTyreCombo[4])));
  }

  // Front pair / Rear pair fallback
  const fPair = extractNum([
    /(?:front\s*(?:tyres?|tires?)\s*(?:pressure)?|front\s*psi|ön\s*lastik(?:ler)?\s*(?:basıncı)?|ön\s*psi)\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (fPair !== null && fl === null && fr === null) {
    const val = Math.min(29.5, Math.max(20.0, parseFloat(fPair.toFixed(1))));
    result.flTyrePressure = val;
    result.frTyrePressure = val;
  }

  const rPair = extractNum([
    /(?:rear\s*(?:tyres?|tires?)\s*(?:pressure)?|rear\s*psi|arka\s*lastik(?:ler)?\s*(?:basıncı)?|arka\s*psi)\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ]);
  if (rPair !== null && rl === null && rr === null) {
    const val = Math.min(26.5, Math.max(19.0, parseFloat(rPair.toFixed(1))));
    result.rlTyrePressure = val;
    result.rrTyrePressure = val;
  }

  // 2-value combo (Front / Rear pair)
  const twoTyreCombo = str.match(/(?:tyres?|tires?|lastik(?:ler)?|psi|pressures?)\s*[:=]?\s*(\d+\.?\d*)\s*[-/,\s]+\s*(\d+\.?\d*)/i);
  if (twoTyreCombo && !fourTyreCombo && fl === null && fr === null && rl === null && rr === null && fPair === null && rPair === null) {
    const fVal = Math.min(29.5, Math.max(20.0, parseFloat(twoTyreCombo[1])));
    const rVal = Math.min(26.5, Math.max(19.0, parseFloat(twoTyreCombo[2])));
    result.flTyrePressure = fVal;
    result.frTyrePressure = fVal;
    result.rlTyrePressure = rVal;
    result.rrTyrePressure = rVal;
  }

  return result;
}

export function diagnoseHandlingIssueWithSetup(
  issueIdOrQuery: string,
  setup: DriverSetupValues,
  trackId?: string,
  lang: Language = 'tr'
): DiagnosisResult {
  const isTr = lang === 'tr';
  const track = trackId
    ? TRACKS[trackId] || Object.values(TRACKS).find((t) => t.id === trackId || t.name.toLowerCase().includes(trackId.toLowerCase()))
    : undefined;
  const trackName = track ? track.name : trackId || (isTr ? 'Aktif Pist' : 'Current Circuit');
  const query = issueIdOrQuery.toLowerCase();

  // 0. Tek Tur / Sıralama Turu (Qualifying / Time Trial) High-Pressure Meta
  if (
    query.includes('qualifying') ||
    query.includes('time_trial') ||
    query.includes('one_shot') ||
    query.includes('sıralama') ||
    query.includes('tek tur') ||
    query.includes('hot lap') ||
    query.includes('pole position')
  ) {
    const targetFLPSI = +(Math.min(29.5, Math.max(28.0, setup.flTyrePressure < 27.5 ? 28.5 : setup.flTyrePressure))).toFixed(1);
    const targetFRPSI = +(Math.min(29.5, Math.max(28.0, setup.frTyrePressure < 27.5 ? 28.5 : setup.frTyrePressure))).toFixed(1);
    const targetRLPSI = +(Math.min(26.5, Math.max(25.0, setup.rlTyrePressure < 24.5 ? 25.5 : setup.rlTyrePressure))).toFixed(1);
    const targetRRPSI = +(Math.min(26.5, Math.max(25.0, setup.rrTyrePressure < 24.5 ? 25.5 : setup.rrTyrePressure))).toFixed(1);
    const targetDiffOn = Math.min(55, Math.max(50, setup.diffOnThrottle));
    const targetRearARB = Math.min(3, Math.max(1, setup.rearARB));
    const targetBrakePress = 100;
    const targetBrakeBias = 54;

    return isTr
      ? {
          title: `⏱️ ${trackName} — Tek Tur / Sıralama (Qualifying & Time Trial) Fizik & Meta Analizi`,
          summary: `Sıralama turlarında (1-Shot / Q1-Q3) maksimum tur zamanı elde etmek için yüksek karkas rijitliği, anında direksiyon tepkisi ve tek çıkış turunda (Out-Lap) hızlı termal ısınma gereklidir.`,
          problemAnalysis: `Yarış temposunun aksine sıralama turunda düşük lastik basıncı kullanmak YANLIŞTIR. Düşük basınçlar lastik yanaklarında esnemeye (deflection) ve viraj girişinde gecikmeli direksiyon hissine yol açar. Basınçlar yüksek tutularak karkas sertleştirilir, ilk virajdan itibaren %100 yol tutuş elde edilir.`,
          adjustments: [
            {
              category: 'Tyres',
              parameter: 'Ön Lastik Basınçları (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `Yüksek Basınç Metası`,
              adjustment: `Ön lastik basınçlarını FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI seviyesine yükselt`,
              impact: 'Lastik yanak esnemesini yok ederek apexe anında jilet gibi keskin yönlenme verir.',
              urgency: 'high',
            },
            {
              category: 'Tyres',
              parameter: 'Arka Lastik Basınçları (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `Yüksek Basınç Metası`,
              adjustment: `Arka lastik basınçlarını RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI seviyesine getir`,
              impact: 'Çıkış turunda (Out-Lap) çekiş karkasını hızla optimum 95°C-102°C çalışma penceresine sokar.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Gaza Basarken Diferansiyel (% On-Throttle)',
              currentValue: `%${setup.diffOnThrottle}`,
              recommendedValue: `%${targetDiffOn}`,
              changeDelta: `%${targetDiffOn - setup.diffOnThrottle}`,
              adjustment: `On-Throttle diff'i %${targetDiffOn} seviyesine çek`,
              impact: 'Tek turda soğuk/taze lastiklerde viraj çıkışı ani spin (snap-oversteer) riskini sıfırlar.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Arka Viraj Demiri (Rear ARB)',
              currentValue: setup.rearARB,
              recommendedValue: targetRearARB,
              changeDelta: `${targetRearARB - setup.rearARB}`,
              adjustment: `Arka ARB'yi ${targetRearARB} seviyesine yumuşat (Metada 1-2 tık)`,
              impact: 'Bordürlerden geçerken ve viraj çıkışlarında arka aksın asfalta yapışmasını sağlar.',
              urgency: 'high',
            },
            {
              category: 'Brakes',
              parameter: 'Fren Basıncı & Fren Dengesi',
              currentValue: `%${setup.brakePressure} / %${setup.brakeBias}`,
              recommendedValue: `%${targetBrakePress} / %${targetBrakeBias}`,
              changeDelta: `Ayarla`,
              adjustment: `Fren basıncını %100, fren dengesini %54-55 olarak sabitle`,
              impact: 'Maksimum durdurma gücü sağlarken ön kilitlenmeleri ve arka savrulmaları önler.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'Çıkış turunun (out-lap) son sektöründe lastikleri aşırı kaydırmadan fren ve ivmelenmelerle iç çekirdek ısısını yakalayın.',
          quickActionSummary: `Ön lastikleri ${targetFLPSI} PSI, arka lastikleri ${targetRLPSI} PSI'a yükseltin; Arka ARB'yi ${targetRearARB}'e yumuşatıp On-Throttle Diff'i %${targetDiffOn} yapın.`,
        }
      : {
          title: `⏱️ ${trackName} — Qualifying & Time Trial Peak Performance Meta Setup`,
          summary: `For maximum 1-lap qualifying pace (Q1-Q3 / Time Trial), priority shifts to high carcass stiffness, instant turn-in articulation, and rapid out-lap core thermal buildup.`,
          problemAnalysis: `Contrary to race stint logic, lowering tyre pressures for qualifying is an amateur mistake. Lower pressure causes sidewall deflection and sluggish turn-in. Higher pressures stiffen the tire carcass, yielding razor-sharp apex bite from Turn 1.`,
          adjustments: [
            {
              category: 'Tyres',
              parameter: 'Front Tyre Pressures (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `High-Pressure Meta`,
              adjustment: `Raise front tyre pressures to FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              impact: 'Eliminates tire carcass squish for instantaneous turn-in response.',
              urgency: 'high',
            },
            {
              category: 'Tyres',
              parameter: 'Rear Tyre Pressures (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `High-Pressure Meta`,
              adjustment: `Set rear tyre pressures to RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              impact: 'Builds internal carcass core temperature quickly on the out-lap for Turn 1 traction.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Differential On-Throttle',
              currentValue: `${setup.diffOnThrottle}%`,
              recommendedValue: `${targetDiffOn}%`,
              changeDelta: `${targetDiffOn - setup.diffOnThrottle}%`,
              adjustment: `Set on-throttle differential to ${targetDiffOn}%`,
              impact: 'Prevents power-on snap spins when aggressively unleashing full ERS deployment.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Rear Anti-Roll Bar (Rear ARB)',
              currentValue: setup.rearARB,
              recommendedValue: targetRearARB,
              changeDelta: `${targetRearARB - setup.rearARB}`,
              adjustment: `Soften rear ARB down to ${targetRearARB} (1-2 click community meta)`,
              impact: 'Unlocks maximum exit traction over kerbs without lifting inside rear wheel.',
              urgency: 'high',
            },
            {
              category: 'Brakes',
              parameter: 'Brake Pressure & Bias',
              currentValue: `${setup.brakePressure}% / ${setup.brakeBias}%`,
              recommendedValue: `${targetBrakePress}% / ${targetBrakeBias}%`,
              changeDelta: `Calibrate`,
              adjustment: `Lock brake pressure to 100% and brake bias to 54-55%`,
              impact: 'Provides maximum deceleration without lock-ups under heavy threshold braking.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'In Sector 3 of your out-lap, warm carcass internal core with firm brake applications rather than harsh lateral scrubbing.',
          quickActionSummary: `Raise front tyres to ${targetFLPSI} PSI, rear tyres to ${targetRLPSI} PSI; soften rear ARB to ${targetRearARB} and diff on-throttle to ${targetDiffOn}%.`,
        };
  }

  // 1. Düzlük Hızı Yetersiz / Lack of top speed / Low Top Speed
  if (
    query.includes('lack_of_top_speed') ||
    query.includes('düzlük') ||
    query.includes('son hız') ||
    query.includes('top speed') ||
    query.includes('drag') ||
    query.includes('hızım az') ||
    query.includes('yavaş kalıyor')
  ) {
    const targetRearWing = Math.max(10, setup.rearWing - 4);
    const targetFrontWing = Math.max(15, setup.frontWing - 3);
    const targetDiffOff = Math.max(50, setup.diffOffThrottle - 3);
    const targetFrontRide = Math.max(10, setup.frontRideHeight - 2);
    const targetRearRide = Math.max(30, setup.rearRideHeight - 2);
    const targetFrontCamber = -2.50;
    const targetRLPSI = +(setup.rlTyrePressure + 0.6).toFixed(1);
    const targetRRPSI = +(setup.rrTyrePressure + 0.6).toFixed(1);

    return isTr
      ? {
          title: `🚀 ${trackName} — Düzlük Hızı & Drag Düşürme Analizi`,
          summary: `Mevcut kanat açılarınız (${setup.frontWing}/${setup.rearWing}), sürüş yüksekliğiniz (${setup.frontRideHeight}/${setup.rearRideHeight}) ve arka lastik basınçlarınız (RL ${setup.rlTyrePressure} / RR ${setup.rrTyrePressure} PSI) düzlüklerde aşırı aerodinamik ve yuvarlanma direnci (drag) yaratıyor.`,
          problemAnalysis: `Arka kanadın ${setup.rearWing} seviyesinde bulunması DRS açıldığında dahi terminal hızı sınırlar. Arka lastik basınçlarının düşük kalması ise yuvarlanma sürtünmesini artırır. Kanatlar, taban yüksekliği ve 4 tekerlek lastik basınçları kalibre edilerek düzlükte +7 ile +11 km/h kazanılır.`,
          adjustments: [
            {
              category: 'Aero',
              parameter: 'Arka Kanat (Rear Wing)',
              currentValue: setup.rearWing,
              recommendedValue: targetRearWing,
              changeDelta: `-${setup.rearWing - targetRearWing} kademe`,
              adjustment: `Arka kanadı ${setup.rearWing}'dan ${targetRearWing}'e düşür (-${setup.rearWing - targetRearWing} tık)`,
              impact: 'Düzlükte hava sürtünmesini keserek maksimum son hızı ve DRS verimini artırır.',
              urgency: 'high',
            },
            {
              category: 'Aero',
              parameter: 'Ön Kanat (Front Wing)',
              currentValue: setup.frontWing,
              recommendedValue: targetFrontWing,
              changeDelta: `-${setup.frontWing - targetFrontWing} kademe`,
              adjustment: `Ön kanadı ${setup.frontWing}'den ${targetFrontWing}'e düşür (-${setup.frontWing - targetFrontWing} tık)`,
              impact: 'Arka kanattaki düşüşü dengeleyerek yüksek hızda şasiyi aerodinamik nötr dengede tutar.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Gaz Kesildiğinde Diferansiyel (% Off-Throttle)',
              currentValue: `%${setup.diffOffThrottle}`,
              recommendedValue: `%${targetDiffOff}`,
              changeDelta: `-%${setup.diffOffThrottle - targetDiffOff}`,
              adjustment: `Off-throttle diferansiyeli %${setup.diffOffThrottle}'den %${targetDiffOff}'ye düşür`,
              impact: 'Viraj çıkışında düzlüğe taşınan momentuma serbestlik ve akıcılık kazandırır.',
              urgency: 'medium',
            },
            {
              category: 'Suspension',
              parameter: 'Sürüş Yüksekliği (Ride Height Ön / Arka)',
              currentValue: `${setup.frontRideHeight} / ${setup.rearRideHeight}`,
              recommendedValue: `${targetFrontRide} / ${targetRearRide}`,
              changeDelta: `-2 / -2 tık`,
              adjustment: `Ön tabanı ${setup.frontRideHeight}'den ${targetFrontRide}'e, Arka tabanı ${setup.rearRideHeight}'den ${targetRearRide}'e alçalt`,
              impact: 'Ön kesit alanını küçültür ve Venturi zemin emiş tünellerini hızlandırır.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Ön Kamber (Front Camber)',
              currentValue: `${setup.frontCamber}°`,
              recommendedValue: `${targetFrontCamber}°`,
              changeDelta: `${(targetFrontCamber - setup.frontCamber).toFixed(2)}°`,
              adjustment: `Ön kamberi ${targetFrontCamber}° seviyesine yaklaştır`,
              impact: 'Düzlükte lastik tabanının asfalta temas direncini düşürerek hızlanmayı serbest bırakır.',
              urgency: 'low',
            },
            {
              category: 'Tyres',
              parameter: 'Arka Lastik Basınçları (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `+0.6 PSI`,
              adjustment: `Arka sol ve sağ lastik basınçlarını +0.6 PSI yükselterek RL ${targetRLPSI} / RR ${targetRRPSI} PSI yap`,
              impact: 'Yuvarlanma direncini düşürerek düzlük ivmesini keskinleştirir.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Düzlüğe bağlanan son virajda apexi erken yakalayıp düz hatta %100 tam gaza erken oturun.',
          quickActionSummary: `Arka kanadı ${setup.rearWing} -> ${targetRearWing}, ön kanadı ${setup.frontWing} -> ${targetFrontWing} yapın, tabanı 2 tık alçaltın ve arka lastikleri +0.6 PSI artırın.`,
        }
      : {
          title: `🚀 ${trackName} — Top Speed Optimization & Drag Reduction`,
          summary: `Your wing levels (${setup.frontWing}/${setup.rearWing}), ride heights (${setup.frontRideHeight}/${setup.rearRideHeight}) and rear tyre pressures (RL ${setup.rlTyrePressure} / RR ${setup.rrTyrePressure} PSI) are creating excessive aerodynamic and mechanical rolling drag.`,
          problemAnalysis: `A rear wing of ${setup.rearWing} caps straight-line terminal velocity even with DRS enabled. Lowering wings, floor height and increasing rear tyre pressure to decrease rolling resistance unlocks +7 to +11 km/h on straights.`,
          adjustments: [
            {
              category: 'Aero',
              parameter: 'Rear Wing Level',
              currentValue: setup.rearWing,
              recommendedValue: targetRearWing,
              changeDelta: `-${setup.rearWing - targetRearWing} clicks`,
              adjustment: `Reduce rear wing from ${setup.rearWing} down to ${targetRearWing} (-${setup.rearWing - targetRearWing} clicks)`,
              impact: 'Slashes aerodynamic wake resistance for top terminal velocity.',
              urgency: 'high',
            },
            {
              category: 'Aero',
              parameter: 'Front Wing Level',
              currentValue: setup.frontWing,
              recommendedValue: targetFrontWing,
              changeDelta: `-${setup.frontWing - targetFrontWing} clicks`,
              adjustment: `Reduce front wing from ${setup.frontWing} down to ${targetFrontWing} (-${setup.frontWing - targetFrontWing} clicks)`,
              impact: 'Maintains aerodynamic center of pressure balance with trimmed rear wing.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Differential Off-Throttle',
              currentValue: `${setup.diffOffThrottle}%`,
              recommendedValue: `${targetDiffOff}%`,
              changeDelta: `-${setup.diffOffThrottle - targetDiffOff}%`,
              adjustment: `Reduce off-throttle diff to ${targetDiffOff}%`,
              impact: 'Unlocks momentum carry when trailing off throttle onto long straights.',
              urgency: 'medium',
            },
            {
              category: 'Suspension',
              parameter: 'Ride Height (Front / Rear)',
              currentValue: `${setup.frontRideHeight} / ${setup.rearRideHeight}`,
              recommendedValue: `${targetFrontRide} / ${targetRearRide}`,
              changeDelta: `-2 / -2 clicks`,
              adjustment: `Lower front ride height to ${targetFrontRide} and rear to ${targetRearRide}`,
              impact: 'Minimizes aerodynamic frontal cross-section and optimizes underfloor venturi flow.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Front Camber',
              currentValue: `${setup.frontCamber}°`,
              recommendedValue: `${targetFrontCamber}°`,
              changeDelta: `${(targetFrontCamber - setup.frontCamber).toFixed(2)}°`,
              adjustment: `Set front camber closer to ${targetFrontCamber}°`,
              impact: 'Reduces contact patch rolling friction on long full-throttle straights.',
              urgency: 'low',
            },
            {
              category: 'Tyres',
              parameter: 'Rear Tyre Pressures (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `+0.6 PSI`,
              adjustment: `Increase rear left and right tyre pressures to RL ${targetRLPSI} / RR ${targetRRPSI} PSI`,
              impact: 'Decreases rolling tire deflection and straight-line parasitic drag.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Prioritize exit geometric line in the corner leading onto the straight to apply full throttle earlier.',
          quickActionSummary: `Drop rear wing ${setup.rearWing} -> ${targetRearWing}, front wing to ${targetFrontWing}, lower ride height by 2 clicks, and pump rear tyres +0.6 PSI.`,
        };
  }

  // 2. Viraj Çıkışında Arkası Kopuyor / Exit snap oversteer
  if (
    query.includes('exit_oversteer') ||
    query.includes('arkadan kayma') ||
    query.includes('arkası kopuyor') ||
    query.includes('arkası kay') ||
    query.includes('snap') ||
    query.includes('oversteer') ||
    query.includes('gaza basınca') ||
    query.includes('spin')
  ) {
    const targetDiffOn = Math.max(50, Math.min(setup.diffOnThrottle - 6, 52));
    const targetRearARB = Math.max(1, setup.rearARB - 3);
    const targetRearWing = Math.min(50, setup.rearWing + 2);
    const targetRearSusp = Math.max(1, setup.rearSuspension - 3);
    const targetRearToe = Math.min(0.50, +(setup.rearToe + 0.05).toFixed(2));
    const targetRLPSI = +(setup.rlTyrePressure - 0.5).toFixed(1);
    const targetRRPSI = +(setup.rrTyrePressure - 0.5).toFixed(1);

    return isTr
      ? {
          title: `🏎️ ${trackName} — Viraj Çıkışında Arka Kopması & Snap Oversteer Teşhisi`,
          summary: `Gaza bastığınızda diferansiyel kilidinizin (%${setup.diffOnThrottle}), sert Arka Viraj Demiri (${setup.rearARB}), yay sertliğinizin (${setup.rearSuspension}) ve arka lastik basınçlarınızın (RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI) arka aksı kilitlediği ve ani tutunma kaybı (snap) yarattığı belirlendi.`,
          problemAnalysis: `Viraj çıkışında gaza basarken diferansiyel %${setup.diffOnThrottle} seviyesinde her iki arka tekeri aynı devirde dönmeye zorlar. Arka ARB (${setup.rearARB}) sert kaldığında iç tekerlek asfalttan havalanır, mikro patinaj başlatır ve anında spin tetikler.`,
          adjustments: [
            {
              category: 'Transmission',
              parameter: 'Gaza Basarken Diferansiyel (% On-Throttle)',
              currentValue: `%${setup.diffOnThrottle}`,
              recommendedValue: `%${targetDiffOn}`,
              changeDelta: `-%${setup.diffOnThrottle - targetDiffOn}`,
              adjustment: `Diferansiyeli %${setup.diffOnThrottle}'den %${targetDiffOn}'ye düşür (-%${setup.diffOnThrottle - targetDiffOn})`,
              impact: 'Arka tekerleklerin bağımsız dönmesine izin vererek apexten çıkarken anlık spin riskini yok eder.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Arka Viraj Demiri (Rear ARB)',
              currentValue: setup.rearARB,
              recommendedValue: targetRearARB,
              changeDelta: `-${setup.rearARB - targetRearARB} tık`,
              adjustment: `Arka ARB'yi ${setup.rearARB}'den ${targetRearARB}'e yumuşat (-${setup.rearARB - targetRearARB} tık)`,
              impact: 'Arka aksın esnemesini sağlayarak mekanik çekişi (mechanical grip) doğrudan yükseltir.',
              urgency: 'high',
            },
            {
              category: 'Aero',
              parameter: 'Arka Kanat (Rear Wing)',
              currentValue: setup.rearWing,
              recommendedValue: targetRearWing,
              changeDelta: `+${targetRearWing - setup.rearWing} kademe`,
              adjustment: `Arka kanadı ${setup.rearWing}'den ${targetRearWing}'e artır (+${targetRearWing - setup.rearWing} tık)`,
              impact: 'Çıkış ivmelenmesinde arka aksı aerodinamik bastırma kuvvetiyle yere basar.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Arka Süspansiyon (Rear Suspension)',
              currentValue: setup.rearSuspension,
              recommendedValue: targetRearSusp,
              changeDelta: `-${setup.rearSuspension - targetRearSusp} tık`,
              adjustment: `Arka yay sertliğini ${setup.rearSuspension}'den ${targetRearSusp}'e yumuşat`,
              impact: 'Gaza basıldığında arka ağırlık transferini (squat) homojenleştirir.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Arka İçe Açıklık (Rear Toe-In)',
              currentValue: `${setup.rearToe}°`,
              recommendedValue: `${targetRearToe}°`,
              changeDelta: `+0.05°`,
              adjustment: `Arka Toe-In değerini ${setup.rearToe}°'den ${targetRearToe}°'ye yükselt`,
              impact: 'Arka tekerlekleri viraj çıkışında hizalayarak yanal savrulmayı sönümler.',
              urgency: 'medium',
            },
            {
              category: 'Tyres',
              parameter: 'Arka Lastik Basınçları (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `-0.5 PSI`,
              adjustment: `Arka lastik basınçlarını düşürerek RL ${targetRLPSI} / RR ${targetRRPSI} PSI seviyesine çek`,
              impact: 'Lastik taban temas alanını genişleterek patinajı ve aşırı ısınmayı önler.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'Apexten sonra gaza aniden %100 oturmak yerine (%25 -> %60 -> %100) kademeli gaz pedalı uygulayın.',
          quickActionSummary: `Diferansiyeli %${setup.diffOnThrottle} -> %${targetDiffOn} yapın, Arka ARB'yi ${setup.rearARB} -> ${targetRearARB}'e yumuşatın, arka kanadı ${setup.rearWing} -> ${targetRearWing} artırın.`,
        }
      : {
          title: `🏎️ ${trackName} — Rear Instability & Power-On Snap Oversteer`,
          summary: `High on-throttle differential (%${setup.diffOnThrottle}) combined with stiff rear ARB (${setup.rearARB}), springs (${setup.rearSuspension}) and rear tyre pressures (RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI) are breaking rear traction violently under acceleration.`,
          problemAnalysis: `At %${setup.diffOnThrottle} on-throttle diff lock, the rear axle resists wheel speed differentiation on lock. A stiff rear roll bar lifts the inside tyre, inciting immediate snap oversteer.`,
          adjustments: [
            {
              category: 'Transmission',
              parameter: 'Differential On-Throttle',
              currentValue: `${setup.diffOnThrottle}%`,
              recommendedValue: `${targetDiffOn}%`,
              changeDelta: `-${setup.diffOnThrottle - targetDiffOn}%`,
              adjustment: `Reduce on-throttle diff from ${setup.diffOnThrottle}% down to ${targetDiffOn}%`,
              impact: 'Permits rear wheel differentiation to eliminate violent snap spins on corner exit.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Rear Anti-Roll Bar (Rear ARB)',
              currentValue: setup.rearARB,
              recommendedValue: targetRearARB,
              changeDelta: `-${setup.rearARB - targetRearARB} clicks`,
              adjustment: `Soften rear ARB from ${setup.rearARB} down to ${targetRearARB} (-${setup.rearARB - targetRearARB} clicks)`,
              impact: 'Introduces chassis compliance to generate immense mechanical traction.',
              urgency: 'high',
            },
            {
              category: 'Aero',
              parameter: 'Rear Wing Downforce',
              currentValue: setup.rearWing,
              recommendedValue: targetRearWing,
              changeDelta: `+${targetRearWing - setup.rearWing} clicks`,
              adjustment: `Increase rear wing from ${setup.rearWing} to ${targetRearWing} (+${targetRearWing - setup.rearWing} clicks)`,
              impact: 'Aerodynamically plants the rear axle as speed builds out of corners.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Rear Suspension Springs',
              currentValue: setup.rearSuspension,
              recommendedValue: targetRearSusp,
              changeDelta: `-${setup.rearSuspension - targetRearSusp} clicks`,
              adjustment: `Soften rear springs from ${setup.rearSuspension} down to ${targetRearSusp}`,
              impact: 'Facilitates controlled weight transfer onto rear tyres during launch.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Rear Toe-In',
              currentValue: `${setup.rearToe}°`,
              recommendedValue: `${targetRearToe}°`,
              changeDelta: `+0.05°`,
              adjustment: `Increase rear toe-in from ${setup.rearToe}° to ${targetRearToe}°`,
              impact: 'Enhances dynamic straight-line stability under heavy power-on squats.',
              urgency: 'medium',
            },
            {
              category: 'Tyres',
              parameter: 'Rear Tyre Pressures (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `-0.5 PSI`,
              adjustment: `Lower rear tyre pressures to RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              impact: 'Expands tire contact footprint to stop micro-spin friction.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'Use progressive throttle feed (25% -> 60% -> 100%) rather than instantly flooring the throttle pedal at apex.',
          quickActionSummary: `Drop diff to ${targetDiffOn}%, soften rear ARB to ${targetRearARB}, increase rear wing to ${targetRearWing}, and soften rear springs to ${targetRearSusp}.`,
        };
  }

  // 3. Yavaş Virajlarda Kafadan Kayma / Low speed understeer / Turn-in understeer
  if (
    query.includes('low_speed_understeer') ||
    query.includes('önden kayma') ||
    query.includes('dönmüyor') ||
    query.includes('kafadan') ||
    query.includes('yavaş viraj') ||
    query.includes('understeer') ||
    query.includes('burnu girmiyor') ||
    query.includes('turn-in')
  ) {
    const targetFrontWing = Math.min(50, setup.frontWing + 3);
    const targetFrontARB = Math.max(1, setup.frontARB - 3);
    const targetDiffOff = Math.max(50, Math.min(setup.diffOffThrottle - 4, 50));
    const targetFLPSI = +(setup.flTyrePressure - 0.4).toFixed(1);
    const targetFRPSI = +(setup.frTyrePressure - 0.4).toFixed(1);
    const targetFrontSusp = Math.max(1, setup.frontSuspension - 3);
    const targetFrontToe = Math.min(0.50, +(setup.frontToe + 0.04).toFixed(2));
    const targetFrontCamber = -2.50; // Maximum grip bite in F1 24/25

    return isTr
      ? {
          title: `🛑 ${trackName} — Düşük Hızlı Virajlarda Kafadan Kayma (Turn-In Understeer) Çözümü`,
          summary: `Ön Viraj Demiri (${setup.frontARB}), sert ön yaylar (${setup.frontSuspension}), Gaz Kesme diferansiyeli (%${setup.diffOffThrottle}) ve ön lastik basınçlarınız (FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI) aracın burnunun apexe dönmesini engelliyor.`,
          problemAnalysis: `Yavaş virajlarda mekanik tutuş ve şasi yönlenme çevikliği (yaw rotation) esastır. Ön ARB ${setup.frontARB} seviyesinde sert kaldığında ve ön lastik basınçları yüksek olduğunda dış ön tekerlek aşırı yüklenir ve dışa doğru sürüklenir (scrub).`,
          adjustments: [
            {
              category: 'Aero',
              parameter: 'Ön Kanat (Front Wing)',
              currentValue: setup.frontWing,
              recommendedValue: targetFrontWing,
              changeDelta: `+${targetFrontWing - setup.frontWing} kademe`,
              adjustment: `Ön kanadı ${setup.frontWing}'den ${targetFrontWing}'e artır (+${targetFrontWing - setup.frontWing} tık)`,
              impact: 'Direksiyon çevrildiği anda ön lastiklere doğrudan mekanik/aero ısırma sağlar.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Ön Viraj Demiri (Front ARB)',
              currentValue: setup.frontARB,
              recommendedValue: targetFrontARB,
              changeDelta: `-${setup.frontARB - targetFrontARB} tık`,
              adjustment: `Ön ARB'yi ${setup.frontARB}'den ${targetFrontARB}'e yumuşat (-${setup.frontARB - targetFrontARB} tık)`,
              impact: 'Viraj girişinde ön lastiklerin bağımsız esneyip yolu tam kavramasını sağlar.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Gaz Kesildiğinde Diferansiyel (% Off-Throttle)',
              currentValue: `%${setup.diffOffThrottle}`,
              recommendedValue: `%${targetDiffOff}`,
              changeDelta: `-%${setup.diffOffThrottle - targetDiffOff}`,
              adjustment: `Off-Throttle Diff'i %${setup.diffOffThrottle}'den %${targetDiffOff}'ye düşür`,
              impact: 'Ayak gazdan çekildiğinde diferansiyel kilidini serbest bırakarak aracın burnunu apexe çeker.',
              urgency: 'high',
            },
            {
              category: 'Tyres',
              parameter: 'Ön Lastik Basınçları (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.4 PSI`,
              adjustment: `Ön sol ve sağ lastik basınçlarını düşürerek FL ${targetFLPSI} / FR ${targetFRPSI} PSI yap`,
              impact: 'Ön lastik temas yüzeyini genişleterek direksiyon çevrildiğinde yolu ısırmasını (bite) sağlar.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Ön Yay Sertliği (Front Suspension)',
              currentValue: setup.frontSuspension,
              recommendedValue: targetFrontSusp,
              changeDelta: `-${setup.frontSuspension - targetFrontSusp} tık`,
              adjustment: `Ön yay sertliğini ${setup.frontSuspension}'den ${targetFrontSusp}'e yumuşat`,
              impact: 'Viraj girişinde ağırlığın ön aksa yüklenmesini kolaylaştırır.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Ön Dışa Açıklık (Front Toe-Out)',
              currentValue: `${setup.frontToe}°`,
              recommendedValue: `${targetFrontToe}°`,
              changeDelta: `+0.04°`,
              adjustment: `Ön Toe-Out değerini ${targetFrontToe}° seviyesine artır`,
              impact: 'Direksiyon ilk çevrildiği anda ön aksın apexe atılmasını (turn-in response) keskinleştirir.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Ön Kamber (Front Camber)',
              currentValue: `${setup.frontCamber}°`,
              recommendedValue: `${targetFrontCamber}°`,
              changeDelta: `${(targetFrontCamber - setup.frontCamber).toFixed(2)}°`,
              adjustment: `Ön kamberi en agresif tutuş açısı olan ${targetFrontCamber}° yap`,
              impact: 'Viraj ortasında ön lastiğin temas yüzeyini maksimize eder.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Frenden aniden çekilmek yerine viraj içine doğru %5-10 hafif trail-braking ile ön tekerlek yükünü koruyun.',
          quickActionSummary: `Ön kanadı ${setup.frontWing} -> ${targetFrontWing} yapın, Ön ARB'yi ${setup.frontARB} -> ${targetFrontARB}'e yumuşatın ve Off-Throttle Diff'i %${targetDiffOff}'ye çekin.`,
        }
      : {
          title: `🛑 ${trackName} — Slow-Speed Understeer & Turn-In Deficit`,
          summary: `Stiff front ARB (${setup.frontARB}), front springs (${setup.frontSuspension}), off-throttle diff (%${setup.diffOffThrottle}) and front tyre pressures (FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI) are resisting yaw rotation into slow corners.`,
          problemAnalysis: `In low speed turns, mechanical articulation dictates front bite. An excessively stiff front roll bar overloads the outer front tyre, creating front wash.`,
          adjustments: [
            {
              category: 'Aero',
              parameter: 'Front Wing Level',
              currentValue: setup.frontWing,
              recommendedValue: targetFrontWing,
              changeDelta: `+${targetFrontWing - setup.frontWing} clicks`,
              adjustment: `Increase front wing from ${setup.frontWing} up to ${targetFrontWing} (+${targetFrontWing - setup.frontWing} clicks)`,
              impact: 'Imparts instantaneous front bite as soon as steering lock is applied.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Front Anti-Roll Bar (Front ARB)',
              currentValue: setup.frontARB,
              recommendedValue: targetFrontARB,
              changeDelta: `-${setup.frontARB - targetFrontARB} clicks`,
              adjustment: `Soften front ARB from ${setup.frontARB} down to ${targetFrontARB} (-${setup.frontARB - targetFrontARB} clicks)`,
              impact: 'Permits independent front wheel articulation to maximize turn-in grip.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Differential Off-Throttle (Coast)',
              currentValue: `${setup.diffOffThrottle}%`,
              recommendedValue: `${targetDiffOff}%`,
              changeDelta: `-${setup.diffOffThrottle - targetDiffOff}%`,
              adjustment: `Decrease off-throttle differential to ${targetDiffOff}%`,
              impact: 'Unlocks mid-corner rotation to actively pull the nose into the apex.',
              urgency: 'high',
            },
            {
              category: 'Tyres',
              parameter: 'Front Tyre Pressures (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.4 PSI`,
              adjustment: `Lower front tyre pressures to FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI (-0.4 PSI)`,
              impact: 'Widens front tyre footprint to eliminate understeer scrub on turn-in.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Front Suspension Springs',
              currentValue: setup.frontSuspension,
              recommendedValue: targetFrontSusp,
              changeDelta: `-${setup.frontSuspension - targetFrontSusp} clicks`,
              adjustment: `Soften front springs from ${setup.frontSuspension} to ${targetFrontSusp}`,
              impact: 'Facilitates forward load transfer during braking and initial steering.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Front Toe-Out',
              currentValue: `${setup.frontToe}°`,
              recommendedValue: `${targetFrontToe}°`,
              changeDelta: `+0.04°`,
              adjustment: `Increase front toe-out to ${targetFrontToe}°`,
              impact: 'Sharpens front apex turn-in response.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'Maintain light trail-braking pressure (5-10%) right up to the apex to keep load pinned on the steering axle.',
          quickActionSummary: `Increase front wing to ${targetFrontWing}, soften front ARB to ${targetFrontARB}, and drop coast diff to ${targetDiffOff}%.`,
        };
  }

  // 4. Frenleme Kilitlenmesi & Kararsızlık / Braking Lock-up & Instability
  if (
    query.includes('braking') ||
    query.includes('fren') ||
    query.includes('kilitlen') ||
    query.includes('lock up') ||
    query.includes('frenleme')
  ) {
    const targetBias = setup.brakeBias > 55 ? 54 : 56;
    const targetPressure = Math.max(95, setup.brakePressure - 3);
    const targetDiffOff = Math.min(65, setup.diffOffThrottle + 4);
    const targetFLPSI = +(setup.flTyrePressure - 0.3).toFixed(1);
    const targetFRPSI = +(setup.frTyrePressure - 0.3).toFixed(1);
    const targetFrontSusp = Math.min(41, setup.frontSuspension + 2);

    return isTr
      ? {
          title: `🎯 ${trackName} — Fren Kararlılığı & Kilitlenme (Lock-Up) Önleme`,
          summary: `Fren dengeniz (%${setup.brakeBias}), fren basıncınız (%${setup.brakePressure}) ve ön lastik basınçlarınız (FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI) ağır fren bölgelerinde tekerlek kilitlenmesine ve şasi kararsızlığına yol açıyor.`,
          problemAnalysis: `Ön fren dengesi %${setup.brakeBias} seviyesinde ağır frenaj anında ağırlık öne yığıldığında ön lastikler dönme momentumunu kaybeder ve kilitlenir. Dengeyi geriye alıp, off-throttle diferansiyeli ve ön lastik temas alanını optimize ediyoruz.`,
          adjustments: [
            {
              category: 'Brakes',
              parameter: 'Ön Fren Dengesi (Front Brake Bias)',
              currentValue: `%${setup.brakeBias}`,
              recommendedValue: `%${targetBias}`,
              changeDelta: `${targetBias - setup.brakeBias > 0 ? '+' : ''}${targetBias - setup.brakeBias}%`,
              adjustment: `Ön fren dengesini %${setup.brakeBias}'den %${targetBias}'e ayarla`,
              impact: 'Durdurma torkunu 4 tekere yayarak ön lastiklerin kızaklamasını engeller.',
              urgency: 'high',
            },
            {
              category: 'Brakes',
              parameter: 'Fren Basıncı (Brake Pressure)',
              currentValue: `%${setup.brakePressure}`,
              recommendedValue: `%${targetPressure}`,
              changeDelta: `-%${setup.brakePressure - targetPressure}`,
              adjustment: `Fren basıncını %${setup.brakePressure}'den %${targetPressure}'e indir`,
              impact: 'Eşik hissini yumuşatarak ABS kapalıyken tekerleğin kitlenmesini önler.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Gaz Kesildiğinde Diferansiyel (% Off-Throttle)',
              currentValue: `%${setup.diffOffThrottle}`,
              recommendedValue: `%${targetDiffOff}`,
              changeDelta: `+${targetDiffOff - setup.diffOffThrottle}%`,
              adjustment: `Off-Throttle diferansiyeli %${setup.diffOffThrottle}'den %${targetDiffOff}'e yükselt`,
              impact: 'Düzlük sonu sert frenajda arka aksın ray gibi düz hatta kalmasını sağlar.',
              urgency: 'medium',
            },
            {
              category: 'Tyres',
              parameter: 'Ön Lastik Basınçları (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.3 PSI`,
              adjustment: `Ön lastik basınçlarını -0.3 PSI indirerek FL ${targetFLPSI} / FR ${targetFRPSI} PSI yap`,
              impact: 'Ön tekerlek temas alanını genişleterek kilitlenme eşiğini geciktirir.',
              urgency: 'medium',
            },
            {
              category: 'Suspension',
              parameter: 'Ön Yay Sertliği (Front Suspension)',
              currentValue: setup.frontSuspension,
              recommendedValue: targetFrontSusp,
              changeDelta: `+2 tık`,
              adjustment: `Ön yayları ${setup.frontSuspension}'den ${targetFrontSusp}'e sertleştir`,
              impact: 'Frende şasinin öne aşırı çökmesini (dive) engelleyerek taban aerodinamiğini korur.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'Frene ilk darbeyi düz çizgide %100 basın; hız düştükçe ve direksiyon açısı arttıkça freni kademeli serbest bırakın (Trail-braking).',
          quickActionSummary: `Fren dengesini %${targetBias} yapın, basıncı %${targetPressure}'e çekin, Off-Throttle Diff'i %${targetDiffOff} yapın.`,
        }
      : {
          title: `🎯 ${trackName} — Brake Stability & Lock-Up Prevention`,
          summary: `Brake bias (%${setup.brakeBias}), threshold pressure (%${setup.brakePressure}) and front tyre pressures (FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI) are inducing wheel lock-ups in heavy braking zones.`,
          problemAnalysis: `At %${setup.brakeBias} front bias, dynamic pitch transfer overloads the front axle under heavy deceleration, locking wheels as steering input begins.`,
          adjustments: [
            {
              category: 'Brakes',
              parameter: 'Front Brake Bias',
              currentValue: `${setup.brakeBias}%`,
              recommendedValue: `${targetBias}%`,
              changeDelta: `${targetBias - setup.brakeBias > 0 ? '+' : ''}${targetBias - setup.brakeBias}%`,
              adjustment: `Adjust front brake bias from ${setup.brakeBias}% to ${targetBias}%`,
              impact: 'Distributes stopping torque evenly across all four tires to eliminate front lock-up.',
              urgency: 'high',
            },
            {
              category: 'Brakes',
              parameter: 'Brake Pressure',
              currentValue: `${setup.brakePressure}%`,
              recommendedValue: `${targetPressure}%`,
              changeDelta: `-${setup.brakePressure - targetPressure}%`,
              adjustment: `Reduce brake pressure down to ${targetPressure}%`,
              impact: 'Widens threshold modulation window without losing braking distance.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Differential Off-Throttle',
              currentValue: `${setup.diffOffThrottle}%`,
              recommendedValue: `${targetDiffOff}%`,
              changeDelta: `+${targetDiffOff - setup.diffOffThrottle}%`,
              adjustment: `Increase off-throttle diff to ${targetDiffOff}%`,
              impact: 'Stabilizes straight-line braking and prevents rear wandering.',
              urgency: 'medium',
            },
            {
              category: 'Tyres',
              parameter: 'Front Tyre Pressures (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.3 PSI`,
              adjustment: `Lower front tyre pressures to FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI (-0.3 PSI)`,
              impact: 'Expands front tyre contact footprint to delay wheel lock-up threshold.',
              urgency: 'medium',
            },
            {
              category: 'Suspension',
              parameter: 'Front Suspension Springs',
              currentValue: setup.frontSuspension,
              recommendedValue: targetFrontSusp,
              changeDelta: `+2 clicks`,
              adjustment: `Stiffen front suspension from ${setup.frontSuspension} to ${targetFrontSusp}`,
              impact: 'Resists forward chassis dive to keep aerodynamic floor suction consistent.',
              urgency: 'medium',
            },
          ],
          telemetryTip: 'Apply maximum 100% threshold pressure while car is completely straight, then bleed off pressure progressively as steering lock increases.',
          quickActionSummary: `Adjust brake bias to ${targetBias}%, lower pressure to ${targetPressure}%, and raise off-throttle diff to ${targetDiffOff}%.`,
        };
  }

  // 5. Bordürlerde Sekme ve Taban Vurma / Kerb instability
  if (
    query.includes('kerb') ||
    query.includes('bordür') ||
    query.includes('sekme') ||
    query.includes('zıplama') ||
    query.includes('taban') ||
    query.includes('bottoming')
  ) {
    const targetFrontRide = Math.min(45, setup.frontRideHeight + 3);
    const targetRearRide = Math.min(65, setup.rearRideHeight + 3);
    const targetFrontSusp = Math.max(1, setup.frontSuspension - 4);
    const targetRearSusp = Math.max(1, setup.rearSuspension - 3);
    const targetFrontARB = Math.max(1, setup.frontARB - 3);
    const targetFLPSI = +(setup.flTyrePressure - 0.4).toFixed(1);
    const targetFRPSI = +(setup.frTyrePressure - 0.4).toFixed(1);

    return isTr
      ? {
          title: `🚧 ${trackName} — Bordür (Kerb) Uyumluluğu & Taban Vurma Çözümü`,
          summary: `Mevcut taban yüksekliğiniz (${setup.frontRideHeight}/${setup.rearRideHeight}), sert yaylarınız (${setup.frontSuspension}/${setup.rearSuspension}) ve ARB ayarlarınız bordür darbelerinde aracın kontrolsüzce zıplamasına neden oluyor.`,
          problemAnalysis: `Alçak taban bordür tepesinde yere vurduğunda (bottoming out) Venturi zemin hava akımı kopar ve anlık aerodinamik kayıp yaşanır. Yayları ve viraj demirlerini yumuşatıp tabanı yükselterek bordür emilimini maksimize ediyoruz.`,
          adjustments: [
            {
              category: 'Suspension',
              parameter: 'Sürüş Yüksekliği (Ride Height Ön / Arka)',
              currentValue: `${setup.frontRideHeight} / ${setup.rearRideHeight}`,
              recommendedValue: `${targetFrontRide} / ${targetRearRide}`,
              changeDelta: `+3 / +3 tık`,
              adjustment: `Ön tabanı ${setup.frontRideHeight}'den ${targetFrontRide}'e, Arka tabanı ${setup.rearRideHeight}'den ${targetRearRide}'e yükselt (+3 tık)`,
              impact: 'Bordür tepelerinde tabanın yere çarpmasını (bottoming out) önler.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Ön Süspansiyon (Front Suspension)',
              currentValue: setup.frontSuspension,
              recommendedValue: targetFrontSusp,
              changeDelta: `-${setup.frontSuspension - targetFrontSusp} tık`,
              adjustment: `Ön yay sertliğini ${setup.frontSuspension}'den ${targetFrontSusp}'e yumuşat`,
              impact: 'Amortisörlerin bordür sarsıntılarını sönümleyerek lastiklerin asfaltta kalmasını sağlar.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Ön Viraj Demiri (Front ARB)',
              currentValue: setup.frontARB,
              recommendedValue: targetFrontARB,
              changeDelta: `-${setup.frontARB - targetFrontARB} tık`,
              adjustment: `Ön ARB'yi ${setup.frontARB}'den ${targetFrontARB}'e düşür`,
              impact: 'Şasideki yanal rijitliği azaltarak bordürde tekerleklerin askıda kalmasını engeller.',
              urgency: 'medium',
            },
            {
              category: 'Suspension',
              parameter: 'Arka Süspansiyon (Rear Suspension)',
              currentValue: setup.rearSuspension,
              recommendedValue: targetRearSusp,
              changeDelta: `-${setup.rearSuspension - targetRearSusp} tık`,
              adjustment: `Arka yay sertliğini ${setup.rearSuspension}'den ${targetRearSusp}'e yumuşat`,
              impact: 'Bordürden inişte arka aksın sert sekmesini engeller.',
              urgency: 'medium',
            },
            {
              category: 'Tyres',
              parameter: 'Ön Lastik Basınçları (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.4 PSI`,
              adjustment: `Ön sol ve sağ lastik basınçlarını FL ${targetFLPSI} / FR ${targetFRPSI} PSI'a düşür`,
              impact: 'Lastik yanak esnemesini artırarak bordür darbelerini ilk sönümleyen hava yastığı görevi görür.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Bordürlerin en yüksek sivri kısımlarından (sausage kerbs) kaçının; tekerleği bordürün düz boyalı şeridinde tutun.',
          quickActionSummary: `Taban yüksekliğini +3 tık artırın (${targetFrontRide}/${targetRearRide}), ön yayları ${targetFrontSusp}'e yumuşatın.`,
        }
      : {
          title: `🚧 ${trackName} — Kerb Compliance & Bottoming-Out Resolution`,
          summary: `Ride heights (${setup.frontRideHeight}/${setup.rearRideHeight}) and stiff springs (${setup.frontSuspension}) are unable to absorb violent kerb impacts, causing chassis bottoming.`,
          problemAnalysis: `Bottoming out on kerb crowns severs underfloor ground effect suction, tossing the car offline. Raising ride heights and softening suspension restores full compliance.`,
          adjustments: [
            {
              category: 'Suspension',
              parameter: 'Ride Height (Front / Rear)',
              currentValue: `${setup.frontRideHeight} / ${setup.rearRideHeight}`,
              recommendedValue: `${targetFrontRide} / ${targetRearRide}`,
              changeDelta: `+3 / +3 clicks`,
              adjustment: `Raise front ride height to ${targetFrontRide} and rear to ${targetRearRide} (+3 clicks)`,
              impact: 'Prevents floor planks from striking kerb crowns and causing sudden downforce stall.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Front Suspension Springs',
              currentValue: setup.frontSuspension,
              recommendedValue: targetFrontSusp,
              changeDelta: `-${setup.frontSuspension - targetFrontSusp} clicks`,
              adjustment: `Soften front springs from ${setup.frontSuspension} to ${targetFrontSusp}`,
              impact: 'Allows dampers to soak up high-frequency kerb impacts.',
              urgency: 'high',
            },
            {
              category: 'Suspension',
              parameter: 'Front Anti-Roll Bar (Front ARB)',
              currentValue: setup.frontARB,
              recommendedValue: targetFrontARB,
              changeDelta: `-${setup.frontARB - targetFrontARB} clicks`,
              adjustment: `Soften front ARB from ${setup.frontARB} to ${targetFrontARB}`,
              impact: 'Reduces lateral jarring across chassis when straddling kerbs.',
              urgency: 'medium',
            },
            {
              category: 'Suspension',
              parameter: 'Rear Suspension Springs',
              currentValue: setup.rearSuspension,
              recommendedValue: targetRearSusp,
              changeDelta: `-${setup.rearSuspension - targetRearSusp} clicks`,
              adjustment: `Soften rear springs to ${targetRearSusp}`,
              impact: 'Cushions chassis rebound when coming off exit kerbs.',
              urgency: 'medium',
            },
            {
              category: 'Tyres',
              parameter: 'Front Tyre Pressures (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.4 PSI`,
              adjustment: `Lower front tyre pressures to FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              impact: 'Allows tyre sidewall to act as a primary shock absorber over kerbs.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Clip the flat painted apron of kerbs while avoiding direct strikes onto pyramid sausage curbs.',
          quickActionSummary: `Raise ride heights to ${targetFrontRide}/${targetRearRide} and soften front springs to ${targetFrontSusp}.`,
        };
  }

  // 6. Lastik Aşırı Isınması / Tyre overheating
  if (
    query.includes('lastik') ||
    query.includes('ısı') ||
    query.includes('sıcaklık') ||
    query.includes('overheating') ||
    query.includes('aşınma') ||
    query.includes('tyre')
  ) {
    const targetRLPSI = +(setup.rlTyrePressure - 0.8).toFixed(1);
    const targetRRPSI = +(setup.rrTyrePressure - 0.8).toFixed(1);
    const targetFLPSI = +(setup.flTyrePressure - 0.5).toFixed(1);
    const targetFRPSI = +(setup.frTyrePressure - 0.5).toFixed(1);
    const targetDiffOn = Math.max(50, setup.diffOnThrottle - 6);
    const targetRearWing = Math.min(50, setup.rearWing + 2);
    const targetRearCamber = Math.min(-0.70, +(setup.rearCamber + 0.15).toFixed(2));

    return isTr
      ? {
          title: `🔥 ${trackName} — Lastik Aşırı Isınması & Termal Aşınma Önleme`,
          summary: `Arka lastik basınçlarınız (RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI) ve diferansiyel kilidiniz (%${setup.diffOnThrottle}) viraj çıkışında mikro patinaj yaratarak lastik hamurunu aşırı ısıtıyor.`,
          problemAnalysis: `Yüksek lastik basıncı temas alanını daraltır. Viraj çıkışında kayan lastik 105°C+ sıcaklığa çıkarak tutuşunu hızla kaybeder. 4 tekerlek basınçlarını düşürüp diferansiyeli yumuşatarak termal dengeyi sağlıyoruz.`,
          adjustments: [
            {
              category: 'Tyres',
              parameter: 'Arka Lastik Basınçları (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `-0.8 PSI`,
              adjustment: `Arka lastik basınçlarını düşürerek RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI yap (-0.8 PSI)`,
              impact: 'İç gaz genleşmesini dengeler ve aşırı sıcaklık artışını doğrudan keser.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Gaza Basarken Diferansiyel (% On-Throttle)',
              currentValue: `%${setup.diffOnThrottle}`,
              recommendedValue: `%${targetDiffOn}`,
              changeDelta: `-%${setup.diffOnThrottle - targetDiffOn}`,
              adjustment: `Diferansiyeli %${setup.diffOnThrottle}'den %${targetDiffOn}'ye düşür`,
              impact: 'Viraj çıkışlarındaki mikro patinajı ve lastik sürtünmesini engeller.',
              urgency: 'high',
            },
            {
              category: 'Tyres',
              parameter: 'Ön Lastik Basınçları (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.5 PSI`,
              adjustment: `Ön lastik basınçlarını FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI'a düşür`,
              impact: 'Viraj girişinde ön lastik omzunun kavrulmasını ve sürtünme kaynaklı aşınmasını önler.',
              urgency: 'medium',
            },
            {
              category: 'Aero',
              parameter: 'Arka Kanat (Rear Wing)',
              currentValue: setup.rearWing,
              recommendedValue: targetRearWing,
              changeDelta: `+2 kademe`,
              adjustment: `Arka kanadı ${setup.rearWing}'den ${targetRearWing}'e yükselt`,
              impact: 'Arka tarafın kaymasını engelleyerek sürtünme kaynaklı termal yıpranmayı bitirir.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Arka Kamber (Rear Camber)',
              currentValue: `${setup.rearCamber}°`,
              recommendedValue: `${targetRearCamber}°`,
              changeDelta: `+0.15°`,
              adjustment: `Arka kamberi ${setup.rearCamber}°'den ${targetRearCamber}°'ye düzleştir`,
              impact: 'Lastik iç omuzunun aşırı ısınmasını engeller ve taban ısısını homojen yayar.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Arka lastikleri soğutmak için viraj çıkışlarında 1 vites yüksek kalın (Early upshift) ve ani gaz hareketlerinden kaçının.',
          quickActionSummary: `Arka lastik basıncını RL ${targetRLPSI} / RR ${targetRRPSI} PSI'a indirin ve diferansiyeli %${targetDiffOn} yapın.`,
        }
      : {
          title: `🔥 ${trackName} — Tyre Overheating & Thermal Degradation Control`,
          summary: `Rear tyre pressures (RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI) and on-throttle diff (%${setup.diffOnThrottle}) are causing continuous micro-wheelspin and thermal spikes.`,
          problemAnalysis: `High pressures reduce the tyre contact patch. Under lateral loads, sliding surface friction overheats the carcass past 105°C. Lowering 4-corner pressures and diff lock restores thermal equilibrium.`,
          adjustments: [
            {
              category: 'Tyres',
              parameter: 'Rear Tyre Pressures (RL & RR Tyres)',
              currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
              recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
              changeDelta: `-0.8 PSI`,
              adjustment: `Lower rear tyre pressures to RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI (-0.8 PSI)`,
              impact: 'Compensates for thermal air expansion and cools the contact surface.',
              urgency: 'high',
            },
            {
              category: 'Transmission',
              parameter: 'Differential On-Throttle',
              currentValue: `${setup.diffOnThrottle}%`,
              recommendedValue: `${targetDiffOn}%`,
              changeDelta: `-${setup.diffOnThrottle - targetDiffOn}%`,
              adjustment: `Reduce on-throttle diff to ${targetDiffOn}%`,
              impact: 'Eliminates micro-wheelspin on exit to preserve rubber compound.',
              urgency: 'high',
            },
            {
              category: 'Tyres',
              parameter: 'Front Tyre Pressures (FL & FR Tyres)',
              currentValue: `FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} PSI`,
              recommendedValue: `FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              changeDelta: `-0.5 PSI`,
              adjustment: `Lower front tyre pressures to FL: ${targetFLPSI} / FR: ${targetFRPSI} PSI`,
              impact: 'Reduces front tyre sliding friction across mid-corner lateral loads.',
              urgency: 'medium',
            },
            {
              category: 'Aero',
              parameter: 'Rear Wing Level',
              currentValue: setup.rearWing,
              recommendedValue: targetRearWing,
              changeDelta: `+2 clicks`,
              adjustment: `Increase rear wing to ${targetRearWing}`,
              impact: 'Locks down rear traction to prevent lateral tire scrubbing.',
              urgency: 'medium',
            },
            {
              category: 'Geometry',
              parameter: 'Rear Camber',
              currentValue: `${setup.rearCamber}°`,
              recommendedValue: `${targetRearCamber}°`,
              changeDelta: `+0.15°`,
              adjustment: `Straighten rear camber to ${targetRearCamber}°`,
              impact: 'Evens out tyre inner shoulder temperature distribution.',
              urgency: 'low',
            },
          ],
          telemetryTip: 'Short-shift one gear higher out of slow corners to avoid aggressive wheelspin on straights.',
          quickActionSummary: `Lower rear tyre pressures to RL ${targetRLPSI} / RR ${targetRRPSI} PSI and drop on-throttle diff to ${targetDiffOn}%.`,
        };
  }

  // Fallback generic diagnosis covering all setup categories
  const targetDiffOn = Math.max(50, setup.diffOnThrottle - 4);
  const targetDiffOff = Math.max(50, setup.diffOffThrottle - 2);
  const targetRearARB = Math.max(1, setup.rearARB - 2);
  const targetFrontWing = Math.min(50, setup.frontWing + 2);
  const targetRLPSI = +(setup.rlTyrePressure - 0.4).toFixed(1);
  const targetRRPSI = +(setup.rrTyrePressure - 0.4).toFixed(1);
  const targetFrontRide = Math.max(10, setup.frontRideHeight - 1);
  const targetRearRide = Math.max(30, setup.rearRideHeight - 1);

  return isTr
    ? {
        title: `🔧 ${trackName} — Tam Telemetri ve 6-Kategori Setup İnce Ayar Paketi`,
        summary: `Mevcut setup parametrelerinize (${setup.frontWing}/${setup.rearWing} kanat, %${setup.diffOnThrottle}/%${setup.diffOffThrottle} diff, ${setup.frontARB}/${setup.rearARB} ARB, ${setup.frontRideHeight}/${setup.rearRideHeight} taban, FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} / RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI) göre önerilen telemetri revizyonu:`,
        problemAnalysis: `Bildirilen araç davranışı dengesizliği; Diferansiyel, Viraj Demiri, 4-Köşe Lastik Basınçları ve Kanat oranlarının pist karakteristiğiyle tam örtüşmemesinden kaynaklanır.`,
        adjustments: [
          {
            category: 'Aero',
            parameter: 'Ön Kanat (Front Wing)',
            currentValue: setup.frontWing,
            recommendedValue: targetFrontWing,
            changeDelta: `+2 kademe`,
            adjustment: `Ön kanadı ${setup.frontWing}'den ${targetFrontWing}'e artır`,
            impact: 'Viraj girişinde aracın apexe yönlenmesini güçlendirir.',
            urgency: 'high',
          },
          {
            category: 'Transmission',
            parameter: 'Gaza Basarken Diferansiyel (% On-Throttle)',
            currentValue: `%${setup.diffOnThrottle}`,
            recommendedValue: `%${targetDiffOn}`,
            changeDelta: `-%${setup.diffOnThrottle - targetDiffOn}`,
            adjustment: `Diferansiyeli %${setup.diffOnThrottle}'den %${targetDiffOn}'ye düşür`,
            impact: 'Viraj dönüş çevikliği ve dengeli çıkış çekişi sağlar.',
            urgency: 'high',
          },
          {
            category: 'Transmission',
            parameter: 'Gaz Kesildiğinde Diferansiyel (% Off-Throttle)',
            currentValue: `%${setup.diffOffThrottle}`,
            recommendedValue: `%${targetDiffOff}`,
            changeDelta: `-%${setup.diffOffThrottle - targetDiffOff}`,
            adjustment: `Off-throttle diferansiyeli %${setup.diffOffThrottle}'den %${targetDiffOff}'e düşür`,
            impact: 'Viraj ortasında aracın rahat dönmesini (rotation) ve apexe oturmasını sağlar.',
            urgency: 'medium',
          },
          {
            category: 'Suspension',
            parameter: 'Arka Viraj Demiri (Rear ARB)',
            currentValue: setup.rearARB,
            recommendedValue: targetRearARB,
            changeDelta: `-${setup.rearARB - targetRearARB} tık`,
            adjustment: `Arka ARB'yi ${setup.rearARB}'den ${targetRearARB}'e yumuşat`,
            impact: 'Viraj çıkışında arka aksın yola oturmasını destekler.',
            urgency: 'medium',
          },
          {
            category: 'Tyres',
            parameter: 'Arka Lastik Basınçları (RL & RR Tyres)',
            currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
            recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
            changeDelta: `-0.4 PSI`,
            adjustment: `Arka lastik basınçlarını RL ${targetRLPSI} / RR ${targetRRPSI} PSI seviyesine indir`,
            impact: 'Arka lastik çekiş yüzeyini genişleterek çekiş ve yol tutuş stabilitesi sağlar.',
            urgency: 'medium',
          },
          {
            category: 'Suspension',
            parameter: 'Sürüş Yüksekliği (Ride Height)',
            currentValue: `${setup.frontRideHeight}/${setup.rearRideHeight}`,
            recommendedValue: `${targetFrontRide}/${targetRearRide}`,
            changeDelta: `-1/-1 tık`,
            adjustment: `Sürüş yüksekliğini 1 tık alçaltarak taban emişini artır`,
            impact: 'Zemin etkisiyle aerodinamik çekişi güçlendirir.',
            urgency: 'low',
          },
        ],
        telemetryTip: 'Pistin en çok zaman kazanılan sektöründeki virajlara odaklanıp telemetri apex hızınızı referans alın.',
        quickActionSummary: `Diferansiyeli %${targetDiffOn} seviyesine çekin, Arka ARB'yi ${targetRearARB} yapın ve arka lastik basınçlarını düşürün.`,
      }
    : {
        title: `🔧 ${trackName} — Complete 6-Category Telemetry & Calibration Package`,
        summary: `Tailored adjustments based on your current setup (${setup.frontWing}/${setup.rearWing} wings, ${setup.diffOnThrottle}%/${setup.diffOffThrottle}% diff, ${setup.frontARB}/${setup.rearARB} ARB, ${setup.frontRideHeight}/${setup.rearRideHeight} ride, FL: ${setup.flTyrePressure} / FR: ${setup.frTyrePressure} / RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI):`,
        problemAnalysis: `Chassis handling deficits trace back to differential preload, anti-roll bar distribution, 4-corner tyre pressures, and aerodynamic wing balance.`,
        adjustments: [
          {
            category: 'Aero',
            parameter: 'Front Wing Level',
            currentValue: setup.frontWing,
            recommendedValue: targetFrontWing,
            changeDelta: `+2 clicks`,
            adjustment: `Increase front wing from ${setup.frontWing} to ${targetFrontWing}`,
            impact: 'Sharpens front axle response into corner apexes.',
            urgency: 'high',
          },
          {
            category: 'Transmission',
            parameter: 'Differential On-Throttle',
            currentValue: `${setup.diffOnThrottle}%`,
            recommendedValue: `${targetDiffOn}%`,
            changeDelta: `-${setup.diffOnThrottle - targetDiffOn}%`,
            adjustment: `Reduce on-throttle diff from ${setup.diffOnThrottle}% down to ${targetDiffOn}%`,
            impact: 'Enhances mid-corner rotation paired with smooth exit traction.',
            urgency: 'high',
          },
          {
            category: 'Transmission',
            parameter: 'Differential Off-Throttle',
            currentValue: `${setup.diffOffThrottle}%`,
            recommendedValue: `${targetDiffOff}%`,
            changeDelta: `-${setup.diffOffThrottle - targetDiffOff}%`,
            adjustment: `Reduce off-throttle diff from ${setup.diffOffThrottle}% down to ${targetDiffOff}%`,
            impact: 'Improves turn-in rotation on corner entry.',
            urgency: 'medium',
          },
          {
            category: 'Suspension',
            parameter: 'Rear Anti-Roll Bar (Rear ARB)',
            currentValue: setup.rearARB,
            recommendedValue: targetRearARB,
            changeDelta: `-${setup.rearARB - targetRearARB} clicks`,
            adjustment: `Soften rear ARB from ${setup.rearARB} down to ${targetRearARB}`,
            impact: 'Allows progressive mechanical weight transfer on acceleration.',
            urgency: 'medium',
          },
          {
            category: 'Tyres',
            parameter: 'Rear Tyre Pressures (RL & RR Tyres)',
            currentValue: `RL: ${setup.rlTyrePressure} / RR: ${setup.rrTyrePressure} PSI`,
            recommendedValue: `RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
            changeDelta: `-0.4 PSI`,
            adjustment: `Lower rear tyre pressures to RL: ${targetRLPSI} / RR: ${targetRRPSI} PSI`,
            impact: 'Increases traction footprint on corner exit acceleration.',
            urgency: 'medium',
          },
          {
            category: 'Suspension',
            parameter: 'Ride Height',
            currentValue: `${setup.frontRideHeight}/${setup.rearRideHeight}`,
            recommendedValue: `${targetFrontRide}/${targetRearRide}`,
            changeDelta: `-1/-1 click`,
            adjustment: `Lower ride height by 1 click for enhanced floor suction`,
            impact: 'Optimizes ground effect venturi tunnel velocity.',
            urgency: 'low',
          },
        ],
        telemetryTip: 'Focus on corner exit speed in the primary traction zones for maximum lap time gain.',
        quickActionSummary: `Set on-throttle diff to ${targetDiffOn}%, soften rear ARB to ${targetRearARB}, and adjust rear tyre pressures.`,
      };
}
