#!/usr/bin/env node

/**
 * Modix Installer Script
 * Usage: modix-install
 * Installs frontend and backend dependencies and builds backend executable
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Helper to run shell commands with logging
function runCommand(command, options = {}) {
  console.log(`\x1b[36m> Running:\x1b[0m ${command}`);
  try {
    execSync(command, { stdio: "inherit", shell: true, ...options });
  } catch (err) {
    console.error(`\x1b[31mError running command:\x1b[0m ${command}`);
    process.exit(1);
  }
}

// Step 1: Check Node.js
try {
  runCommand("node -v");
  runCommand("npm -v");
} catch {
  console.error("\x1b[31mNode.js and npm are required!\x1b[0m");
  process.exit(1);
}

// Step 2: Install frontend dependencies
console.log("\x1b[33mInstalling frontend dependencies...\x1b[0m");
runCommand("npm install");

// Step 3: Check Python 3
try {
  runCommand("py -3 --version");
} catch {
  try {
    runCommand("python3 --version");
  } catch {
    console.error("\x1b[31mPython 3 is required!\x1b[0m");
    process.exit(1);
  }
}

// Step 4: Install Python dependencies
console.log("\x1b[33mInstalling Python dependencies...\x1b[0m");
const requirements = `
annotated-types==0.7.0
anyio==4.11.0
certifi==2025.8.3
click==8.3.0
exceptiongroup==1.3.0
fastapi==0.118.0
h11==0.16.0
httpcore==1.0.9
httpx==0.28.1
idna==3.10
psutil==7.1.0
pydantic==2.11.9
pydantic_core==2.33.2
sniffio==1.3.1
sse-starlette==3.0.2
starlette==0.48.0
typing-inspection==0.4.2
typing_extensions==4.15.0
urllib3==2.0.7
uvicorn==0.37.0
`;

const requirementsPath = path.join(__dirname, "modix_requirements.txt");
fs.writeFileSync(requirementsPath, requirements);

try {
  runCommand(`py -3 -m pip install -r "${requirementsPath}"`);
} catch {
  runCommand(`python3 -m pip install -r "${requirementsPath}"`);
}

// Step 5: Build backend with PyInstaller
console.log("\x1b[33mBuilding backend executable...\x1b[0m");
const backendPath = path.join(__dirname, "backend", "api_main.py");
runCommand(`pyinstaller --onefile "${backendPath}" --name modix-backend`);

// Step 6: Clean PyInstaller artifacts
["build", "__pycache__"].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath))
    fs.rmSync(fullPath, { recursive: true, force: true });
});
if (fs.existsSync(path.join(__dirname, "modix_requirements.txt")))
  fs.unlinkSync(path.join(__dirname, "modix_requirements.txt"));

// Step 7: Start frontend & backend
console.log("\x1b[32mInstallation complete!\x1b[0m");
console.log("\x1b[36mYou can now start the panel using:\x1b[0m");
console.log("\x1b[36mnpm run dev (for development)\x1b[0m");
console.log("\x1b[36mOr run frontend and modix-backend separately\x1b[0m");
