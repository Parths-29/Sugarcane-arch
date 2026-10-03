FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Train model if pkl missing
COPY train/ ./train/
RUN python train/generate_data.py && python train/train_model.py || true

COPY main.py ./
EXPOSE 8003
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')" || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
