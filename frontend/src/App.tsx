import React, { useRef, useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import axios from 'axios';
import './App.css';

function App() {
    const waveformRef = useRef<HTMLDivElement>(null);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [chords, setChords] = useState<{ start: number, chord: string }[]>([]);
    const [activeChord, setActiveChord] = useState<string>('');
    const [loop, setLoop] = useState(true);
    const regions = RegionsPlugin.create()
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
            plugins: [regions],
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

        // Give regions a random color when they are created
        const random = (min, max) => Math.random() * (max - min) + min
        const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`

        ws.on('decode', () => {

            // regions.addRegion({
            //     start: 9,
            //     end: 10,
            //     content: 'Cramped region',
            //     color: randomColor(),
            //     minLength: 1,
            //     maxLength: 10,
            // })
        })
        regions.enableDragSelection({
            color: 'rgba(255, 0, 0, 0.1)',
        })

        regions.on('region-updated', (region) => {
            console.log('Updated region', region)
        })
        // State for looping checkbox


// Store active region
        let activeRegion = null;

// Handle region click
        regions.on('region-clicked', (region, e) => {
            e.stopPropagation();
            activeRegion = region;
            region.play(true);
            region.setOptions({ color: randomColor() });
        });

// Handle region entering
        regions.on('region-in', (region) => {
            activeRegion = region;
        });

// Handle region leaving
        regions.on('region-out', (region) => {
            if (activeRegion === region) {
                if (loop) {
                    region.play();
                } else {
                    activeRegion = null;
                }
            }
        });

// Clear active region when interacting with waveform
        ws.on('interaction', () => {
            activeRegion = null;
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
                    <label>
                        <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
                        Loop regions
                    </label>
                </div>
            )}

            <h2>Active Chord: {activeChord}</h2>
        </div>
    );
}

export default App;