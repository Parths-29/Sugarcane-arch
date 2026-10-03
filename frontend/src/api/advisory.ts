import { api } from './client';

export type GrowthStage = 'germination' | 'tillering' | 'grand_growth' | 'maturity';
export type Language = 'en' | 'kn' | 'hi' | 'mr' | 'ta' | 'te';
export type Decision = 'irrigate' | 'delay' | 'skip';

export interface ExplanationFeature {
  feature: string;
  contribution: number;
}

export interface WeatherData {
  rain3dMm: number;
  tempMaxC: number;
  et0Mm: number;
}

export interface AdvisoryResponse {
  decision: Decision;
  irrigationMm: number;
  explanation: string;
  explanationFeatures: ExplanationFeature[];
  weather: WeatherData;
  staleWeather: boolean;
  language: Language;
  latencyMs: number;
}

export interface AdvisoryRequest {
  growthStage: GrowthStage;
  soilMoisturePct: number;
  village: string;
  language: Language;
}

export async function getAdvisory(req: AdvisoryRequest): Promise<AdvisoryResponse> {
  return api.post<AdvisoryResponse>('/api/advisory', req, true);
}
