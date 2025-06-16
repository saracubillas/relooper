from fastapi import FastAPI, UploadFile
import os
from . import config, processing, chords
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="reLooper.ai - AI Powered")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # dev
        "https://looper.relooper.ai", # frontend production
        "https://looper.relooper.ai/"  # frontend production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.middleware("http")
async def log_origin(request, call_next):
    origin = request.headers.get("origin")
    logging.info(f"Origin: {origin}")
    response = await call_next(request)
    return response

@app.post("/upload/")
async def upload(file: UploadFile):
    print("🚀 File received!")
    filepath = os.path.join(config.UPLOAD_FOLDER, file.filename)
    file_content = await file.read()
    processing.save_uploaded_file(file_content, filepath)

    wav_path = processing.convert_to_wav(filepath)
    notes = processing.run_basicpitch(wav_path)
    estimated_chords = chords.estimate_chords(notes)
    print("✅ Successfully processed file")
    return {"chords": estimated_chords}
