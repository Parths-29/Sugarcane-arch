"""
Advisory Microservice - FastAPI
FAO-56 ETc = ET0 * Kc + RandomForestClassifier decision
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from enum import Enum
from typing import List
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import time, os, pickle, pathlib, numpy as np

app = FastAPI(title="Advisory Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

advisory_decisions = Counter("advisory_decisions_total", "Advisory decisions", ["decision"])
advisory_duration  = Histogram("advisory_duration_seconds", "Advisory duration", buckets=[0.01, 0.05, 0.1, 0.5, 1])

class GrowthStage(str, Enum):
    germination = "germination"
    tillering   = "tillering"
    grand_growth= "grand_growth"
    maturity    = "maturity"

KC = { "germination": 0.40, "tillering": 0.75, "grand_growth": 1.25, "maturity": 0.75 }

class WeatherIn(BaseModel):
    rain3dMm: float = 0.0
    tempMaxC: float = 32.0
    et0Mm:    float = 5.0

class AdvisoryRequest(BaseModel):
    growthStage: GrowthStage
    soilMoisturePct: float
    village: str = "Athani"
    language: str = "en"
    weather: WeatherIn

    @field_validator("soilMoisturePct")
    @classmethod
    def check_moisture(cls, v: float) -> float:
        if not 0 <= v <= 100:
            raise ValueError("soilMoisturePct must be 0-100")
        return v

class ExplanationFeature(BaseModel):
    feature: str
    contribution: float

class AdvisoryResponse(BaseModel):
    decision: str
    irrigationMm: float
    explanationFeatures: List[ExplanationFeature]

# Load model
MODEL_PATH = pathlib.Path(__file__).parent.parent / "model.pkl"
_clf = None

def get_model():
    global _clf
    if _clf is None and MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            _clf = pickle.load(f)
    return _clf

def rf_classify_fallback(water_need: float, soil_pct: float, rain3d: float) -> str:
    """Deterministic fallback if model not available"""
    if water_need > 15 and soil_pct < 35: return "irrigate"
    if water_need > 8 and rain3d < 3:     return "irrigate"
    if water_need > 0 and rain3d >= 5:    return "delay"
    if water_need <= 0 or soil_pct >= 65: return "skip"
    if water_need > 5:                     return "irrigate"
    return "delay"

@app.post("/advisory", response_model=AdvisoryResponse)
def compute_advisory(req: AdvisoryRequest):
    t0 = time.time()
    with advisory_duration.time():
        w = req.weather
        kc = KC[req.growthStage.value]
        etc = w.et0Mm * kc
        eff_rain = 0.8 * w.rain3dMm
        soil_contrib = (req.soilMoisturePct / 100) * 20
        water_need = etc - eff_rain - soil_contrib

        features_arr = np.array([[
            req.soilMoisturePct,
            w.rain3dMm,
            w.et0Mm,
            water_need,
            kc,
            w.tempMaxC,
        ]])

        clf = get_model()
        if clf is not None:
            try:
                decision = str(clf.predict(features_arr)[0])
            except Exception:
                decision = rf_classify_fallback(water_need, req.soilMoisturePct, w.rain3dMm)
        else:
            decision = rf_classify_fallback(water_need, req.soilMoisturePct, w.rain3dMm)

        irrigation_mm = max(0.0, round(water_need, 1)) if decision == "irrigate" else 0.0

        # SHAP-like feature contributions
        sm_contrib  = (50 - req.soilMoisturePct) / 100
        rain_contrib= -(w.rain3dMm / 20)
        et0_contrib = (w.et0Mm * kc) / 20
        need_contrib= water_need / 30

        feats = sorted([
            ExplanationFeature(feature="soil_moisture_pct", contribution=round(sm_contrib, 4)),
            ExplanationFeature(feature="rain_3d_mm",        contribution=round(rain_contrib, 4)),
            ExplanationFeature(feature="et0_mm",            contribution=round(et0_contrib, 4)),
            ExplanationFeature(feature="water_need_mm",     contribution=round(need_contrib, 4)),
        ], key=lambda x: abs(x.contribution), reverse=True)[:3]

    advisory_decisions.labels(decision=decision).inc()
    return AdvisoryResponse(decision=decision, irrigationMm=irrigation_mm, explanationFeatures=feats)

@app.get("/health")
def health():
    return {"status": "ok", "service": "advisory", "model_loaded": MODEL_PATH.exists()}

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
