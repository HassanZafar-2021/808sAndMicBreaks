import React, { useState, useEffect } from 'react';
import Header from './components/Header';
// import AudioControls from './components/AudioControls';
// import EffectsPanel from './components/EffectsPanel';
// import InfoSection from './components/InfoSection';
// import Footer from './components/Footer';
// import { useAudioProcessor } from './hooks/useAudioProcessor';
// import autoTuneAPI from './utils/api';
import './App.css';

function App() {
  const [status, setStatus] = useState("Testing components one by one...");

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>🔧 Component Test Mode</h2>
          <p>{status}</p>
          <p>If you see the header above, the Header component is working!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
