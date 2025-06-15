import numpy as np
from collections import Counter

# Map MIDI pitch to note name
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def midi_to_note(midi_num):
    return NOTE_NAMES[int(midi_num) % 12]

# Build simple chord dictionary with triads and tetrads (cuatriadas)
CHORDS = {
    # Major triads
    (0, 4, 7): "C",
    (2, 6, 9): "D",
    (4, 8, 11): "E",
    (5, 9, 0): "F",
    (7, 11, 2): "G",
    (9, 1, 4): "A",
    (11, 3, 6): "B",

    # Minor triads
    (0, 3, 7): "Cm",
    (2, 5, 9): "Dm",
    (4, 7, 11): "Em",
    (5, 8, 0): "Fm",
    (7, 10, 2): "Gm",
    (9, 0, 4): "Am",
    (11, 2, 6): "Bm",

    # Dominant 7th chords (cuatriadas)
    (0, 4, 7, 10): "C7",
    (2, 6, 9, 1): "D7",
    (4, 8, 11, 3): "E7",
    (5, 9, 0, 4): "F7",
    (7, 11, 2, 5): "G7",
    (9, 1, 4, 6): "A7",
    (11, 3, 6, 8): "B7",

    # Minor 7th chords
    (0, 3, 7, 10): "Cm7",
    (2, 5, 9, 0): "Dm7",
    (4, 7, 11, 2): "Em7",
    (5, 8, 0, 3): "Fm7",
    (7, 10, 2, 4): "Gm7",
    (9, 0, 4, 6): "Am7",
    (11, 2, 6, 8): "Bm7",

    # Major 7th chords
    (0, 4, 7, 11): "Cmaj7",
    (2, 6, 9, 1): "Dmaj7",
    (4, 8, 11, 3): "Emaj7",
    (5, 9, 0, 4): "Fmaj7",
    (7, 11, 2, 6): "Gmaj7",
    (9, 1, 4, 8): "Amaj7",
    (11, 3, 6, 10): "Bmaj7"
}

def estimate_chords(notes):
    chords = []
    window_size = 1.0  # seconds

    if len(notes) == 0:
        return chords

    max_time = np.max(notes[:, 1])
    for t in np.arange(0, max_time, window_size):
        window_notes = notes[(notes[:, 0] >= t) & (notes[:, 0] < t + window_size)]
        if len(window_notes) == 0:
            continue

        pitch_classes = set(int(n[2]) % 12 for n in window_notes)

        best_match = None
        best_score = 0

        for chord_notes, chord_name in CHORDS.items():
            chord_set = set(chord_notes)

            # weighted scoring: root & third more important
            weights = [3 if i == 0 else 2 if i == 1 else 1 for i in range(len(chord_notes))]
            total_weight = sum(weights)

            score = sum(weight for note, weight in zip(chord_notes, weights) if note in pitch_classes)
            score = score / total_weight

            if score > best_score:
                best_score = score
                best_match = chord_name

        # Threshold to allow some missing notes
        if best_score >= 0.5:
            chords.append({"start": float(t), "chord": best_match})
        else:
            chords.append({"start": float(t), "chord": "Unknown"})

    return chords