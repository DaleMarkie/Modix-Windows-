# backend/main.py
from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Backend is running!"})

if __name__ == "__main__":
    port = int(os.environ.get("API_PORT", 2010))
    app.run(host="0.0.0.0", port=port)
