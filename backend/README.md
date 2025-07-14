# 🐍 808s & Mic Breaks - Backend

Python Flask backend for professional auto-tune audio processing.

## 🛠️ Tech Stack

- **Python Flask** - RESTful API server
- **Librosa** - Professional audio analysis and processing
- **NumPy & SciPy** - Numerical computing for audio effects
- **SoundFile** - Audio file I/O
- **Flask-CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- **Python** (3.8 or higher)

### Installation
```bash
# Create virtual environment (if not exists)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Development
```bash
python app.py
```

Server will start at: http://localhost:5000

### Testing
```bash
python test_backend.py
```

## 📁 Project Structure

```
backend/
├── app.py              # Flask application main file
├── test_backend.py     # Backend test suite
├── requirements.txt    # Python dependencies
├── .venv/             # Virtual environment
├── uploads/           # Uploaded audio files
├── processed/         # Processed audio files
└── __pycache__/       # Python cache files
```

## 🔗 API Endpoints

### Health Check
```
GET /health
```
Returns backend status

### Get Presets
```
GET /presets
```
Returns available auto-tune presets

### Process Audio File
```
POST /upload
```
Upload and process audio file with effects

### Process Base64 Audio
```
POST /process-base64
```
Process audio data sent as base64

## 🎛️ Audio Processing Features

### Auto-Tune Algorithm
- **Pitch Detection**: Uses librosa's piptrack for fundamental frequency detection
- **Note Mapping**: Snaps to nearest musical notes using equal temperament
- **Strength Control**: Configurable correction intensity (0-100%)

### Effects Pipeline
1. **Pitch Shift**: ±12 semitones using phase vocoder
2. **Auto-Tune**: Pitch correction to musical notes
3. **Reverb**: Simulated room acoustics
4. **Delay**: Echo effect with feedback

### Supported Formats
- **Input**: WAV, MP3, OGG, FLAC, M4A
- **Output**: WAV (16-bit, variable sample rate)
- **Max File Size**: 50MB

## 🎵 Available Presets

### Kanye Mode
```json
{
  "pitch_shift": 2,
  "autotune_strength": 85,
  "reverb_amount": 40,
  "delay_time": 120
}
```

### T-Pain Mode
```json
{
  "pitch_shift": 4,
  "autotune_strength": 95,
  "reverb_amount": 60,
  "delay_time": 200
}
```

### Robot Mode
```json
{
  "pitch_shift": -8,
  "autotune_strength": 100,
  "reverb_amount": 20,
  "delay_time": 80
}
```

## 🔧 Configuration

### Environment Variables
- `FLASK_ENV`: development/production
- `FLASK_DEBUG`: true/false
- `MAX_CONTENT_LENGTH`: Maximum upload size

### Audio Settings
- `SAMPLE_RATE`: Default 22050 Hz
- `CHUNK_SIZE`: Processing chunk size
- `OVERLAP`: Frame overlap for STFT

## 🚨 Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `413`: File too large
- `415`: Unsupported media type
- `500`: Internal server error

## 🔍 Debugging

Enable debug mode for detailed logging:
```python
app.run(debug=True)
```

Check logs for processing details and error messages.
