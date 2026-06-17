# Use lightweight python base image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (libgomp1 is required for PyTorch OpenMP/CPU operations)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to cache package installations
COPY requirements.txt .

# Install dependencies using CPU-only index for PyTorch to optimize memory and image size
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Pre-download and cache the sentence-transformer model during build phase
# This ensures container starts instantly without needing internet access at runtime
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy the application code
COPY app.py .

# Expose microservice port
ENV PORT=5000
EXPOSE 5000

# Run the Waitress WSGI application server
CMD ["python", "app.py"]
