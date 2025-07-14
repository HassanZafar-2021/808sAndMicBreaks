from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import numpy as np
import librosa
import soundfile as sf
from scipy.signal import butter, filtfilt
from scipy.interpolate import interp1d
import tempfile
import logging
from werkzeug.utils import secure_filename
from pydub import AudioSegment
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'flac', 'm4a'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class AutoTuneProcessor:
    def __init__(self):
        self.sample_rate = 22050
        self.note_frequencies = self._get_note_frequencies()
    
    def _get_note_frequencies(self):
        """Generate frequencies for musical notes (C4 to C6)"""
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        frequencies = {}
        
        # A4 = 440 Hz as reference
        a4_freq = 440.0
        
        for octave in range(3, 7):  # C3 to C6
            for i, note in enumerate(notes):
                # Calculate frequency using the equal temperament formula
                semitones_from_a4 = (octave - 4) * 12 + (i - 9)  # A is the 10th note (index 9)
                freq = a4_freq * (2 ** (semitones_from_a4 / 12))
                frequencies[f"{note}{octave}"] = freq
        
        return frequencies
    
    def _detect_pitch(self, audio, sr):
        """Detect the fundamental frequency of audio using librosa"""
        try:
            # Use librosa's pitch detection
            pitches, magnitudes = librosa.piptrack(y=audio, sr=sr, threshold=0.1)
            
            # Extract the most prominent pitch for each frame
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            return np.array(pitch_values) if pitch_values else np.array([])
        except Exception as e:
            logger.error(f"Pitch detection error: {e}")
            return np.array([])
    
    def _find_nearest_note(self, frequency):
        """Find the nearest musical note frequency"""
        if frequency <= 0:
            return frequency
        
        note_freqs = list(self.note_frequencies.values())
        nearest_freq = min(note_freqs, key=lambda x: abs(x - frequency))
        return nearest_freq
    
    def _apply_pitch_shift(self, audio, sr, shift_semitones):
        """Apply pitch shift to audio"""
        try:
            if shift_semitones == 0:
                return audio
            
            # Use librosa's phase vocoder for pitch shifting
            shifted_audio = librosa.effects.pitch_shift(
                y=audio, 
                sr=sr, 
                n_steps=shift_semitones,
                bins_per_octave=12
            )
            return shifted_audio
        except Exception as e:
            logger.error(f"Pitch shift error: {e}")
            return audio
    
    def _apply_autotune(self, audio, sr, strength=0.5):
        """Apply auto-tune effect to snap pitches to nearest notes"""
        try:
            if strength == 0:
                return audio
            
            # Detect pitches
            pitches = self._detect_pitch(audio, sr)
            
            if len(pitches) == 0:
                return audio
            
            # Calculate hop length for STFT
            hop_length = 512
            n_frames = len(audio) // hop_length
            
            # Create pitch correction curve
            corrected_audio = audio.copy()
            
            # Apply auto-tune frame by frame using phase vocoder
            if len(pitches) > 0:
                avg_pitch = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0
                if avg_pitch > 0:
                    target_pitch = self._find_nearest_note(avg_pitch)
                    shift_ratio = target_pitch / avg_pitch
                    shift_semitones = 12 * np.log2(shift_ratio) * strength
                    
                    corrected_audio = librosa.effects.pitch_shift(
                        y=corrected_audio,
                        sr=sr,
                        n_steps=shift_semitones,
                        bins_per_octave=12
                    )
            
            return corrected_audio
        except Exception as e:
            logger.error(f"Auto-tune error: {e}")
            return audio
    
    def _apply_reverb(self, audio, sr, amount=0.3, room_size=0.5):
        """Apply reverb effect"""
        try:
            if amount == 0:
                return audio
            
            # Simple reverb using multiple delayed copies
            delay_samples = int(0.03 * sr)  # 30ms delay
            reverb_audio = audio.copy()
            
            # Add multiple delayed and attenuated copies
            for i in range(1, 6):
                delay = delay_samples * i
                attenuation = (0.6 ** i) * amount
                
                if delay < len(audio):
                    delayed = np.zeros_like(audio)
                    delayed[delay:] = audio[:-delay] * attenuation
                    reverb_audio += delayed
            
            # Normalize to prevent clipping
            max_val = np.max(np.abs(reverb_audio))
            if max_val > 1.0:
                reverb_audio = reverb_audio / max_val
            
            return reverb_audio
        except Exception as e:
            logger.error(f"Reverb error: {e}")
            return audio
    
    def _apply_delay(self, audio, sr, delay_time=0.15, feedback=0.3, wet=0.2):
        """Apply delay effect"""
        try:
            if wet == 0:
                return audio
            
            delay_samples = int(delay_time * sr)
            delay_audio = audio.copy()
            
            # Create delay buffer
            delay_buffer = np.zeros(delay_samples)
            output = np.zeros_like(audio)
            
            for i in range(len(audio)):
                # Current sample plus delayed signal
                delayed_sample = delay_buffer[0]
                output[i] = audio[i] + delayed_sample * wet
                
                # Update delay buffer with feedback
                delay_buffer[1:] = delay_buffer[:-1]
                delay_buffer[0] = audio[i] + delayed_sample * feedback
            
            return output
        except Exception as e:
            logger.error(f"Delay error: {e}")
            return audio
    
    def process_audio(self, audio_data, sr, effects):
        """Main audio processing function"""
        try:
            processed_audio = audio_data.copy()
            
            # Apply pitch shift
            if effects.get('pitch_shift', 0) != 0:
                processed_audio = self._apply_pitch_shift(
                    processed_audio, sr, effects['pitch_shift']
                )
            
            # Apply auto-tune
            if effects.get('autotune_strength', 0) > 0:
                processed_audio = self._apply_autotune(
                    processed_audio, sr, effects['autotune_strength'] / 100.0
                )
            
            # Apply reverb
            if effects.get('reverb_amount', 0) > 0:
                processed_audio = self._apply_reverb(
                    processed_audio, sr, effects['reverb_amount'] / 100.0
                )
            
            # Apply delay
            if effects.get('delay_time', 0) > 0:
                processed_audio = self._apply_delay(
                    processed_audio, sr, 
                    effects['delay_time'] / 1000.0,  # Convert ms to seconds
                    feedback=0.3,
                    wet=0.3
                )
            
            # Normalize the final output
            max_val = np.max(np.abs(processed_audio))
            if max_val > 0:
                processed_audio = processed_audio / max_val * 0.95  # Prevent clipping
            
            return processed_audio
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return audio_data

