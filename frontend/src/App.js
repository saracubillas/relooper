import React, { useState } from 'react';
import { uploadFile } from './api';
import Waveform from './components/Waveform';

function App() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [chords, setChords] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const blobUrl = URL.createObjectURL(file);
    setAudioUrl(blobUrl);
    const result = await uploadFile(file);
    setChords(result.chords);
  };

  return (
    <div>
      <h1>Relooper Prototype</h1>
      <input type="file" onChange={handleFile} />
      {audioUrl && <Waveform audioUrl={audioUrl} chords={chords} />}
    </div>
  );
}

export default App;