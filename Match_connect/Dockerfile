# FastAPI + Sentence-Transformers + FAISS
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/models \
    TRANSFORMERS_CACHE=/app/models \
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

# Create user first, then directories with proper permissions
RUN useradd -m appuser \
    && mkdir -p /app/data /app/models \
    && chown -R appuser:appuser /app

# Pre-download the model to avoid runtime issues
USER appuser
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

VOLUME ["/app/data"]

EXPOSE 8000

ENV HOST=0.0.0.0 PORT=8000

CMD ["sh", "-c", "uvicorn app:app --host ${HOST} --port ${PORT}"]
