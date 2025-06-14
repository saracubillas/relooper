import numpy as np
from collections import Counter

# Simple rule-based chord estimator from notes

# Map MIDI pitch to note name
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def midi_to_note(midi_num):
    return NOTE_NAMES[int(midi_num) % 12]

def estimate_chords(notes):
    chords = []
    window_size = 1.0  # 1 second windows
    if len(notes) == 0:
        return chords

    max_time = np.max(notes[:, 1])
    for t in np.arange(0, max_time, window_size):
        window_notes = notes[(notes[:, 0] >= t) & (notes[:, 0] < t+window_size)]
        if len(window_notes) == 0:
            continue

        note_names = [midi_to_note(n[2]) for n in window_notes]
        most_common = Counter(note_names).most_common(3)
        chord_label = "+".join([n for n, _ in most_common])
        chords.append({"start": float(t), "chord": chord_label})
    return chords