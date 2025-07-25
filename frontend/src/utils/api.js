// API client for communicating with the Python Flask backend

const API_BASE_URL = 'http://localhost:5000';

class AutoTuneAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Check if backend is healthy
  async healthCheck() {
    try {
      console.log('🏥 Checking backend health...');
      const response = await fetch(`${this.baseURL}/health`);
      const result = await response.json();
      console.log('🏥 Backend health:', result);
      return result;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', message: 'Backend not available' };
    }
  }

  // Get available presets
  async getPresets() {
    try {
      const response = await fetch(`${this.baseURL}/presets`);
      return await response.json();
    } catch (error) {
      console.error('Failed to get presets:', error);
      return {};
    }
  }

  // Process audio file with effects
  async processAudioFile(audioFile, effects) {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('effects', JSON.stringify(effects));

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      // Return the processed audio as a blob
      return await response.blob();
    } catch (error) {
      console.error('Audio processing failed:', error);
      throw error;
    }
  }

  // Process audio data as base64
  async processAudioBase64(audioBase64, effects) {
    try {
      const url = `${this.baseURL}/process-base64`;
      console.log('📤 Sending to backend:', url);
      console.log('📦 Request payload size:', JSON.stringify({audio_data: audioBase64, effects}).length, 'bytes');
      console.log('🎛️ Effects being sent:', effects);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_data: audioBase64,
          effects: effects,
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Backend returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📥 Backend response received:', Object.keys(result));
      return result;
    } catch (error) {
      console.error('❌ Backend request failed:', error);
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new Error('Network error - backend unreachable');
      }
      throw error;
    }
  }

  // Convert audio blob to base64
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:audio/wav;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convert camelCase to snake_case for backend compatibility
  convertEffectsToBackendFormat(effects) {
    return {
      pitch_shift: effects.pitchShift || 0,
      autotune_strength: effects.autotuneStrength || 50,
      reverb_amount: effects.reverbAmount || 30,
      delay_time: effects.delayTime || 150
    };
  }

  // Convert MediaRecorder recording to processable format
  async processRecording(recordedBlob, effects) {
    try {
      console.log('🎵 Processing recording with effects:', effects);
      console.log('📊 Blob size:', recordedBlob.size, 'bytes');
      
      // Convert effects to backend format
      const backendEffects = this.convertEffectsToBackendFormat(effects);
      console.log('🔄 Backend effects format:', backendEffects);
      
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(recordedBlob);
      console.log('🔄 Converted to base64, length:', base64Audio.length);
      
      // Process with backend
      const result = await this.processAudioBase64(base64Audio, backendEffects);
      console.log('✅ Backend processing complete');
      
      // Convert result back to blob for playback
      const processedAudioData = atob(result.processed_audio);
      const processedBytes = new Uint8Array(processedAudioData.length);
      for (let i = 0; i < processedAudioData.length; i++) {
        processedBytes[i] = processedAudioData.charCodeAt(i);
      }
      
      const processedBlob = new Blob([processedBytes], { type: 'audio/wav' });
      console.log('🎧 Processed audio blob size:', processedBlob.size, 'bytes');
      return processedBlob;
    } catch (error) {
      console.error('❌ Recording processing failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const autoTuneAPI = new AutoTuneAPI();
export default autoTuneAPI;
