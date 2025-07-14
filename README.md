# 🎤 808s & Mic Breaks - Auto-Tune Voice Application

A full-stack web application inspired by Kanye West's "808s & Heartbreak" that transforms your voice with professional auto-tune effects in real-time.

## 📁 Project Structure

```
808sAndMicBreaks/
├── frontend/           # React.js frontend
│   ├── src/           # React components and logic
│   ├── package.json   # Node.js dependencies
│   └── README.md      # Frontend documentation
├── backend/           # Python Flask backend  
│   ├── app.py         # Flask server
│   ├── requirements.txt # Python dependencies
│   └── README.md      # Backend documentation
├── backup/            # Original HTML version
├── start.py           # Full-stack startup script
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) 
- **Python** (3.8 or higher)
- **Modern web browser** with microphone access

### Option 1: Automated Start
```bash
python start.py
```

### Option 2: Manual Start

**Terminal 1 - Start Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend  
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000 (or 3001 if 3000 is in use)
- **Backend API**: http://localhost:5000

## ✨ Features

- **🎵 Real-time Auto-Tune**: Professional pitch correction using Python's librosa
- **🎚️ Multiple Effects**: Pitch shifting, reverb, delay, and auto-tune strength control
- **🤖 Preset Modes**: Kanye, T-Pain, Robot, and Clear presets
- **📊 Audio Visualization**: Real-time recording indicators
- **💾 Download & Export**: Save processed recordings as WAV files
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern component-based UI
- **Vite** - Fast development server
- **Tone.js** - Web Audio API wrapper
- **CSS3** - Modern styling with animations

### Backend
- **Python Flask** - RESTful API server
- **Librosa** - Professional audio analysis and processing
- **NumPy & SciPy** - Numerical computing for audio effects
- **SoundFile** - Audio file I/O

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Modern web browser** with microphone access

### Installation

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Full Stack (Recommended)
```bash
python start.py
```
This starts both the Python backend (port 5000) and React frontend (port 3000).

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 Usage

1. **Grant Microphone Permission**: Allow browser access to your microphone
2. **Start Recording**: Click "Start Recording" and speak/sing
3. **Stop Recording**: Click "Stop Recording" when finished
4. **Adjust Effects**: Use sliders to customize auto-tune settings
5. **Apply Presets**: Try Kanye, T-Pain, or Robot modes
6. **Play & Download**: Listen to your processed voice and download the result

## 🎛️ Effect Controls

- **Pitch Shift**: Adjust pitch up/down in semitones (-12 to +12)
- **Auto-Tune Strength**: Intensity of pitch correction (0-100%)
- **Reverb**: Add spatial depth to your voice (0-100%)
- **Delay Time**: Echo effect timing in milliseconds (0-500ms)

## 🎵 Presets

### Kanye Mode
- Inspired by "808s & Heartbreak"
- Moderate auto-tune with warm reverb
- Settings: Pitch +2, Auto-tune 85%, Reverb 40%, Delay 120ms

### T-Pain Mode
- Heavy auto-tune effect
- Strong pitch correction with rich reverb
- Settings: Pitch +4, Auto-tune 95%, Reverb 60%, Delay 200ms

### Robot Mode
- Robotic voice transformation
- Low pitch with maximum auto-tune
- Settings: Pitch -8, Auto-tune 100%, Reverb 20%, Delay 80ms

**Made with ❤️ and lots of auto-tune**