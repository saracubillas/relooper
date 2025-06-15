import React, { useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

export default function Waveform({ audioUrl, chords }) {
  const waveformRef = useRef();
  const ws = useRef();

  useEffect(() => {
    if (!audioUrl) return;

    ws.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#ddd',
      progressColor: '#2196f3',
      height: 200,
      plugins: [
        RegionsPlugin.create({})
      ]
    });

    ws.current.load(audioUrl);

    return () => ws.current.destroy();
  }, [audioUrl]);

  useEffect(() => {
    if (!ws.current || !chords) return;

    chords.forEach(chord => {
      ws.current.addRegion({
        start: chord.start,
        end: chord.start + 1,
        color: 'rgba(255, 165, 0, 0.3)',
        data: { label: chord.chord }
      });
    });
  }, [chords]);

  return <div ref={waveformRef} />;
}