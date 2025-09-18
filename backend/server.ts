import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import fs from "fs";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

let runningProcess: ChildProcessWithoutNullStreams | null = null;
let activeGameId: string | null = null;

// Map game IDs to server scripts
const GAME_SCRIPTS: Record<string, { script: string; shell: string }> = {
  pz: {
    script: "backend/gamefiles/projectzomboid/linux/server.sh",
    shell: "bash",
  },
  "pz-win": {
    script: "backend/gamefiles/projectzomboid/windows/server.bat",
    shell: "cmd.exe",
  },
};

const getGameScript = (gameId: string) => {
  const entry = GAME_SCRIPTS[gameId];
  if (!entry) throw new Error(`No script configured for game ID: ${gameId}`);
  const fullPath = path.resolve(entry.script);
  if (!fs.existsSync(fullPath))
    throw new Error(`Script file not found: ${fullPath}`);
  return { path: fullPath, shell: entry.shell };
};

// Start server
app.post("/start-server", (req: Request, res: Response) => {
  const gameId: string | undefined = req.body.gameId;
  if (!gameId) return res.status(400).json({ error: "gameId is required" });

  if (runningProcess)
    return res.status(400).json({ error: "Server is already running" });

  try {
    const { path: scriptPath, shell } = getGameScript(gameId);

    runningProcess =
      shell === "bash"
        ? spawn(shell, [scriptPath])
        : spawn(shell, ["/c", scriptPath]);

    runningProcess.stdout.on("data", (data: Buffer) => {
      console.log(`[SERVER]: ${data.toString()}`);
    });

    runningProcess.stderr.on("data", (data: Buffer) => {
      console.error(`[SERVER ERROR]: ${data.toString()}`);
    });

    runningProcess.on("exit", (code: number | null) => {
      console.log(`[SYSTEM] Server stopped with code ${code}`);
      runningProcess = null;
      activeGameId = null;
    });

    activeGameId = gameId;
    res.json({ status: "running", message: "Server started successfully" });
  } catch (err: unknown) {
    // ✅ Properly type unknown errors
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// Stop server
app.post("/stop-server", (req: Request, res: Response) => {
  if (!runningProcess) {
    return res.status(400).json({ error: "Server is not running" });
  }
  runningProcess.kill();
  runningProcess = null;
  activeGameId = null;
  res.json({ status: "stopped", message: "Server stopped successfully" });
});

// Server status
app.get("/server-status", (req: Request, res: Response) => {
  res.json({
    status: runningProcess ? "running" : "stopped",
    gameId: activeGameId,
  });
});

// Simple log stream (SSE)
app.get("/log-stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendData = (data: string) => res.write(`data: ${data}\n\n`);
  const stdoutListener = (data: Buffer) => sendData(data.toString());
  const stderrListener = (data: Buffer) =>
    sendData(`[ERROR] ${data.toString()}`);

  if (runningProcess) {
    runningProcess.stdout.on("data", stdoutListener);
    runningProcess.stderr.on("data", stderrListener);
  }

  const interval = setInterval(() => res.write(":\n"), 10000);

  req.on("close", () => {
    clearInterval(interval);
    if (runningProcess) {
      runningProcess.stdout.off("data", stdoutListener);
      runningProcess.stderr.off("data", stderrListener);
    }
  });
});

app.listen(2010, () => console.log("Server API listening on port 2010"));
