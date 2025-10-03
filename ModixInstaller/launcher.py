import subprocess
import webbrowser
import time
import sys
import os

# -------------------------
# Paths
# -------------------------
base_path = os.path.dirname(os.path.abspath(__file__))

backend_file = os.path.join(base_path, "backend", "api_main.py")

# Frontend server command
frontend_cmd = ["npx", "next", "start", "-p", "3000"]

# -------------------------
# Start backend
# -------------------------
backend_proc = subprocess.Popen([sys.executable, backend_file], cwd=base_path)
print("Backend started...")

# Wait a few seconds
time.sleep(3)

# -------------------------
# Start frontend
# -------------------------
frontend_proc = subprocess.Popen(frontend_cmd, cwd=base_path)
print("Frontend started...")

# Open browser
webbrowser.open("http://localhost:3000")
