# -*- coding: utf-8 -*-
import subprocess
import os
import time
import sys
import signal

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_EXE = os.path.join(BASE_DIR, "modix-backend.exe")

def start_backend():
    if os.path.exists(BACKEND_EXE):
        print("Starting backend (api_main.py on port 2010)...")
        return subprocess.Popen([BACKEND_EXE], cwd=BASE_DIR)
    else:
        print("ERROR: modix-backend.exe not found!")
        sys.exit(1)

def start_frontend():
    print("Starting frontend (Next.js on port 3000)...")
    # Node.js must be installed
    return subprocess.Popen(["npx", "next", "start", "-p", "3000"], cwd=BASE_DIR, shell=True)

if __name__ == "__main__":
    backend = start_backend()
    time.sleep(3)  # wait a bit for backend
    frontend = start_frontend()

    try:
        print("Modix running! Backend: http://localhost:2010 | Frontend: http://localhost:3000")
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("Shutting down Modix...")
        backend.terminate()
        frontend.terminate()
        sys.exit(0)
