import { useState, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import autoTuneAPI from '../utils/api';

export const useAudioProcessor = (effects, setStatus) => {
  const [recorder, setRecorder] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [processedBlob, setProcessedBlob] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Audio playback
  const playerRef = useRef(null);

  const initializeAudio = useCallback(async () => {
    try {
      // Start Tone.js context
      await Tone.start();
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 22050
        } 
      });
      
      setMediaStream(stream);
      
      // Create recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setStatus('Recording complete! Processing with auto-tune...');
        
        // Don't automatically process here - let the user trigger it
        // Just prepare the recording for processing
        try {
          // Convert blob to audio buffer for immediate playback option
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
          setAudioBuffer(audioBuffer);
          setStatus('Recording ready! Click "Play with Effects" to process and hear the result.');
        } catch (error) {
          console.error('Error preparing audio:', error);
          setStatus('Recording complete! Click "Play with Effects" to process.');
        }
      };
      
      setRecorder(mediaRecorder);
      return mediaRecorder;
    } catch (error) {
      throw new Error('Microphone access denied or not available');
    }
  }, [effects]);

  const processWithBackend = useCallback(async (blob, currentEffects) => {
    try {
      setIsProcessing(true);
      setStatus('Processing audio with auto-tune effects...');
      
      // Check backend health
      const health = await autoTuneAPI.healthCheck();
      if (health.status !== 'healthy') {
        throw new Error('Backend server not available. Please start the Python server.');
      }
      
      // Process audio with Python backend
      const processedBlob = await autoTuneAPI.processRecording(blob, currentEffects);
      setProcessedBlob(processedBlob);
      
      // Convert to Tone.js buffer for playback
      const arrayBuffer = await processedBlob.arrayBuffer();
      const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
      setAudioBuffer(audioBuffer);
      
      setStatus('Audio processed successfully! Ready to play.');
    } catch (error) {
      console.error('Backend processing error:', error);
      setStatus(`Processing error: ${error.message}`);
      
      // Fallback to client-side processing
      setStatus('Backend unavailable, using client-side processing...');
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
      setAudioBuffer(audioBuffer);
      setStatus('Ready to play (client-side processing)');
    } finally {
      setIsProcessing(false);
    }
  }, [setStatus]);

  const startRecording = useCallback(async () => {
    try {
      const mediaRecorder = recorder || await initializeAudio();
      mediaRecorder.start();
      return mediaRecorder;
    } catch (error) {
      throw error;
    }
  }, [recorder, initializeAudio]);

  const stopRecording = useCallback(() => {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  }, [recorder, mediaStream]);

  const updateEffect = useCallback((effectName, value) => {
    // Effects are now handled by the backend
    // This function is kept for compatibility but actual processing happens in processWithBackend
  }, []);

  const playWithEffects = useCallback(async () => {
    try {
      setStatus('Processing and playing with auto-tune effects...');
      
      // Stop any current playback
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
      }

      // If we have a recorded blob, process it with the backend first
      if (recordedBlob) {
        try {
          setIsProcessing(true);
          
          // Check backend health first
          const health = await autoTuneAPI.healthCheck();
          if (health.status !== 'healthy') {
            throw new Error('Backend server not available');
          }
          
          // Process audio with Python backend
          const processedBlob = await autoTuneAPI.processRecording(recordedBlob, effects);
          setProcessedBlob(processedBlob);
          
          // Play the processed audio
          const arrayBuffer = await processedBlob.arrayBuffer();
          const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
          
          const player = new Tone.Player(audioBuffer).toDestination();
          playerRef.current = player;
          
          player.start();
          setStatus('Playing auto-tuned audio...');
          
          player.onstop = () => {
            setStatus('Playback complete - Download available!');
          };
          
        } catch (backendError) {
          console.error('Backend processing failed:', backendError);
          setStatus('Backend unavailable, playing original recording...');
          
          // Fallback: play original recording
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
      } else if (processedBlob) {
        // Play already processed audio
        const arrayBuffer = await processedBlob.arrayBuffer();
        const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);
        
        const player = new Tone.Player(audioBuffer).toDestination();
        playerRef.current = player;
        
        player.start();
        setStatus('Playing processed audio...');
        
        player.onstop = () => {
          setStatus('Playback complete');
        };
      } else if (audioBuffer) {
        // Fallback to original audio buffer
        const player = new Tone.Player(audioBuffer).toDestination();
        playerRef.current = player;
        
        player.start();
        setStatus('Playing original recording...');
        
        player.onstop = () => {
          setStatus('Playback complete');
        };
      } else {
        setStatus('No recording available to play');
      }
      
    } catch (error) {
      console.error('Playback error:', error);
      setStatus('Error playing audio: ' + error.message);
      setIsProcessing(false);
    }
  }, [recordedBlob, processedBlob, audioBuffer, effects, setStatus]);

  const downloadRecording = useCallback(async () => {
    try {
      const blobToDownload = processedBlob || recordedBlob;
      
      if (!blobToDownload) {
        setStatus('No recording to download');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blobToDownload);
      const a = document.createElement('a');
      a.href = url;
      a.download = processedBlob ? 
        '808s-autotuned-recording.wav' : 
        '808s-original-recording.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('Download started!');
    } catch (error) {
      setStatus('Error downloading: ' + error.message);
    }
  }, [recordedBlob, processedBlob, setStatus]);

  // Reprocess audio when effects change
  const reprocessAudio = useCallback(async () => {
    if (recordedBlob && !isProcessing) {
      await processWithBackend(recordedBlob, effects);
    }
  }, [recordedBlob, effects, isProcessing, processWithBackend]);

  return {
    startRecording,
    stopRecording,
    playWithEffects,
    downloadRecording,
    updateEffect,
    reprocessAudio,
    recorder,
    audioBuffer,
    isProcessing,
    hasRecording: !!recordedBlob,
    hasProcessedAudio: !!processedBlob
  };
};
