FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY node_backend/package*.json ./node_backend/
RUN cd node_backend && npm ci

COPY . .

ENV PORT=10000
ENV FASTAPI_URL=http://127.0.0.1:8000

CMD ["bash", "-lc", "if [ -d /var/data ]; then touch /var/data/predictions.db; ln -sf /var/data/predictions.db /app/predictions.db; fi; uvicorn api.api:app --host 127.0.0.1 --port 8000 & cd node_backend; exec node server.js"]
