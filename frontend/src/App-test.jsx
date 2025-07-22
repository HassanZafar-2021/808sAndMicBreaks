import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #cd853f 100%)',
      color: 'white',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
        🎤 808s & Mic Breaks - Test
      </h1>
      <p style={{ fontSize: '1.5rem' }}>
        If you can see this, React is working! 🎵
      </p>
      <button style={{
        background: '#ffd700',
        color: '#000',
        border: 'none',
        padding: '1rem 2rem',
        fontSize: '1.2rem',
        borderRadius: '8px',
        marginTop: '2rem',
        cursor: 'pointer'
      }}>
        Test Button
      </button>
    </div>
  );
}

export default App;
