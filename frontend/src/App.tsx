import React, { useRef, useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import axios from 'axios';
import './App.css';

function App() {
    const waveformRef = useRef<HTMLDivElement>(null);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [chords, setChords] = useState<{ start: number, chord: string }[]>([]);
    const [activeChord, setActiveChord] = useState<string>('');
    const [loop, setLoop] = useState(true);
    const regions = RegionsPlugin.create();
    let activeRegion = null;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!wavesurfer || chords.length === 0) return;

        const audioprocessHandler = () => {
            const currentTime = wavesurfer.getCurrentTime();
            const currentChord = chords.slice().reverse().find(chord => chord.start <= currentTime)?.chord || '';
            setActiveChord(currentChord);
        };

        wavesurfer.on('audioprocess', audioprocessHandler);
        return () => wavesurfer.un('audioprocess', audioprocessHandler);
    }, [wavesurfer, chords]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('http://localhost:8000/upload/', formData);
        setChords(res.data.chords);

        if (wavesurfer) wavesurfer.destroy();
        const ws = WaveSurfer.create({
            container: waveformRef.current!,
            waveColor: '#97c0f7',
            progressColor: '#3b82f6',
            plugins: [regions],
        });

        ws.load(URL.createObjectURL(file));
        setWavesurfer(ws);

        const random = (min, max) => Math.random() * (max - min) + min;
        const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

        regions.enableDragSelection({ color: 'rgba(255, 0, 0, 0.1)' });
        regions.on('region-updated', (region) => console.log('Updated region', region));
        regions.on('region-in', (region) => { activeRegion = region });
        regions.on('region-out', (region) => {
            if (activeRegion === region) {
                if (loop) {
                    region.play();
                } else {
                    activeRegion = null;
                }
            }
        });
        regions.on('region-clicked', (region, e) => {
            e.stopPropagation();
            activeRegion = region;
            region.play(true);
            region.setOptions({ color: randomColor() });
        });
        ws.on('click', (time: number) => {
            ws.seekTo(time);
            ws.play();
            activeRegion = null;
        });
        setIsLoading(false);
    };

    return (
        <div className="App" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center' }}>🎵 reLooper.ai 🎵</h1>
            <input type="file" onChange={handleFileChange} disabled={isLoading} style={{ margin: '10px 0', width: '100%' }} />

            {isLoading && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    🎵 Analyzing song... Please wait...
                </div>
            )}
            <div ref={waveformRef} style={{ width: '100%', height: '200px', marginBottom: '20px' }}></div>

            {wavesurfer && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={() => wavesurfer.play()}>▶️</button>
                    <button onClick={() => wavesurfer.pause()}>⏸️</button>
                    <button onClick={() => wavesurfer.stop()}>⏹️</button>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🔁 <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
                    </label>
                </div>
            )}

            <h2 style={{ textAlign: 'center' }}>Active Chord: {activeChord}</h2>
        </div>
    );
}

export default App;