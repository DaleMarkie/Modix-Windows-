// scripts/dev-backend.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "../backend");
const backendRc = path.join(__dirname, "../.backendrc");

// Default: python3 on Linux/macOS, py -3 on Windows
let pythonCmd = process.platform === "win32" ? "py -3" : "python3";

// Allow override with .backendrc
if (fs.existsSync(backendRc)) {
  pythonCmd = fs.readFileSync(backendRc, "utf8").trim();
}

const args = [
  "-m",
  "uvicorn",
  "backend.api_main:app",
  "--host",
  "0.0.0.0",
  "--port",
  process.env.API_PORT || "2010",
  "--reload",
];

console.log(`🚀 Starting backend: ${pythonCmd} ${args.join(" ")}`);

const backendProcess = spawn(pythonCmd, args, {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."), // project root
  env: { ...process.env, PYTHONPATH: backendDir },
  shell: true, // needed for "py -3" on Windows
});

backendProcess.on("error", (err) => {
  console.error("❌ Failed to start backend:", err.message);
});

backendProcess.on("close", (code) => {
  console.log(`⚠️ Backend exited with code ${code}`);
});
