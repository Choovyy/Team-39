# FastAPI + Sentence-Transformers + FAISS
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/models \
    TRANSFORMERS_CACHE=/models \
    TORCH_CPU_CAPABILITY=avx2

WORKDIR /app

# System deps for faiss and numpy/scipy
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libopenblas-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Pre-install to leverage wheels when possible
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . /app

# Create mount for data persistence (FAISS index & profiles)
RUN mkdir -p /app/data && useradd -m appuser && chown -R appuser:appuser /app
VOLUME ["/app/data", "/models"]

EXPOSE 8000
USER appuser

ENV HOST=0.0.0.0 PORT=8000

CMD ["sh", "-c", "uvicorn app:app --host ${HOST} --port ${PORT}"]
