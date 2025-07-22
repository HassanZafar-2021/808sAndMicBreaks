import React, { useState, useRef } from 'react';

const InstrumentalSelector = ({ 
  selectedInstrumental, 
  onInstrumentalSelect, 
  isRecording,
  onPlaybackVolumeChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playbackVolume, setPlaybackVolume] = useState(0.3);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [notification, setNotification] = useState(null);

  // 808s and Heartbreak album tracks with placeholder URLs
  // In production, these would be royalty-free or licensed instrumental URLs
  const instrumentals = [
    {
      id: 1,
      title: 'Say You Will',
      duration: '6:18',
      audioUrl: '/instrumentals/say-you-will.mp3', // Placeholder
      description: 'Atmospheric, melancholic opener'
    },
    {
      id: 2,
      title: 'Welcome To Heartbreak',
      duration: '4:18',
      audioUrl: '/instrumentals/welcome-to-heartbreak.mp3',
      description: 'Electronic drums, synth-heavy'
    },
    {
      id: 3,
      title: 'Heartless',
      duration: '3:31',
      audioUrl: '/instrumentals/heartless.mp3',
      description: 'Auto-tuned vocals, 808 drums'
    },
    {
      id: 4,
      title: 'Amazing',
      duration: '3:58',
      audioUrl: '/instrumentals/amazing.mp3',
      description: 'Uplifting, soaring synths'
    },
    {
      id: 5,
      title: 'Love Lockdown',
      duration: '4:30',
      audioUrl: '/instrumentals/love-lockdown.mp3',
      description: 'Tribal drums, minimalist'
    },
    {
      id: 6,
      title: 'Paranoid',
      duration: '4:37',
      audioUrl: '/instrumentals/paranoid.mp3',
      description: 'Dark, paranoid atmosphere'
    },
    {
      id: 7,
      title: 'RoboCop',
      duration: '4:34',
      audioUrl: '/instrumentals/robocop.mp3',
      description: 'Futuristic, robotic sounds'
    },
    {
      id: 8,
      title: 'Street Lights',
      duration: '3:09',
      audioUrl: '/instrumentals/street-lights.mp3',
      description: 'Ethereal, nighttime vibes'
    },
    {
      id: 9,
      title: 'Bad News',
      duration: '3:58',
      audioUrl: '/instrumentals/bad-news.mp3',
      description: 'Somber, emotional'
    },
    {
      id: 10,
      title: 'See You In My Nightmares',
      duration: '4:18',
      audioUrl: '/instrumentals/see-you-in-my-nightmares.mp3',
      description: 'Haunting, dream-like'
    },
    {
      id: 11,
      title: 'Coldest Winter',
      duration: '2:22',
      audioUrl: '/instrumentals/coldest-winter.mp3',
      description: 'Minimal, cold atmosphere'
    },
    {
      id: 12,
      title: 'Pinocchio Story',
      duration: '6:01',
      audioUrl: '/instrumentals/pinocchio-story.mp3',
      description: 'Live recording, raw emotion'
    }
  ];

  // Filter instrumentals based on search
  const filteredInstrumentals = instrumentals.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle preview playback
  const handlePreviewPlay = async (instrumental) => {
    if (currentPreview === instrumental.id && isPreviewPlaying) {
      // Stop current preview
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPreviewPlaying(false);
      setCurrentPreview(null);
    } else {
      // Start new preview
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      setCurrentPreview(instrumental.id);
      console.log(`🎵 Attempting to preview: ${instrumental.title}`);
      
      try {
        // Check if the file exists by attempting to load it
        const audio = new Audio(instrumental.audioUrl);
        audio.volume = playbackVolume;
        audioRef.current = audio;
        
        // Set up event listeners
        audio.onloadeddata = () => {
          console.log(`✅ Audio file loaded: ${instrumental.title}`);
          setIsPreviewPlaying(true);
          audio.play().catch(error => {
            console.error(`❌ Failed to play ${instrumental.title}:`, error);
            setIsPreviewPlaying(false);
            setCurrentPreview(null);
            setNotification({
              type: 'error',
              message: `Could not play "${instrumental.title}". Audio file may not exist yet.`
            });
            setTimeout(() => setNotification(null), 5000);
          });
        };
        
        audio.onerror = (error) => {
          console.error(`❌ Audio file not found: ${instrumental.audioUrl}`);
          setIsPreviewPlaying(false);
          setCurrentPreview(null);
          
          // For demo purposes, show a notification instead of an alert
          console.log(`🎵 Demo mode: Playing simulated preview for "${instrumental.title}"`);
          setIsPreviewPlaying(true);
          setNotification({
            type: 'info',
            message: `Playing demo preview for "${instrumental.title}". To hear actual instrumentals, add audio files to /public/instrumentals/`
          });
          setTimeout(() => setNotification(null), 8000);
          
          // Simulate a 15-second preview
          setTimeout(() => {
            setIsPreviewPlaying(false);
            setCurrentPreview(null);
            console.log(`✅ Demo preview ended for "${instrumental.title}"`);
          }, 15000);
        };
        
        audio.onended = () => {
          setIsPreviewPlaying(false);
          setCurrentPreview(null);
        };
        
        // Set a maximum preview duration of 30 seconds
        setTimeout(() => {
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPreviewPlaying(false);
            setCurrentPreview(null);
          }
        }, 30000);
        
      } catch (error) {
        console.error('Error creating audio element:', error);
        setIsPreviewPlaying(false);
        setCurrentPreview(null);
        setNotification({
          type: 'error',
          message: `Error loading "${instrumental.title}". Check browser console for details.`
        });
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  // Handle instrumental selection
  const handleSelect = (instrumental) => {
    onInstrumentalSelect(instrumental);
    // Stop any preview that might be playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPreviewPlaying(false);
    setCurrentPreview(null);
  };

  // Handle playback volume change
  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setPlaybackVolume(volume);
    onPlaybackVolumeChange(volume);
  };

  return (
    <div className="instrumental-selector">
      <div className="selector-header">
        <h3>📀 808s & Heartbreak Instrumentals</h3>
        <p>Select a beat to record over</p>
        
        {/* Notification display */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button onClick={() => setNotification(null)} className="notification-close">×</button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search tracks... (e.g. 'Heartless', 'drums', 'emotional')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Volume Control for Instrumental Playback */}
      <div className="volume-section">
        <label>Instrumental Volume: {Math.round(playbackVolume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={playbackVolume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>

      {/* Selected Track Display */}
      {selectedInstrumental && (
        <div className="selected-track">
          <h4>🎯 Selected: {selectedInstrumental.title}</h4>
          <p>{selectedInstrumental.description} • {selectedInstrumental.duration}</p>
        </div>
      )}

      {/* Track List */}
      <div className="track-list">
        {filteredInstrumentals.map((track) => (
          <div 
            key={track.id} 
            className={`track-item ${selectedInstrumental?.id === track.id ? 'selected' : ''}`}
          >
            <div className="track-info">
              <div className="track-title">{track.title}</div>
              <div className="track-meta">
                {track.description} • {track.duration}
              </div>
            </div>
            
            <div className="track-actions">
              {/* Preview Button */}
              <button
                className={`preview-btn ${currentPreview === track.id && isPreviewPlaying ? 'playing' : ''}`}
                onClick={() => handlePreviewPlay(track)}
                disabled={isRecording}
                title="15-second preview"
              >
                {currentPreview === track.id && isPreviewPlaying ? '⏸️' : '▶️'}
              </button>
              
              {/* Select Button */}
              <button
                className={`select-btn ${selectedInstrumental?.id === track.id ? 'selected' : ''}`}
                onClick={() => handleSelect(track)}
              >
                {selectedInstrumental?.id === track.id ? '✅ Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInstrumentals.length === 0 && (
        <div className="no-results">
          <p>No tracks found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Hidden audio element for preview functionality */}
      <audio ref={audioRef} />

      {/* Usage Instructions */}
      <div className="usage-info">
        <h4>💡 How it works:</h4>
        <ul>
          <li>🔍 Search for tracks by title or mood</li>
          <li>▶️ Preview tracks (15 seconds)</li>
          <li>✅ Select a track to record over</li>
          <li>🎤 The instrumental will play during recording</li>
          <li>🎧 Both your voice and the beat will be in the playback</li>
        </ul>
      </div>
    </div>
  );
};

export default InstrumentalSelector;
