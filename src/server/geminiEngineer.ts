import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { TRACKS } from '../data/mockData';
import {
  DriverSetupValues,
  parseSetupFromText,
  diagnoseHandlingIssueWithSetup,
  SetupAdjustment,
} from '../utils/f1EngineerEngine';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({});
  }
  return aiClient;
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  content: string;
}

export async function handleEngineerChat(req: Request, res: Response) {
  try {
    const {
      messages = [],
      userQuery,
      currentSetup,
      trackId = 'spa',
      gameId = 'f1_25',
      language = 'tr',
    } = req.body;

    const isTr = language === 'tr';
    const effectiveQuery = (userQuery || (messages.length > 0 ? messages[messages.length - 1].content : '') || '').trim();

    // 1. Intelligently parse any setup values present in userQuery or messages
    let updatedSetup: DriverSetupValues = currentSetup || {
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
    };

    if (effectiveQuery) {
      updatedSetup = parseSetupFromText(effectiveQuery, updatedSetup);
    }

    const trackObj = TRACKS[trackId] || Object.values(TRACKS)[0];
    const trackName = trackObj ? trackObj.name : trackId.toUpperCase();

    // 2. Try Gemini API first if API key is provided
    const ai = getGenAI();
    if (ai) {
      try {
        const systemInstruction = `You are the world-class F1 Chief Race & Performance Engineer (in the style of Gianpiero Lambiase / Peter Bonnington) communicating live with your driver over the pit-to-car radio telemetry intercom.
Your job is to provide conversational, deeply realistic, game-accurate motorsport setup advice grounded in actual F1 game physics, thermal tire models, and proven competitive meta tactics from the sim racing community (r/F1game, F1 Esports, SimGrid).

Game Regulations Context:
- Current game: ${gameId === 'f1_24' ? 'F1 24 (2024 Ground Effect physics, sensitive ride height & stiff suspension)' : gameId === 'f1_26' ? 'F1 26 (2026 Active Aerodynamics regulations, manual override modes)' : 'F1 25 (2025 FIA Technical Regulations, mechanical suspension compliance & ground effect diffuser)'}
- Circuit: ${trackName} (${trackObj?.lengthKm || 'Grand Prix Circuit'}, ${trackObj?.turnCount || 18} Turns, ${trackObj?.country || ''})

Current Driver Telemetry & Car Setup Snapshot (All 6 Categories):
• Aerodynamics: Front Wing ${updatedSetup.frontWing} | Rear Wing ${updatedSetup.rearWing}
• Transmission: On-Throttle Diff ${updatedSetup.diffOnThrottle}% | Off-Throttle Diff ${updatedSetup.diffOffThrottle}%
• Geometry: Camber ${updatedSetup.frontCamber}° / ${updatedSetup.rearCamber}° | Toe ${updatedSetup.frontToe}° / ${updatedSetup.rearToe}°
• Suspension: Springs F${updatedSetup.frontSuspension} / R${updatedSetup.rearSuspension} | ARBs F${updatedSetup.frontARB} / R${updatedSetup.rearARB} | Ride Height F${updatedSetup.frontRideHeight} / R${updatedSetup.rearRideHeight}
• Brakes: Pressure ${updatedSetup.brakePressure}% | Bias ${updatedSetup.brakeBias}%
• Tyres (4 Individual Corners): FL ${updatedSetup.flTyrePressure} PSI / FR ${updatedSetup.frTyrePressure} PSI | RL ${updatedSetup.rlTyrePressure} PSI / RR ${updatedSetup.rrTyrePressure} PSI

CRITICAL F1 GAME PHYSICS & COMMUNITY META PRINCIPLES (r/F1game & Esports standard):
1. QUALIFYING / TIME TRIAL vs. RACE STINT TYRE PRESSURES & THERMAL MODEL:
   - For 1-Shot Qualifying / Time Trial / Hot Laps: Run HIGH or MAXIMUM tyre pressures (e.g., 27.5 - 29.5 FL/FR, 24.5 - 26.5 RL/RR). Stiffer carcass sidewalls eliminate deflection lag, provide razor-sharp turn-in, and build immediate internal core temperature for Lap 1 grip.
     *STRICT RULE / BUG AVOIDANCE*: NEVER tell the driver to reduce tyre pressures for qualifying or 1-shot hotlaps! Lowering pressures for qualifying is a common amateur bug/myth that causes cold-tyre wash and sluggish turn-in.
   - For Race Stints (50% / 100% distance): Run LOWER or MODERATE tyre pressures (e.g., 22.0 - 23.5 FL/FR, 20.0 - 21.5 RL/RR) to keep surface and carcass core temps in the optimal 95°C - 102°C operating window. Overheating past 105°C triggers thermal degradation and violent snap oversteer. Account for asymmetrical lateral wear on high-load circuits (e.g., left tires on clockwise circuits like Bahrain or Barcelona).
2. SUSPENSION ROLL STIFFNESS DECOUPLING ("FRONT STIFF / REAR SOFT ARB" META):
   - Front ARB should be stiff (8 to 11) to give direct steering response and keep the front aerodynamic splitter level.
   - Rear ARB should be soft (1, 2, or 3). In modern F1 games, running a stiff rear ARB unweights the inside rear wheel on kerbs or during roll, instantly provoking snap-spins! Setting rear ARB to 1-2 is the holy grail community fix for exit traction.
   - Rear Springs should be soft (10 - 18) to permit mechanical rear squat and forward traction on acceleration.
3. DIFFERENTIAL PRELOAD & ROTATION:
   - On-Throttle: 50% to 55% is the competitive meta standard for 95% of tracks. High on-throttle (60%+) forces both rear wheels to turn at identical speeds, initiating power-on snap spins.
   - Off-Throttle: 50% to 52% unlocks maximum mid-corner yaw rotation. 54% to 58% is only used to stabilize corner entry or trail-braking loose rear.
4. BRAKING SYSTEM:
   - Brake Pressure must be 100% (never suggest dropping to 80-85%, which ruins stopping distance; coach threshold braking instead).
   - Brake Bias: 54% to 55% is the meta sweet spot. 56%+ causes front wheel lock-ups on turn-in; below 53% causes dangerous rear lock-ups and spins under trail-braking.
5. AERODYNAMICS & GROUND EFFECT:
   - Wing Delta: Front wing should typically be 2 to 5 clicks higher than rear wing to ensure crisp high-speed rotation (Copse, Pouhon, 130R).
   - Ride Height: Maintain low front ride height (33 - 35) with a slight rear rake (+4 to +6 clicks rear, e.g. 35/40) to seal Venturi ground-effect suction. If bottoming out on kerbs, raise both by 2-3 clicks to avoid violent diffuser aerodynamic stall.

Guidelines for Response:
1. Speak in a conversational, authentic pit wall tone ("Copy that driver", "Radio check", "Looking at your telemetry from sector 2", etc.).
2. Directly address the driver's specific complaints and circuit characteristics. Apply the community meta logic and explain the underlying physics (diffuser floor stall, roll stiffness decoupling, tyre carcass vs. surface temperatures, differential slip, etc.).
3. Propose concrete click-by-click parameter adjustments based on their CURRENT setup numbers.
4. ${isTr ? 'RESPOND IN FLUENT, NATURAL TURKISH using professional F1 motorsport terminology (Örn: "Telsiz anlaşıldı", "Sıralama turlarında lastik karkas rijitliği için basınçları yüksek tutmalıyız", "Arka ARB 1-2 metası", "Kafadan kayma", "Apexe oturma").' : 'RESPOND IN FLUENT, PROFESSIONAL ENGLISH with genuine racing engineer vocabulary.'}
5. At the very end of your reply, provide a short JSON block labeled \`\`\`json:adjustments\`\`\` containing an array of suggested parameter adjustments so the driver can inspect or apply them with one click:
\`\`\`json:adjustments
[
  {
    "category": "Aero" | "Transmission" | "Geometry" | "Suspension" | "Brakes" | "Tyres",
    "parameter": "Parameter Name",
    "currentValue": number or string,
    "recommendedValue": number or string,
    "changeDelta": "-2 clicks",
    "adjustment": "Short action",
    "impact": "Physical outcome"
  }
]
\`\`\`
`;

        // Format conversation history for Gemini
        const contents = messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content || m.text || '' }],
        }));

        if (!contents.length || contents[contents.length - 1].role !== 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: effectiveQuery }],
          });
        }

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const rawText = geminiRes.text || '';

        // Extract json:adjustments if present
        let parsedAdjustments: SetupAdjustment[] = [];
        let cleanText = rawText;

        const jsonMatch = rawText.match(/```json:adjustments\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            parsedAdjustments = JSON.parse(jsonMatch[1]);
            cleanText = rawText.replace(/```json:adjustments\s*[\s\S]*?\s*```/, '').trim();
          } catch (e) {
            console.warn('Could not parse Gemini adjustments JSON, using regex fallback', e);
          }
        }

        // If no adjustments extracted from JSON, run diagnostic engine to populate suggestions
        if (!parsedAdjustments || parsedAdjustments.length === 0) {
          const fallbackDiag = diagnoseHandlingIssueWithSetup(effectiveQuery, updatedSetup, trackId, language as any);
          parsedAdjustments = fallbackDiag.adjustments;
        }

        return res.json({
          success: true,
          source: 'gemini',
          reply: cleanText,
          adjustments: parsedAdjustments,
          parsedSetup: updatedSetup,
          telemetryTip: isTr
            ? 'Viraj apexi ve gaza ilk oturduğunuz noktadaki telemetri verilerinize göre turları karşılaştırın.'
            : 'Compare your apex minimum speed and initial throttle application against delta telemetry.',
        });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed or timed out, seamlessly falling back to dynamic telemetry engine:', geminiErr.message);
      }
    }

    // 3. Fallback: Dynamic & Contextual Telemetry Physics Engine
    // Even without an API key, provide a conversational, natural AI response that parses user text and car numbers
    const diagnosis = diagnoseHandlingIssueWithSetup(effectiveQuery, updatedSetup, trackId, language as any);

    // Build natural conversational response tailored to driver's message
    const conversationalReply = isTr
      ? `📻 **Pit Wall Telsizi — Telemetri Raporu Alındı:**\n\n` +
        `"Telsiz anlaşıldı sürücüm. **${trackName}** pistindeki telemetri verilerinizi ve bildirdiğiniz *'${effectiveQuery}'* sorununu analiz ettik.\n\n` +
        `🔍 **Mühendislik Değerlendirmesi & 6-Kategori Telemetri Dengesi:**\n` +
        `• **Aerodinamik:** ${updatedSetup.frontWing}/${updatedSetup.rearWing} Kanat\n` +
        `• **Şanzıman:** %${updatedSetup.diffOnThrottle} On-Throttle / %${updatedSetup.diffOffThrottle} Off-Throttle\n` +
        `• **Geometri:** ${updatedSetup.frontCamber}° / ${updatedSetup.rearCamber}° Kamber | ${updatedSetup.frontToe}° / ${updatedSetup.rearToe}° Toe\n` +
        `• **Süspansiyon:** ${updatedSetup.frontSuspension}/${updatedSetup.rearSuspension} Yay | ${updatedSetup.frontARB}/${updatedSetup.rearARB} ARB | ${updatedSetup.frontRideHeight}/${updatedSetup.rearRideHeight} Taban\n` +
        `• **Fren Sistemi:** %${updatedSetup.brakePressure} Basınç | %${updatedSetup.brakeBias} Ön Denge\n` +
        `• **Lastikler:** Ön Sol ${updatedSetup.flTyrePressure} / Ön Sağ ${updatedSetup.frTyrePressure} | Arka Sol ${updatedSetup.rlTyrePressure} / Arka Sağ ${updatedSetup.rrTyrePressure} PSI\n\n` +
        `${diagnosis.problemAnalysis}\n\n` +
        `🎯 **Önerilen Hassas Tık / Sayı Değişimleri:**\n` +
        diagnosis.adjustments
          .map(
            (a) =>
              `• **[${a.category}] ${a.parameter}:** ${a.currentValue} ➔ **${a.recommendedValue}** (${a.changeDelta})\n  _${a.adjustment} — ${a.impact}_`
          )
          .join('\n\n') +
        `\n\n💡 **Yarış Mühendisi Sürüş Notu:** ${diagnosis.telemetryTip}\n\n` +
        `Değerleri test etmek için sağdaki veya aşağıdaki butondan aracınıza hemen uygulayabilir ya da başka bir viraj hissini telsizden iletebilirsiniz.`
      : `📻 **Pit Wall Intercom — Telemetry Received:**\n\n` +
        `"Copy that driver. We analyzed your live telemetry across **${trackName}** together with your feedback: *'${effectiveQuery}'*.\n\n` +
        `🔍 **Mechanical & Aero Diagnosis (All 6 Categories):**\n` +
        `• **Aerodynamics:** Front Wing ${updatedSetup.frontWing} / Rear Wing ${updatedSetup.rearWing}\n` +
        `• **Transmission:** On-Throttle Diff ${updatedSetup.diffOnThrottle}% / Off-Throttle Diff ${updatedSetup.diffOffThrottle}%\n` +
        `• **Geometry:** Camber ${updatedSetup.frontCamber}° / ${updatedSetup.rearCamber}° | Toe ${updatedSetup.frontToe}° / ${updatedSetup.rearToe}°\n` +
        `• **Suspension:** Springs F${updatedSetup.frontSuspension} / R${updatedSetup.rearSuspension} | ARBs F${updatedSetup.frontARB} / R${updatedSetup.rearARB} | Ride Height F${updatedSetup.frontRideHeight} / R${updatedSetup.rearRideHeight}\n` +
        `• **Brakes:** Pressure ${updatedSetup.brakePressure}% | Bias ${updatedSetup.brakeBias}%\n` +
        `• **Tyres:** FL ${updatedSetup.flTyrePressure} / FR ${updatedSetup.frTyrePressure} | RL ${updatedSetup.rlTyrePressure} / RR ${updatedSetup.rrTyrePressure} PSI\n\n` +
        `${diagnosis.problemAnalysis}\n\n` +
        `🎯 **Recommended Click-by-Click Adjustments:**\n` +
        diagnosis.adjustments
          .map(
            (a) =>
              `• **[${a.category}] ${a.parameter}:** ${a.currentValue} ➔ **${a.recommendedValue}** (${a.changeDelta})\n  _${a.adjustment} — ${a.impact}_`
          )
          .join('\n\n') +
        `\n\n💡 **Race Engineer Track Tip:** ${diagnosis.telemetryTip}\n\n` +
        `Apply these adjustments directly to your active car baseline or let me know if you feel another handling imbalance in Sector 2 or 3."`;

    return res.json({
      success: true,
      source: 'telemetry_engine',
      reply: conversationalReply,
      adjustments: diagnosis.adjustments,
      parsedSetup: updatedSetup,
      telemetryTip: diagnosis.telemetryTip,
    });
  } catch (err: any) {
    console.error('Error in handleEngineerChat:', err);
    res.status(500).json({ success: false, error: err.message || 'Engineer chat failed' });
  }
}
