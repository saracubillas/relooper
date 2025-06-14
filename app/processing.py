from pydub import AudioSegment
import numpy as np
import os
from basic_pitch.inference import predict

# Save uploaded file

def save_uploaded_file(file, destination):
    with open(destination, "wb") as buffer:
        buffer.write(file)

# Convert any input audio to WAV mono 22050Hz for model compatibility

def convert_to_wav(input_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1)
    audio = audio.set_frame_rate(22050)
    wav_path = input_path.rsplit('.', 1)[0] + '.wav'
    audio.export(wav_path, format="wav")
    return wav_path


def run_basicpitch(wav_path):
    model_output, _, _ = predict(wav_path)
    print("Model output:", model_output)
    notes = model_output['note']
    return notes  # columns: [start_time, end_time, pitch (MIDI), confidence]
