import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AudioControls from './components/AudioControls';
import EffectsPanel from './components/EffectsPanel';
import InstrumentalSelector from './components/InstrumentalSelector';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import autoTuneAPI from './utils/api';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [status, setStatus] = useState("Click 'Start Recording' to begin");
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [hookError, setHookError] = useState(null);
  const [selectedInstrumental, setSelectedInstrumental] = useState(null);
  const [instrumentalVolume, setInstrumentalVolume] = useState(0.3);
  
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

  // Try to use the audio processor with error handling
  let audioProcessor;
  try {
    audioProcessor = useAudioProcessor(effects, setStatus, selectedInstrumental, instrumentalVolume);
  } catch (error) {
    console.error('useAudioProcessor error:', error);
    setHookError(error.message);
  }

  // If there's a hook error, show a fallback UI
  if (hookError) {
    return (
      <div className="app">
        <Header />
        <div className="main-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>🚨 Audio Hook Error</h2>
            <p>Error in useAudioProcessor: {hookError}</p>
            <p>The UI works, but audio processing failed to initialize.</p>
            <p>This helps us debug the specific issue!</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If no audioProcessor due to error, show safe fallback
  if (!audioProcessor) {
    return (
      <div className="app">
        <Header />
        <div className="main-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>🔧 Safe Mode</h2>
            <p>Audio processor failed to load. Running in safe mode.</p>
            <p>Backend Status: {backendStatus}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    startRecording,
    stopRecording,
    playWithEffects,
    downloadRecording,
    isProcessing,
    hasRecording,
    hasProcessedAudio
  } = audioProcessor;

  const handleStartRecording = async () => {
    try {
      // Force stop any previous recording first
      if (isRecording) {
        stopRecording();
        setIsRecording(false);
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const newRecorder = await startRecording();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setStatus('Recording... Speak or sing into your microphone (minimum 2 seconds)');
      
      // Store recorder reference for stopping
      window.currentRecorder = newRecorder;
    } catch (error) {
      setIsRecording(false);
      setStatus('Error: ' + error.message);
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = () => {
    try {
      // Check minimum recording time (2 seconds)
      const recordingDuration = Date.now() - recordingStartTime;
      if (recordingDuration < 2000) {
        setStatus(`Recording too short (${Math.round(recordingDuration/1000)}s). Please record for at least 2 seconds.`);
        return;
      }
      
      // Use the stored recorder reference if available
      if (window.currentRecorder && window.currentRecorder.state === 'recording') {
        console.log('🛑 Stopping current recorder directly');
        window.currentRecorder.stop();
        window.currentRecorder = null;
      } else {
        // Fallback to hook method
        stopRecording();
      }
      setIsRecording(false);
      setRecordingStartTime(null);
      setStatus('Recording complete! Processing with auto-tune...');
    } catch (error) {
      setIsRecording(false);
      setRecordingStartTime(null);
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

  const handleDownload = async () => {
    try {
      await downloadRecording();
    } catch (error) {
      console.error('Download error:', error);
      setStatus('Download error: ' + error.message);
    }
  };

  const handleEffectChange = (effectName, value) => {
    setEffects(prev => ({
      ...prev,
      [effectName]: value
    }));
    
    // Note: Effects will be applied when audio is next processed
    // The current implementation doesn't support real-time effect updates
  };

  const handlePresetApply = (presetName) => {
    console.log('Applying preset:', presetName);
    
    let presetEffects;
    
    switch (presetName) {
      case 'kanye':
        presetEffects = {
          pitchShift: 0,           // No pitch shift
          autotuneStrength: 85,    // Heavy auto-tune like Kanye's style
          reverbAmount: 40,        // Moderate reverb
          delayTime: 200          // Medium delay
        };
        break;
        
      case 'tpain':
        presetEffects = {
          pitchShift: -2,         // Slight pitch down
          autotuneStrength: 100,   // Maximum auto-tune for T-Pain effect
          reverbAmount: 60,        // More reverb for spacey sound
          delayTime: 150          // Quick delay
        };
        break;
        
      case 'robot':
        presetEffects = {
          pitchShift: -4,         // Lower pitch for robotic feel
          autotuneStrength: 100,   // Maximum auto-tune
          reverbAmount: 20,        // Minimal reverb for crisp robot sound
          delayTime: 100          // Fast delay for stuttering effect
        };
        break;
        
      case 'clear':
        presetEffects = {
          pitchShift: 0,          // No pitch shift
          autotuneStrength: 0,     // No auto-tune
          reverbAmount: 0,         // No reverb
          delayTime: 0            // No delay
        };
        break;
        
      default:
        console.warn('Unknown preset:', presetName);
        return;
    }
    
    // Apply the preset effects
    setEffects(presetEffects);
    setStatus(`Applied ${presetName.toUpperCase()} preset - effects updated!`);
  };

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <div>
          <AudioControls 
            isRecording={isRecording}
            hasRecording={hasRecording}
            status={status}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPlayback={handlePlayback}
            onDownload={handleDownload}
          />
          
          <InstrumentalSelector 
            selectedInstrumental={selectedInstrumental}
            onInstrumentalSelect={setSelectedInstrumental}
            isRecording={isRecording}
            onPlaybackVolumeChange={setInstrumentalVolume}
          />
        </div>
        
        <div>
          <EffectsPanel 
            effects={effects}
            onEffectChange={handleEffectChange}
            onPresetApply={handlePresetApply}
          />
          
          <InfoSection />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
