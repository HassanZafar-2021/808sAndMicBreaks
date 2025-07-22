// Demo instrumental generator using Web Audio API
// This creates simple placeholder beats for testing the instrumental selector

export const generateDemoInstrumental = (title, duration = 30) => {
  return new Promise((resolve, reject) => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const totalSamples = sampleRate * duration;
      
      // Create buffer
      const buffer = audioContext.createBuffer(2, totalSamples, sampleRate);
      
      // Generate different patterns based on song title
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        
        for (let i = 0; i < totalSamples; i++) {
          const time = i / sampleRate;
          let sample = 0;
          
          // Generate beat pattern based on song
          switch (title.toLowerCase()) {
            case 'heartless':
              // Simple 808-style beat
              sample = generateHeartlessBeat(time);
              break;
            case 'love lockdown':
              // Tribal drums pattern
              sample = generateLoveLockdownBeat(time);
              break;
            case 'welcome to heartbreak':
              // Electronic synth pattern
              sample = generateWelcomeToHeartbreakBeat(time);
              break;
            default:
              // Generic 808s-style beat
              sample = generateGenericBeat(time);
          }
          
          channelData[i] = sample * 0.3; // Keep volume reasonable
        }
      }
      
      // Convert buffer to blob
      audioBufferToWav(buffer).then(resolve).catch(reject);
      
    } catch (error) {
      reject(error);
    }
  });
};

// Beat generation functions
function generateHeartlessBeat(time) {
  const bpm = 120;
  const beatTime = (60 / bpm);
  const beatPosition = (time % beatTime) / beatTime;
  
  // 808 kick pattern
  let sample = 0;
  if (beatPosition < 0.1) {
    sample += Math.sin(time * 60 * 2 * Math.PI) * Math.exp(-beatPosition * 50);
  }
  
  // Hi-hats
  if (beatPosition > 0.5 && beatPosition < 0.6) {
    sample += (Math.random() - 0.5) * 0.3 * Math.exp(-(beatPosition - 0.5) * 100);
  }
  
  return sample;
}

function generateLoveLockdownBeat(time) {
  const bpm = 110;
  const beatTime = (60 / bpm);
  const beatPosition = (time % beatTime) / beatTime;
  
  let sample = 0;
  
  // Tribal kick pattern
  if (beatPosition < 0.05 || (beatPosition > 0.25 && beatPosition < 0.3)) {
    sample += Math.sin(time * 80 * 2 * Math.PI) * Math.exp(-beatPosition * 40);
  }
  
  // Atmospheric pad
  sample += Math.sin(time * 220 * 2 * Math.PI) * 0.1 * Math.sin(time * 0.5);
  
  return sample;
}

function generateWelcomeToHeartbreakBeat(time) {
  const bpm = 128;
  const beatTime = (60 / bpm);
  const beatPosition = (time % beatTime) / beatTime;
  
  let sample = 0;
  
  // Electronic kick
  if (beatPosition < 0.1) {
    sample += Math.sin(time * 70 * 2 * Math.PI) * Math.exp(-beatPosition * 30);
  }
  
  // Synth arpeggios
  const arpTime = time * 4; // 4x speed
  sample += Math.sin(arpTime * 440 * 2 * Math.PI) * 0.2 * (Math.sin(time * 2) + 1) / 2;
  
  return sample;
}

function generateGenericBeat(time) {
  const bpm = 115;
  const beatTime = (60 / bpm);
  const beatPosition = (time % beatTime) / beatTime;
  
  let sample = 0;
  
  // Basic 808 pattern
  if (beatPosition < 0.08) {
    sample += Math.sin(time * 65 * 2 * Math.PI) * Math.exp(-beatPosition * 35);
  }
  
  // Snare on 2 and 4
  if ((beatPosition > 0.48 && beatPosition < 0.52) || (beatPosition > 0.98 && beatPosition < 1.02)) {
    sample += (Math.random() - 0.5) * 0.5;
  }
  
  return sample;
}

// Convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer) {
  return new Promise((resolve, reject) => {
    try {
      const length = buffer.length;
      const numberOfChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
      const view = new DataView(arrayBuffer);
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * numberOfChannels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * numberOfChannels * 2, true);
      
      // Convert samples
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample * 0x7FFF, true);
          offset += 2;
        }
      }
      
      resolve(new Blob([arrayBuffer], { type: 'audio/wav' }));
    } catch (error) {
      reject(error);
    }
  });
}
