#!/usr/bin/env python3
"""
Test script for 808s & Mic Breaks Auto-Tune Backend
Tests the audio processing functionality
"""

import sys
import numpy as np
import librosa
import soundfile as sf
from app import AutoTuneProcessor

def test_audio_processing():
    """Test the auto-tune processor with synthetic audio"""
    print("🎵 Testing Auto-Tune Processor...")
    
    try:
        # Create a synthetic audio signal (sine wave)
        duration = 2.0  # seconds
        sample_rate = 22050
        frequency = 440.0  # A4 note
        
        t = np.linspace(0, duration, int(sample_rate * duration))
        audio_signal = 0.5 * np.sin(2 * np.pi * frequency * t)
        
        print(f"✅ Generated test audio: {duration}s at {sample_rate}Hz")
        
        # Initialize processor
        processor = AutoTuneProcessor()
        print("✅ AutoTune processor initialized")
        
        # Test different effects
        test_effects = [
            {"name": "Kanye Mode", "effects": {"pitch_shift": 2, "autotune_strength": 85, "reverb_amount": 40, "delay_time": 120}},
            {"name": "T-Pain Mode", "effects": {"pitch_shift": 4, "autotune_strength": 95, "reverb_amount": 60, "delay_time": 200}},
            {"name": "Robot Mode", "effects": {"pitch_shift": -8, "autotune_strength": 100, "reverb_amount": 20, "delay_time": 80}},
        ]
        
        for test in test_effects:
            print(f"\n🎚️ Testing {test['name']}...")
            processed = processor.process_audio(audio_signal, sample_rate, test['effects'])
            
            if processed is not None and len(processed) > 0:
                print(f"✅ {test['name']} processing successful")
                print(f"   Input length: {len(audio_signal)} samples")
                print(f"   Output length: {len(processed)} samples")
                print(f"   Max amplitude: {np.max(np.abs(processed)):.3f}")
            else:
                print(f"❌ {test['name']} processing failed")
        
        print("\n🎉 All tests completed!")
        return True
        
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("💡 Run: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_dependencies():
    """Test if all required dependencies are installed"""
    print("📦 Testing Dependencies...")
    
    dependencies = [
        ('flask', 'Flask'),
        ('flask_cors', 'Flask-CORS'),
        ('numpy', 'NumPy'),
        ('scipy', 'SciPy'),
        ('librosa', 'Librosa'),
        ('soundfile', 'SoundFile'),
        ('pydub', 'PyDub'),
    ]
    
    all_good = True
    for module, name in dependencies:
        try:
            __import__(module)
            print(f"✅ {name}")
        except ImportError:
            print(f"❌ {name} - Not installed")
            all_good = False
    
    return all_good

if __name__ == "__main__":
    print("🎤 808s & Mic Breaks - Backend Test Suite")
    print("=" * 50)
    
    # Test dependencies
    if not test_dependencies():
        print("\n❌ Some dependencies are missing. Please install them first.")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    
    # Test audio processing
    if test_audio_processing():
        print("\n🎉 Backend is ready to rock! 🎸")
        print("🚀 You can now start the Flask server with: python app.py")
    else:
        print("\n❌ Backend tests failed. Please check the installation.")
        sys.exit(1)
