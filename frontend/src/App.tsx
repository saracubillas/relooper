import React, { useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import axios from 'axios';
import './App.css';

function App() {
    const waveformRef = useRef<HTMLDivElement>(null);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [chords, setChords] = useState<{ start: number, chord: string }[]>([]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Upload to backend
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('http://localhost:8000/upload/', formData);
        setChords(res.data.chords);

        // Draw waveform
        if (wavesurfer) wavesurfer.destroy();
        const ws = WaveSurfer.create({
            container: waveformRef.current!,
            waveColor: '#97c0f7',
            progressColor: '#3b82f6',
        });
        ws.load(URL.createObjectURL(file));
        setWavesurfer(ws);
    };

    return (
        <div className="App">
            <h1>reLooper.ai 🎵</h1>
            <input type="file" onChange={handleFileChange} />
            <div ref={waveformRef} style={{ width: '100%', height: '200px', marginTop: '20px' }}></div>

            <h2>Detected Chords:</h2>
            <ul>
                {chords.map((chord, idx) => (
                    <li key={idx}>{chord.start}s: {chord.chord}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;