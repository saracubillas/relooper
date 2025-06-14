from pydub import AudioSegment
import madmom
import os

def save_uploaded_file(file, destination):
    with open(destination, "wb") as buffer:
        buffer.write(file)

def convert_to_wav(input_path):
    audio = AudioSegment.from_file(input_path)
    wav_path = input_path.rsplit('.', 1)[0] + '.wav'
    audio.export(wav_path, format="wav")
    return wav_path

def detect_chords(wav_path):
    proc = madmom.features.chords.CNNChordFeatureProcessor()
    decoder = madmom.features.chords.DeepChromaChordRecognitionProcessor()
    chords = decoder(proc(wav_path))
    chords_out = [(float(c[0]), float(c[1]), str(c[2])) for c in chords]
    return chords_out