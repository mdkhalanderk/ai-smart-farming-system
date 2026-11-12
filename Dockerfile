# Production Dockerfile for Krishi Drishti AI Backend (ONNX Runtime INT8 - Ultra-Low RAM < 512MB)
FROM python:3.10-slim AS backend

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_DATA_DIR=/app/storage \
    LOW_MEMORY_MODE=true \
    MALLOC_ARENA_MAX=2 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    PORT=8000

# Install minimal system dependencies for OpenCV headless & healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight ONNX Runtime + remaining dependencies (NO PyTorch/CUDA needed!)
COPY requirements.txt /app/
RUN grep -viE "^(torch|torchvision)" requirements.txt > requirements.nocuda.txt && \
    pip install --no-cache-dir onnxruntime && \
    pip install --no-cache-dir -r requirements.nocuda.txt && \
    rm -f requirements.nocuda.txt

# Copy backend code, lightweight ONNX & Yield models, evaluation reports, and yield data
COPY backend /app/backend
COPY model/vmamba_int8.onnx /app/model/vmamba_int8.onnx
COPY model/multicrop_classes.json /app/model/multicrop_classes.json
COPY model/yield_model.joblib /app/model/yield_model.joblib
COPY model/yield_metadata.json /app/model/yield_metadata.json
COPY reports /app/reports
COPY data/crop_yield_data.csv /app/data/crop_yield_data.csv
COPY data/community_reports.json /app/data/community_reports.json

# Copy Mandi price Random Forest model and lightweight 398KB Karnataka recent dataset
COPY ["market price 1-20261002T015252Z-1-001/market price 1/models", "/app/market price 1-20261002T015252Z-1-001/market price 1/models"]
COPY ["market price 1-20261002T015252Z-1-001/market price 1/data/historical/karnataka_recent.csv", "/app/market price 1-20261002T015252Z-1-001/market price 1/data/historical/karnataka_recent.csv"]

# Create storage directory for SQLite DB & uploaded photos
RUN mkdir -p /app/storage/uploads/alert-photos /app/storage/uploads/chat-photos && \
    chmod -R 777 /app/storage

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

CMD ["sh", "-c", "uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
