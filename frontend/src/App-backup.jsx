import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AudioControls from './components/AudioControls';
import EffectsPanel from './components/EffectsPanel';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import autoTuneAPI from './utils/api';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Click 'Start Recording' to begin");
  const [backendStatus, setBackendStatus] = useState('unknown');
  
  // Audio effect states
  const [effects, setEffects] = useState({
    pitchShift: 0,
    autotuneStrength: 50,
    reverbAmount: 30,
    delayTime: 150
  });

  // Check backend status on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await autoTuneAPI.healthCheck();
        setBackendStatus(health.status === 'healthy' ? 'connected' : 'error');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };
    checkBackend();
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const {
    startRecording,
    stopRecording,
    playWithEffects,
    downloadRecording,
    updateEffect,
    reprocessAudio,
    cleanup,
    isProcessing,
    hasRecording,
    hasProcessedAudio
  } = useAudioProcessor(effects, setStatus);

  const handleStartRecording = async () => {
    try {
      // Force stop any previous recording first
      if (isRecording) {
        stopRecording();
        setIsRecording(false);
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await startRecording();
      setIsRecording(true);
      setStatus('Recording... Speak or sing into your microphone');
    } catch (error) {
      setIsRecording(false);
      setStatus('Error: ' + error.message);
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = () => {
    try {
      stopRecording();
      setIsRecording(false);
      setStatus('Recording complete! Processing with auto-tune...');
    } catch (error) {
      setIsRecording(false);
      setStatus('Error stopping recording: ' + error.message);
    }
  };

  const handlePlayback = async () => {
    try {
      setStatus('Preparing audio playback...');
      await playWithEffects();
    } catch (error) {
      console.error('Playback error:', error);
      setStatus('Playback error: ' + error.message);
    }
  };

  const handleDownload = () => {
    downloadRecording();
    setStatus('Download started!');
  };

  const handleEffectChange = (effectName, value) => {
    setEffects(prev => ({ ...prev, [effectName]: value }));
    updateEffect(effectName, value);
    
    // Auto-reprocess if we have a recording
    if (hasRecording && !isProcessing) {
      setTimeout(() => reprocessAudio(), 500); // Debounce reprocessing
    }
  };

  const applyPreset = (presetName) => {
    let newEffects = {};
    
    switch (presetName) {
      case 'kanye':
        newEffects = {
          pitchShift: 2,
          autotuneStrength: 85,
          reverbAmount: 40,
          delayTime: 120
        };
        break;
      case 'tpain':
        newEffects = {
          pitchShift: 4,
          autotuneStrength: 95,
          reverbAmount: 60,
          delayTime: 200
        };
        break;
      case 'robot':
        newEffects = {
          pitchShift: -8,
          autotuneStrength: 100,
          reverbAmount: 20,
          delayTime: 80
        };
        break;
      case 'clear':
        newEffects = {
          pitchShift: 0,
          autotuneStrength: 0,
          reverbAmount: 0,
          delayTime: 0
        };
        break;
      default:
        return;
    }
    
    setEffects(newEffects);
    Object.entries(newEffects).forEach(([key, value]) => {
      updateEffect(key, value);
    });
    setStatus(`Applied ${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset!`);
    
    // Auto-reprocess if we have a recording
    if (hasRecording && !isProcessing) {
      setTimeout(() => reprocessAudio(), 500);
    }
  };

  return (
    <div className="app">
      <Header />
      
      {/* Backend Status Indicator */}
      <div style={{
        textAlign: 'center', 
        padding: '0.5rem',
        background: backendStatus === 'connected' ? '#28a745' : '#dc3545',
        color: 'white',
        fontSize: '0.9rem'
      }}>
        Backend Status: {backendStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'} 
        {backendStatus !== 'connected' && ' (Start Python server: python app.py)'}
      </div>
      
      <main className="main-content">
        <AudioControls
          isRecording={isRecording}
          hasRecording={hasRecording}
          status={status}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPlayback={handlePlayback}
          onDownload={handleDownload}
        />
        
        <EffectsPanel
          effects={effects}
          onEffectChange={handleEffectChange}
          onPresetApply={applyPreset}
        />
        
        <InfoSection />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