# Initialize processor
processor = AutoTuneProcessor()

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "808s & Mic Breaks - Auto-Tune API",
        "version": "1.0.0",
        "endpoints": {
            "/upload": "POST - Upload and process audio",
            "/presets": "GET - Get available presets",
            "/health": "GET - Health check"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Auto-tune service is running"})

@app.route('/presets', methods=['GET'])
def get_presets():
    presets = {
        "kanye": {
            "name": "Kanye Mode",
            "description": "808s & Heartbreak style auto-tune",
            "effects": {
                "pitch_shift": 2,
                "autotune_strength": 85,
                "reverb_amount": 40,
                "delay_time": 120
            }
        },
        "tpain": {
            "name": "T-Pain Mode", 
            "description": "Heavy auto-tune effect",
            "effects": {
                "pitch_shift": 4,
                "autotune_strength": 95,
                "reverb_amount": 60,
                "delay_time": 200
            }
        },
        "robot": {
            "name": "Robot Mode",
            "description": "Robotic voice effect",
            "effects": {
                "pitch_shift": -8,
                "autotune_strength": 100,
                "reverb_amount": 20,
                "delay_time": 80
            }
        },
        "clear": {
            "name": "Clear",
            "description": "No effects applied",
            "effects": {
                "pitch_shift": 0,
                "autotune_strength": 0,
                "reverb_amount": 0,
                "delay_time": 0
            }
        }
    }
    return jsonify(presets)

@app.route('/upload', methods=['POST'])
def upload_and_process():
    try:
        # Check if file is in request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get effect parameters
        effects = {}
        try:
            if 'effects' in request.form:
                effects = json.loads(request.form['effects'])
            else:
                # Get individual parameters
                effects = {
                    'pitch_shift': int(request.form.get('pitch_shift', 0)),
                    'autotune_strength': int(request.form.get('autotune_strength', 50)),
                    'reverb_amount': int(request.form.get('reverb_amount', 30)),
                    'delay_time': int(request.form.get('delay_time', 150))
                }
        except (ValueError, json.JSONDecodeError) as e:
            return jsonify({"error": f"Invalid effect parameters: {e}"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Save uploaded file temporarily
            temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            file.save(temp_input.name)
            
            try:
                # Load audio file
                audio_data, sr = librosa.load(temp_input.name, sr=None)
                
                # Process audio with effects
                processed_audio = processor.process_audio(audio_data, sr, effects)
                
                # Create output file
                temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
                sf.write(temp_output.name, processed_audio, sr)
                
                # Clean up input file
                os.unlink(temp_input.name)
                
                return send_file(
                    temp_output.name,
                    as_attachment=True,
                    download_name=f"autotuned_{filename}",
                    mimetype='audio/wav'
                )
                
            except Exception as e:
                # Clean up files on error
                if os.path.exists(temp_input.name):
                    os.unlink(temp_input.name)
                logger.error(f"Processing error: {e}")
                return jsonify({"error": f"Audio processing failed: {str(e)}"}), 500
        
        return jsonify({"error": "Invalid file type"}), 400
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

@app.route('/process-base64', methods=['POST'])
def process_base64_audio():
    """Process audio sent as base64 data"""
    try:
        data = request.get_json()
        
        if not data or 'audio_data' not in data:
            return jsonify({"error": "No audio data provided"}), 400
        
        # Get effect parameters
        effects = data.get('effects', {
            'pitch_shift': 0,
            'autotune_strength': 50,
            'reverb_amount': 30,
            'delay_time': 150
        })
        
        # Decode base64 audio data
        import base64
        audio_bytes = base64.b64decode(data['audio_data'])
        
        # Create temporary file
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_input.write(audio_bytes)
        temp_input.close()
        
        try:
            # Load and process audio
            audio_data, sr = librosa.load(temp_input.name, sr=None)
            processed_audio = processor.process_audio(audio_data, sr, effects)
            
            # Save processed audio
            temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            sf.write(temp_output.name, processed_audio, sr)
            
            # Read processed audio and encode as base64
            with open(temp_output.name, 'rb') as f:
                processed_bytes = f.read()
                processed_b64 = base64.b64encode(processed_bytes).decode('utf-8')
            
            # Clean up
            os.unlink(temp_input.name)
            os.unlink(temp_output.name)
            
            return jsonify({
                "processed_audio": processed_b64,
                "sample_rate": sr,
                "effects_applied": effects
            })
            
        except Exception as e:
            if os.path.exists(temp_input.name):
                os.unlink(temp_input.name)
            logger.error(f"Base64 processing error: {e}")
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500
            
    except Exception as e:
        logger.error(f"Base64 endpoint error: {e}")
        return jsonify({"error": f"Request failed: {str(e)}"}), 500

if __name__ == '__main__':
    print("🎤 Starting 808s & Mic Breaks Auto-Tune Server...")
    print("🎵 Available at: http://localhost:5000")
    print("🎚️ Ready to process audio with auto-tune effects!")
    app.run(debug=True, host='0.0.0.0', port=5000)