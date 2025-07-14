import React, { useRef, useEffect } from 'react';

const AudioControls = ({ 
  isRecording, 
  hasRecording, 
  status, 
  onStartRecording, 
  onStopRecording, 
  onPlayback, 
  onDownload 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Simple visualizer animation
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (isRecording) {
        // Create animated bars for recording state
        const barCount = 20;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.random() * height * 0.8 + 10;
          const x = i * barWidth;
          const y = height - barHeight;
          
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, '#ffd700');
          gradient.addColorStop(1, '#ff6b6b');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
        }
      } else {
        // Static bars when not recording
        const barCount = 20;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const barHeight = 20;
          const x = i * barWidth;
          const y = height - barHeight;
          
          ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRecording]);

  return (
    <div className="audio-controls">
      <div className="record-section">
        <button 
          className={`btn btn-primary ${isRecording ? 'recording' : ''}`}
          onClick={onStartRecording}
          disabled={isRecording}
        >
          <span className="btn-icon">🎤</span>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onStopRecording}
          disabled={!isRecording}
        >
          <span className="btn-icon">⏹️</span>
          Stop Recording
        </button>
      </div>

      <div className="status-section">
        <div className="status">{status}</div>
        <div className="visualizer">
          <canvas 
            ref={canvasRef}
            width="300" 
            height="100"
          />
        </div>
      </div>

      <div className="playback-section">
        <button 
          className="btn btn-success"
          onClick={onPlayback}
          disabled={!hasRecording}
        >
          <span className="btn-icon">▶️</span>
          Play with Effects
        </button>
        <button 
          className="btn btn-info"
          onClick={onDownload}
          disabled={!hasRecording}
        >
          <span className="btn-icon">💾</span>
          Download
        </button>
        {/* Debug button for testing */}
        {hasRecording && (
          <button 
            className="btn" 
            style={{background: '#6c757d', color: 'white', fontSize: '0.8rem'}}
            onClick={() => {
              console.log('🔍 Debug: hasRecording =', hasRecording);
              console.log('🔍 Debug: Audio available for playback');
            }}
          >
            Debug Info
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioControls;
