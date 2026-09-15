# Build context is the repo root (see docker-compose.yml), because this
# service imports the trained model from ../ml at runtime.
FROM python:3.11-slim
WORKDIR /app
COPY clinical-engine/requirements.txt ./clinical-engine/requirements.txt
RUN pip install --no-cache-dir -r clinical-engine/requirements.txt
COPY clinical-engine/ ./clinical-engine/
COPY ml/ ./ml/
WORKDIR /app/clinical-engine
EXPOSE 8010
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8010"]
