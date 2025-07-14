import React from 'react';

const InfoSection = () => {
  return (
    <div className="info-section">
      <h3>How it works</h3>
      <p>
        This app uses the Web Audio API to process your voice in real-time, applying pitch 
        correction and effects similar to those used in Kanye West's "808s & Heartbreak" album.
      </p>
      
      <div className="features">
        <div className="feature">
          <h4>🎵 Pitch Correction</h4>
          <p>Automatic pitch correction that snaps your voice to musical notes</p>
        </div>
        <div className="feature">
          <h4>🤖 Voice Effects</h4>
          <p>Reverb, delay, and modulation effects for that signature auto-tune sound</p>
        </div>
        <div className="feature">
          <h4>🎚️ Real-time Processing</h4>
          <p>Hear your voice transformed instantly as you speak or sing</p>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
