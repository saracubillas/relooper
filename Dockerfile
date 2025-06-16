FROM python:3.10-slim


RUN apt-get update && apt-get install -y ffmpeg build-essential git

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip



RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug", "--proxy-headers", "--access-log", "--use-colors"]