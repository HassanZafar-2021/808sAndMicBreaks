#!/usr/bin/env python3
"""
Startup script for 808s & Mic Breaks
Starts both the Python backend and React frontend
"""

import subprocess
import time
import threading
from pathlib import Path

def start_backend():
    """Start the Python Flask backend"""
    print("🐍 Starting Python Flask backend...")
    try:
        # Change to backend directory
        backend_dir = Path(__file__).parent / "backend"
        
        # Get the Python executable path
        python_exe = backend_dir / ".venv" / "Scripts" / "python.exe"
        if not python_exe.exists():
            python_exe = "python"
        
        # Start Flask app from backend directory
        subprocess.run([str(python_exe), "app.py"], cwd=backend_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend failed to start: {e}")
    except KeyboardInterrupt:
        print("🛑 Backend stopped by user")

def start_frontend():
    """Start the React frontend"""
    print("⚛️ Starting React frontend...")
    try:
        # Wait a moment for backend to start
        time.sleep(3)
        
        # Change to frontend directory
        frontend_dir = Path(__file__).parent / "frontend"
        
        # Start React dev server
        subprocess.run(["npm", "run", "dev"], cwd=frontend_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend failed to start: {e}")
    except KeyboardInterrupt:
        print("🛑 Frontend stopped by user")

def main():
    print("🎤 808s & Mic Breaks - Full Stack Startup")
    print("=" * 50)
    print("🚀 Starting both backend and frontend...")
    print("📝 Make sure you have installed dependencies:")
    print("   - Backend: cd backend && pip install -r requirements.txt")
    print("   - Frontend: cd frontend && npm install")
    print("=" * 50)
    
    try:
        # Start backend in a separate thread
        backend_thread = threading.Thread(target=start_backend, daemon=True)
        backend_thread.start()
        
        # Wait a moment then start frontend
        time.sleep(2)
        print("⚛️ Starting React development server...")
        start_frontend()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        print("👋 Thanks for using 808s & Mic Breaks!")

if __name__ == "__main__":
    main()
