import React, { useRef, useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import axios from 'axios';
import './App.css';

function App() {
    const waveformRef = useRef<HTMLDivElement>(null);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [chords, setChords] = useState<{ start: number, chord: string }[]>([]);
    const [activeChord, setActiveChord] = useState<string>('');

    useEffect(() => {
        if (!wavesurfer || chords.length === 0) return;

        const audioprocessHandler = () => {
            const currentTime = wavesurfer.getCurrentTime();
            const currentChord = chords
                .slice().reverse()
                .find(chord => chord.start <= currentTime)?.chord || '';
            setActiveChord(currentChord);
        };

        wavesurfer.on('audioprocess', audioprocessHandler);

        return () => {
            wavesurfer.un('audioprocess', audioprocessHandler);
        };
    }, [wavesurfer, chords]);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('http://localhost:8000/upload/', formData);
        setChords(res.data.chords);

        if (wavesurfer) wavesurfer.destroy();
        const ws = WaveSurfer.create({
            container: waveformRef.current!,
            waveColor: '#97c0f7',
            progressColor: '#3b82f6',
        });
        ws.load(URL.createObjectURL(file));
        setWavesurfer(ws);

        ws.on('audioprocess', () => {
            const currentTime = ws.getCurrentTime();
            const currentChord = chords
                .slice().reverse()
                .find(chord => chord.start <= currentTime)?.chord || '';
            setActiveChord(currentChord);
        });
    };

    return (
        <div className="App">
            <h1>reLooper.ai 🎵</h1>
            <input type="file" onChange={handleFileChange} />
            <div ref={waveformRef} style={{ width: '100%', height: '200px', marginTop: '20px' }}></div>

            {wavesurfer && (
                <div>
                    <button onClick={() => wavesurfer.play()}>Play</button>
                    <button onClick={() => wavesurfer.pause()}>Pause</button>
                    <button onClick={() => wavesurfer.stop()}>Stop</button>
                </div>
            )}

            <h2>Active Chord: {activeChord}</h2>
        </div>
    );
}

export default App;