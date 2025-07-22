import { useState, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import autoTuneAPI from '../utils/api';

const useAudioProcessor = (effects, setStatus) => {
  const [recorder, setRecorder] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [processedBlob, setProcessedBlob] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const playerRef = useRef(null);

  const initializeAudio = useCallback(async () => {
    try {
      let stream = mediaStream;
      if (!stream || !stream.active) {
        console.log('🎤 Requesting microphone access...');
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100
          } 
        });
        console.log('✅ Microphone access granted');
        setMediaStream(stream);
      }

      if (Tone.context.state === 'suspended') {
        await Tone.start();
        console.log('🎵 Tone.js AudioContext started');
      }

      let mimeType;
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else {
        mimeType = '';
      }
      
      console.log('🎤 Creating MediaRecorder with mimeType:', mimeType);
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      source.connect(analyzer);
      
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let maxAudioLevel = 0;
      for (let i = 0; i < 10; i++) {
        analyzer.getByteFrequencyData(dataArray);
        const audioLevel = Math.max(...dataArray);
        maxAudioLevel = Math.max(maxAudioLevel, audioLevel);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      console.log('🔊 Max audio level detected:', maxAudioLevel);
      if (maxAudioLevel < 5) {
        console.warn('⚠️ Audio level is very low — mic might be muted');
      }

      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        console.log('🎤 Created MediaRecorder with mimeType:', mediaRecorder.mimeType);
      } catch (error) {
        console.error('❌ Failed to create MediaRecorder:', error);
        throw error;
      }

      const chunks = [];
      
      mediaRecorder.onstart = () => {
        console.log('✅ MediaRecorder started successfully at', new Date().toLocaleTimeString());
      };
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 Data chunk received:', event.data.size, 'bytes');
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, total chunks:', chunks.length);
        console.log('📊 Chunk sizes:', chunks.map(chunk => chunk.size));
        
        // Wait a moment for any final chunks
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (chunks.length === 0) {
          console.log('⚠️ No chunks received, requesting final data...');
          // Try to request final data if available
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.requestData();
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        console.log('🎵 Final blob size:', blob.size, 'bytes, type:', blob.type);
        
        if (blob.size === 0) {
          console.error('❌ No audio data captured - blob is empty');
          setStatus('Recording failed - no audio captured. Try recording for longer or check your microphone.');
          return;
        }
        
        // Minimum viable recording check
        if (blob.size < 1000) {
          console.warn('⚠️ Very small recording detected, but proceeding...');
        }
        
        setRecordedBlob(blob);
        setStatus('Recording complete! Click "Play with Effects" to process and hear the result.');
        
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await new Promise((resolve, reject) => {
            Tone.context.decodeAudioData(arrayBuffer, resolve, reject);
          });

          console.log('✅ Audio decoded successfully:', audioBuffer.length, 'frames');
          setAudioBuffer(audioBuffer);
        } catch (error) {
          console.error('Audio decoding failed:', error);
          setStatus('Recording complete! Click "Play with Effects" to process.');
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('🚨 MediaRecorder error:', event.error);
        setStatus('Recording error occurred');
      };
      
      setRecorder(mediaRecorder);
      return mediaRecorder;

    } catch (error) {
      console.error('❌ Error initializing audio:', error);
      throw new Error('Microphone access denied or not available');
    }
  }, [mediaStream, setStatus]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎙️ Starting recording...');
      
      // Check if there's already a recorder that's active
      if (recorder?.state === 'recording') {
        console.log('⚠️ Recorder already recording, stopping first');
        recorder.stop();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // initializeAudio returns the mediaRecorder directly, not wrapped in an object
      const mediaRecorder = await initializeAudio();
      
      if (mediaRecorder.state === 'inactive') {
        console.log('▶️ Starting MediaRecorder');
        // Start with a timeslice to ensure data is captured regularly
        mediaRecorder.start(100); // Request data every 100ms
        setStatus('Recording started... Speak into your microphone!');
        
        // Set a minimum recording duration
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            console.log('📊 Recording has been active for 1 second');
          }
        }, 1000);
      } else {
        throw new Error(`MediaRecorder is not ready to start recording (state: ${mediaRecorder.state})`);
      }
      
      return mediaRecorder;
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setStatus('Error starting recording: ' + error.message);
      throw error;
    }
  }, [recorder, initializeAudio, setStatus]);

  const stopRecording = useCallback(() => {
    try {
      console.log('⏹️ stopRecording called...');
      if (recorder?.state === 'recording') {
        console.log('📀 MediaRecorder state before stop:', recorder.state);
        
        // Request any remaining data before stopping
        recorder.requestData();
        
        // Small delay to ensure data is captured
        setTimeout(() => {
          if (recorder?.state === 'recording') {
            recorder.stop();
            setStatus('Stopping recording...');
          }
        }, 100);
      } else {
        console.log('⚠️ No active recording to stop (state:', recorder?.state || 'no recorder', ')');
        setStatus('No active recording to stop');
      }
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      setStatus('Error stopping recording');
    }
  }, [recorder, setStatus]);

  const playWithEffects = useCallback(async () => {
    try {
      setStatus('Processing and playing audio...');
      
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
      }

      if (recordedBlob) {
        try {
          setIsProcessing(true);
          
          // Mock backend processing
          const processedBlob = await autoTuneAPI.processRecording(recordedBlob, effects);
          setProcessedBlob(processedBlob);
          
          const arrayBuffer = await processedBlob.arrayBuffer();
          const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
          
          const player = new Tone.Player(audioBuffer).toDestination();
          playerRef.current = player;
          
          player.start();
          setStatus('Playing processed audio...');
          
          player.onstop = () => {
            setStatus('Playback complete - Download available!');
          };
          
        } catch (error) {
          console.error('Processing failed:', error);
          setStatus('Playing original recording...');
          
          if (audioBuffer) {
            const player = new Tone.Player(audioBuffer).toDestination();
            playerRef.current = player;
            player.start();
            
            player.onstop = () => {
              setStatus('Original recording playback complete');
            };
          }
        } finally {
          setIsProcessing(false);
        }
      } else {
        setStatus('No recording available to play');
      }
      
    } catch (error) {
      console.error('Playback error:', error);
      setStatus('Error playing audio: ' + error.message);
      setIsProcessing(false);
    }
  }, [recordedBlob, audioBuffer, effects, setStatus]);

  const downloadRecording = useCallback(() => {
    try {
      const blobToDownload = processedBlob || recordedBlob;
      
      if (!blobToDownload) {
        setStatus('No recording to download');
        return;
      }

      const url = URL.createObjectURL(blobToDownload);
      const a = document.createElement('a');
      a.href = url;
      a.download = processedBlob ? 
        'autotuned-recording.wav' : 
        'original-recording.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('Download started!');
    } catch (error) {
      setStatus('Error downloading: ' + error.message);
    }
  }, [recordedBlob, processedBlob, setStatus]);

  return {
    startRecording,
    stopRecording,
    playWithEffects,
    downloadRecording,
    recorder,
    audioBuffer,
    isProcessing,
    hasRecording: !!recordedBlob,
    hasProcessedAudio: !!processedBlob
  };
};

export { useAudioProcessor };