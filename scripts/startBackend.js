// scripts/startbackend.js
const { spawnSync, spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "../backend");
const venvDir = path.join(backendDir, "venv");
const backendFile = path.join(backendDir, "api_main.py");
const backendPort = process.env.API_PORT || 2010;

let pythonPath;
const backendRc = path.join(__dirname, "../.backendrc");

// 1️⃣ Check for .backendrc override
if (fs.existsSync(backendRc)) {
  pythonPath = fs.readFileSync(backendRc, "utf8").trim();
}
// 2️⃣ Check venv
else if (fs.existsSync(venvDir)) {
  pythonPath =
    process.platform === "win32"
      ? path.join(venvDir, "Scripts", "python.exe")
      : path.join(venvDir, "bin", "python");
  if (!fs.existsSync(pythonPath)) {
    console.error("❌ Python not found inside venv. Please recreate venv.");
    process.exit(1);
  }
}
// 3️⃣ Create venv if missing
else {
  console.warn("⚠️ venv not found. Creating a new virtual environment...");
  if (process.platform === "win32") {
    const result = spawnSync("py", ["-3", "-m", "venv", venvDir], {
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status);
    pythonPath = path.join(venvDir, "Scripts", "python.exe");
  } else {
    const result = spawnSync("python3", ["-m", "venv", venvDir], {
      stdio: "inherit",
    });
    if (result.status !== 0) process.exit(result.status);
    pythonPath = path.join(venvDir, "bin", "python");
  }
}

// 🔍 Kill process already using backendPort
function freePort(port) {
  try {
    if (process.platform === "win32") {
      // Windows
      const pid = execSync(`netstat -ano | findstr :${port}`)
        .toString()
        .trim()
        .split("\n")[0]
        .trim()
        .split(" ")
        .filter(Boolean)
        .pop();
      if (pid) {
        console.log(`⚠️ Port ${port} in use by PID ${pid}, killing...`);
        execSync(`taskkill /PID ${pid} /F`);
      }
    } else {
      // Linux/macOS
      const pid = execSync(`lsof -ti :${port}`).toString().trim();
      if (pid) {
        console.log(`⚠️ Port ${port} in use by PID ${pid}, killing...`);
        execSync(`kill -9 ${pid}`);
      }
    }
  } catch {
    // no process was running
  }
}
freePort(backendPort);

// ✅ Upgrade pip
spawnSync(pythonPath, ["-m", "pip", "install", "--upgrade", "pip"], {
  stdio: "inherit",
});

// ✅ Install requirements
const requirements = path.join(backendDir, "requirements.txt");
if (fs.existsSync(requirements)) {
  console.log("📦 Installing backend dependencies...");
  const install = spawnSync(
    pythonPath,
    ["-m", "pip", "install", "-r", requirements],
    {
      stdio: "inherit",
    }
  );
  if (install.status !== 0) process.exit(install.status);
}

// ✅ Start backend
const env = { ...process.env, API_PORT: backendPort };
console.log(`🚀 Starting backend using: ${pythonPath} on port ${backendPort}`);

const backendProcess = spawn(pythonPath, [backendFile], {
  cwd: backendDir,
  stdio: "inherit",
  env,
});

backendProcess.on("exit", (code) => {
  console.log(`Backend exited with code ${code}`);
});
