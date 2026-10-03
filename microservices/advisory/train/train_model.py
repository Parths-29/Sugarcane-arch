"""
Train RandomForestClassifier on synthetic data.
Outputs model.pkl and prints metrics.
"""
import sys, pathlib, pickle
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.preprocessing import LabelEncoder

DATA_PATH  = pathlib.Path(__file__).parent / "train_data.csv"
MODEL_PATH = pathlib.Path(__file__).parent.parent / "model.pkl"
DOCS_PATH  = pathlib.Path(__file__).parent.parent.parent.parent / "docs" / "results" / "model_metrics.md"

if not DATA_PATH.exists():
    print("Run generate_data.py first")
    sys.exit(1)

df = pd.read_csv(DATA_PATH)
FEATURES = ["soil_moisture_pct", "rain_3d_mm", "et0_mm", "water_need_mm", "kc", "temp_max_c"]
X = df[FEATURES].values
y = df["decision"].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)
prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")
cm = confusion_matrix(y_test, y_pred, labels=["irrigate", "delay", "skip"])

print(f"Accuracy:  {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall:    {rec:.4f}")
print(f"F1:        {f1:.4f}")
print(f"Confusion matrix:\n{cm}")

with open(MODEL_PATH, "wb") as f:
    pickle.dump(clf, f)
print(f"Model saved to {MODEL_PATH}")

DOCS_PATH.parent.mkdir(parents=True, exist_ok=True)
with open(DOCS_PATH, "w") as f:
    f.write(f"""# Model Metrics

## RandomForestClassifier — Irrigation Advisory

| Metric    | Value   |
|-----------|---------|
| Accuracy  | {acc:.4f} |
| Precision | {prec:.4f} |
| Recall    | {rec:.4f} |
| F1 Score  | {f1:.4f} |

## Confusion Matrix

| Actual \\ Predicted | irrigate | delay | skip |
|---------------------|----------|-------|------|
| irrigate            | {cm[0,0]} | {cm[0,1]} | {cm[0,2]} |
| delay               | {cm[1,0]} | {cm[1,1]} | {cm[1,2]} |
| skip                | {cm[2,0]} | {cm[2,1]} | {cm[2,2]} |

## Features
1. soil_moisture_pct
2. rain_3d_mm  
3. et0_mm
4. water_need_mm (derived: ETc - 0.8*rain - soil_contrib)
5. kc (FAO-56 crop coefficient by growth stage)
6. temp_max_c

## Training Notes
- Dataset: 10,000 synthetic rows (generate_data.py, seed=42)
- Train/Test split: 80/20, stratified
- Model: RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
- Limitation: synthetic data generated from the same FAO-56 rules used at inference; real-world accuracy may differ.
""")
print(f"Metrics written to {DOCS_PATH}")
