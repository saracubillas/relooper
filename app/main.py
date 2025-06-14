from fastapi import FastAPI, UploadFile
import os
from . import config, processing

app = FastAPI(title="reLooper.ai API")

@app.post("/upload/")
async def upload(file: UploadFile):
    filepath = os.path.join(config.UPLOAD_FOLDER, file.filename)
    file_content = await file.read()
    processing.save_uploaded_file(file_content, filepath)

    wav_path = processing.convert_to_wav(filepath)
    chords = processing.detect_chords(wav_path)

    return {"chords": chords}