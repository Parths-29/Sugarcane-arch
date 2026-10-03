import { Counter, Histogram } from 'prom-client';
import { getWeather } from './weather.service';
import { buildExplanation } from './translation.service';
import type { Language, Decision } from './translation.service';

const advisoryTotal = new Counter({
  name: 'advisory_decisions_total',
  help: 'Advisory decisions issued',
  labelNames: ['decision'],
});

const advisoryDuration = new Histogram({
  name: 'advisory_duration_seconds',
  help: 'Time to compute advisory',
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2],
});

export type GrowthStage = 'germination' | 'tillering' | 'grand_growth' | 'maturity';

export interface ExplanationFeature { feature: string; contribution: number; }

export interface AdvisoryInput {
  growthStage: GrowthStage;
  soilMoisturePct: number;
  village: string;
  language: Language;
}

export interface AdvisoryResult {
  decision: Decision;
  irrigationMm: number;
  explanation: string;
  explanationFeatures: ExplanationFeature[];
  weather: { rain3dMm: number; tempMaxC: number; et0Mm: number };
  staleWeather: boolean;
  language: Language;
  latencyMs: number;
}

// FAO-56 Kc coefficients per sugarcane stage
const KC: Record<GrowthStage, number> = {
  germination: 0.40,
  tillering: 0.75,
  grand_growth: 1.25,
  maturity: 0.75,
};

/**
 * RandomForest simulation.
 * We use a deterministic rule-based function that closely mirrors what the
 * trained sklearn RandomForestClassifier produces on the synthetic dataset.
 * The actual model.pkl is used by the Python advisory microservice.
 */
function rfClassify(waterNeedMm: number, soilMoisturePct: number, rain3dMm: number): Decision {
  // Mirror the trained RF boundary thresholds
  if (waterNeedMm > 15 && soilMoisturePct < 35) return 'irrigate';
  if (waterNeedMm > 8 && rain3dMm < 3) return 'irrigate';
  if (waterNeedMm > 0 && rain3dMm >= 5) return 'delay';
  if (waterNeedMm <= 0 || soilMoisturePct >= 65) return 'skip';
  if (waterNeedMm > 5) return 'irrigate';
  return 'delay';
}

/** Top-3 SHAP-like feature contributions (deterministic approximation) */
function computeFeatures(
  waterNeedMm: number, soilMoisturePct: number, rain3dMm: number, et0Mm: number, kc: number
): ExplanationFeature[] {
  const smContrib = (50 - soilMoisturePct) / 100;   // high = contributes toward irrigate
  const rainContrib = -(rain3dMm / 20);              // rain reduces irrigation need
  const et0Contrib = (et0Mm * kc) / 20;             // high ET0 increases need
  const needContrib = waterNeedMm / 30;

  const raw: ExplanationFeature[] = [
    { feature: 'soil_moisture_pct', contribution: parseFloat(smContrib.toFixed(4)) },
    { feature: 'rain_3d_mm', contribution: parseFloat(rainContrib.toFixed(4)) },
    { feature: 'et0_mm', contribution: parseFloat(et0Contrib.toFixed(4)) },
    { feature: 'water_need_mm', contribution: parseFloat(needContrib.toFixed(4)) },
  ];
  return raw
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3);
}

export async function computeAdvisory(input: AdvisoryInput): Promise<AdvisoryResult> {
  const t0 = Date.now();
  const end = advisoryDuration.startTimer();

  // Validation
  if (!['germination', 'tillering', 'grand_growth', 'maturity'].includes(input.growthStage)) {
    throw { code: 'INVALID_GROWTH_STAGE', message: 'Growth stage must be one of: germination, tillering, grand_growth, maturity', status: 400 };
  }
  if (input.soilMoisturePct < 0 || input.soilMoisturePct > 100) {
    throw { code: 'INVALID_SOIL_MOISTURE', message: 'Soil moisture must be between 0 and 100', status: 400 };
  }
  if (!['en','kn','hi','mr','ta','te'].includes(input.language)) {
    throw { code: 'INVALID_LANGUAGE', message: 'Language must be one of: en, kn, hi, mr, ta, te', status: 400 };
  }

  const { data: weather, stale: staleWeather } = await getWeather(input.village);
  const { rain3dMm, tempMaxC, et0Mm } = weather;

  const kc = KC[input.growthStage];
  // FAO-56: ETc = ET0 * Kc
  const etcMm = et0Mm * kc;
  // Effective rain = 0.8 * forecast rain
  const effectiveRainMm = 0.8 * rain3dMm;
  // Soil moisture contribution (scaled: 100% moisture = 20mm contribution)
  const soilContrib = (input.soilMoisturePct / 100) * 20;
  // Water need
  const waterNeedMm = etcMm - effectiveRainMm - soilContrib;

  const decision = rfClassify(waterNeedMm, input.soilMoisturePct, rain3dMm);
  const irrigationMm = decision === 'irrigate' ? Math.max(0, Math.round(waterNeedMm * 10) / 10) : 0;
  const explanation = buildExplanation(decision, input.language, input.soilMoisturePct, rain3dMm);
  const explanationFeatures = computeFeatures(waterNeedMm, input.soilMoisturePct, rain3dMm, et0Mm, kc);

  advisoryTotal.inc({ decision });
  end();

  return {
    decision,
    irrigationMm,
    explanation,
    explanationFeatures,
    weather: { rain3dMm, tempMaxC, et0Mm },
    staleWeather,
    language: input.language,
    latencyMs: Date.now() - t0,
  };
}
