"""
Generate synthetic training data for the RandomForest advisory classifier.
Uses FAO-56 rules + noise to create ~10,000 labelled rows.
Fixed seed for reproducibility.
"""
import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)

KC = {"germination": 0.40, "tillering": 0.75, "grand_growth": 1.25, "maturity": 0.75}
STAGES = list(KC.keys())
N = 10_000

def label(soil_pct, rain3d, et0, kc, temp_max):
    etc = et0 * kc
    eff_rain = 0.8 * rain3d
    soil_contrib = (soil_pct / 100) * 20
    water_need = etc - eff_rain - soil_contrib
    # RF boundary thresholds
    if water_need > 15 and soil_pct < 35: return "irrigate"
    if water_need > 8  and rain3d < 3:    return "irrigate"
    if water_need > 0  and rain3d >= 5:   return "delay"
    if water_need <= 0 or soil_pct >= 65: return "skip"
    if water_need > 5:                    return "irrigate"
    return "delay"

stage_idx = RNG.integers(0, 4, N)
stages = [STAGES[i] for i in stage_idx]
kcs    = np.array([KC[s] for s in stages])

soil_pct = RNG.uniform(5, 95, N)
rain3d   = RNG.exponential(8, N).clip(0, 80)
et0      = RNG.uniform(2, 10, N)
temp_max = RNG.uniform(20, 45, N)
# Add noise
soil_pct += RNG.normal(0, 2, N).clip(-5, 5)
soil_pct  = soil_pct.clip(0, 100)

labels = [label(soil_pct[i], rain3d[i], et0[i], kcs[i], temp_max[i]) for i in range(N)]

water_need = et0 * kcs - 0.8 * rain3d - (soil_pct / 100) * 20

df = pd.DataFrame({
    "soil_moisture_pct": soil_pct.round(2),
    "rain_3d_mm":        rain3d.round(2),
    "et0_mm":            et0.round(2),
    "water_need_mm":     water_need.round(2),
    "kc":                kcs.round(2),
    "temp_max_c":        temp_max.round(2),
    "decision":          labels,
})

out = Path(__file__).parent / "train_data.csv"
df.to_csv(out, index=False)
print(f"Generated {N} rows -> {out}")
print(df["decision"].value_counts())
