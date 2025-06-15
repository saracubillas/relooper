from pydub import AudioSegment
import numpy as np
import os
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH


def save_uploaded_file(file, destination):
    with open(destination, "wb") as buffer:
        buffer.write(file)

def convert_to_wav(input_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_channels(1)
    audio = audio.set_frame_rate(22050)
    wav_path = input_path.rsplit('.', 1)[0] + '.wav'
    audio.export(wav_path, format="wav")
    return wav_path


def run_basicpitch(wav_path):
    model_output, midi_data, note_events = predict(wav_path)
    #note_events = (start_time, end_time, midi_note, confidence, activation)

    notes = np.array([(s, e, p, c) for (s, e, p, c, a) in note_events]) # Strip activations

    print(f"Detected {len(notes)} notes before filtering")

    # Apply confidence filter
    notes = notes[notes[:, 3] > 0.6]

    print(f"Detected {len(notes)} notes after filtering")
    print("Notes (start, end, pitch, confidence):")
    print(notes)
    return notes
