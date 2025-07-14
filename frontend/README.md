# 🎤 808s & Mic Breaks - Frontend

React.js frontend for the auto-tune voice application.

## 🛠️ Tech Stack

- **React.js** - Modern component-based UI
- **Vite** - Fast development server
- **Tone.js** - Web Audio API wrapper
- **CSS3** - Modern styling with animations

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Modern web browser** with microphone access

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── Header.jsx
│   ├── AudioControls.jsx
│   ├── EffectsPanel.jsx
│   ├── InfoSection.jsx
│   └── Footer.jsx
├── hooks/             # Custom React hooks
│   └── useAudioProcessor.js
├── utils/             # Utility functions
│   └── api.js         # Backend API client
├── App.jsx            # Main React component
├── App.css            # Application styles
└── main.jsx           # React entry point
```

## 🔗 Backend Integration

The frontend communicates with the Python Flask backend at:
- **Development**: http://localhost:5000
- **API Endpoints**: See backend documentation

## 🎯 Features

- **🎤 Audio Recording**: Browser-based microphone input
- **🎚️ Real-time Controls**: Adjustable effect parameters
- **📊 Audio Visualization**: Animated recording indicators
- **🤖 Preset Modes**: Kanye, T-Pain, Robot, and Clear presets
- **💾 Download**: Save processed recordings
- **📱 Responsive Design**: Works on desktop and mobile

## 🔧 Configuration

Backend API URL can be configured in `src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```
