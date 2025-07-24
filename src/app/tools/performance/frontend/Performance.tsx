import React, { useEffect, useState, useRef } from "react";
import "./Performance.css";

interface CpuStats {
  usagePerCore: number[];
  loadAverage: number[];
}

interface MemoryStats {
  total: number;
  used: number;
  free: number;
  buffers: number;
  cache: number;
  swapTotal: number;
  swapUsed: number;
}

interface DiskStats {
  name: string;
  used: number;
  total: number;
  percent: number;
}

interface NetworkStats {
  name: string;
  rxMBps: number;
  txMBps: number;
}

interface ProcessStats {
  pid: number;
  name: string;
  cpuPercent: number;
}

interface DdosStats {
  attackDetected: boolean;
  attackType: string;
  packetRate: number;
  durationSeconds: number;
  bandwidthSpikePercent: number;
  sourceIPs: string[];
}

interface PerformanceStats {
  cpu: CpuStats;
  memory: MemoryStats;
  disks: DiskStats[];
  network: NetworkStats[];
  totalProcesses: number;
  topProcesses: ProcessStats[];
  uptime: string;
  ddos?: DdosStats;
}

const UsageBar = ({
  percent,
  color,
}: {
  percent: number;
  color: string;
}): JSX.Element => (
  <div className="usageBarContainer">
    <div
      className="usageBar"
      style={{ width: `${percent}%`, backgroundColor: color }}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    />
  </div>
);

const Performance = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cpuCanvasRef = useRef<HTMLCanvasElement>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    let isMounted = true;
    try {
      const res = await fetch("/api/performance");
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      const data: PerformanceStats = await res.json();
      if (isMounted) setStats(data);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      if (isMounted) setError(err.message || "Failed to fetch stats");
    }
    if (isMounted) setLoading(false);
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // (Optional) Draw CPU graph on canvas - omitted for brevity

  return (
    <main className="main">
      <header>
        <h1 className="header">Modix Performance Monitor</h1>
      </header>

      <section className="controls">
        <button
          className="btn"
          onClick={fetchStats}
          disabled={loading}
          aria-label="Refresh Performance Stats"
        >
          Refresh
        </button>
        <button
          className="btn"
          onClick={() => setAutoRefresh(!autoRefresh)}
          aria-pressed={autoRefresh}
          aria-label="Toggle Auto Refresh"
        >
          {autoRefresh ? "Pause Auto Refresh" : "Start Auto Refresh"}
        </button>
      </section>

      {loading && <p>Loading stats...</p>}
      {error && (
        <p className="errorMsg" role="alert">
          Error: {error}
        </p>
      )}

      {stats && !error && (
        <>
          <section className="grid" aria-live="polite">
            <article className="cpuSection" aria-label="CPU Usage">
              <h2>CPU Usage</h2>
              <div className="cpuCores">
                {stats.cpu.usagePerCore.map((usage, idx) => (
                  <div className="cpuCore" key={idx}>
                    <strong>Core {idx + 1}</strong>
                    <UsageBar percent={usage} color="#80deea" />
                    <span>{usage}%</span>
                  </div>
                ))}
              </div>
              <div className="cpuLoadAverages">
                Load Averages: {stats.cpu.loadAverage.join(", ")}
              </div>
              <canvas
                className="cpuGraph"
                ref={cpuCanvasRef}
                aria-hidden="true"
              />
            </article>

            <article className="memorySection" aria-label="Memory Usage">
              <h2>Memory Usage</h2>
              <div className="memoryStats">
                <p>Total: {stats.memory.total} MB</p>
                <p>Used: {stats.memory.used} MB</p>
                <p>Free: {stats.memory.free} MB</p>
                <p>Buffers: {stats.memory.buffers} MB</p>
                <p>Cache: {stats.memory.cache} MB</p>
                <p>Swap Total: {stats.memory.swapTotal} MB</p>
                <p>Swap Used: {stats.memory.swapUsed} MB</p>
              </div>
              <UsageBar
                percent={(stats.memory.used / stats.memory.total) * 100}
                color="#81c784"
              />
            </article>

            <article className="diskSection" aria-label="Disk Usage">
              <h2>Disk Usage</h2>
              {stats.disks.map((disk) => (
                <div className="diskInfo" key={disk.name}>
                  <strong>{disk.name}</strong>
                  <p>
                    {disk.used} / {disk.total} GB used ({disk.percent}%)
                  </p>
                  <UsageBar percent={disk.percent} color="#ffb74d" />
                </div>
              ))}
            </article>

            <article className="networkSection" aria-label="Network Interfaces">
              <h2>Network Traffic</h2>
              {stats.network.map((iface) => (
                <div className="networkIface" key={iface.name}>
                  <strong>{iface.name}</strong>
                  <p>
                    RX: {iface.rxMBps} MB/s | TX: {iface.txMBps} MB/s
                  </p>
                  <UsageBar
                    percent={Math.min(100, iface.rxMBps)}
                    color="#80deea"
                  />
                  <UsageBar
                    percent={Math.min(100, iface.txMBps)}
                    color="#4dd0e1"
                  />
                </div>
              ))}
            </article>

            <article className="processesSection" aria-label="Processes">
              <h2>Processes ({stats.totalProcesses} total)</h2>
              <p>Top CPU-consuming processes:</p>
              <ul>
                {stats.topProcesses.map((proc) => (
                  <li key={proc.pid}>
                    <strong>{proc.name}</strong> (PID: {proc.pid}) - CPU:{" "}
                    {proc.cpuPercent}%
                    <UsageBar percent={proc.cpuPercent} color="#ef9a9a" />
                  </li>
                ))}
              </ul>
            </article>

            <article className="uptimeSection" aria-label="Server Uptime">
              <h2>Server Uptime</h2>
              <p>{stats.uptime}</p>
            </article>
          </section>

          {/* DDoS Attack Monitoring Section */}
          <section
            className="ddosSectionContainer"
            aria-label="DDoS Attack Monitoring"
          >
            <header className="ddosHeader">
              <h2>DDoS Attack Monitoring</h2>
              <span
                className={`ddosStatusBadge ${
                  stats.ddos?.attackDetected ? "ddosActive" : "ddosInactive"
                }`}
                aria-live="polite"
              >
                {stats.ddos?.attackDetected ? "Attack Detected" : "No Attack"}
              </span>
            </header>

            {!stats.ddos || !stats.ddos.attackDetected ? (
              <p className="ddosNoAttackMsg">
                No active Distributed Denial of Service attacks detected on this
                server.
              </p>
            ) : (
              <div className="ddosDetailsGrid">
                <div className="ddosDetailItem">
                  <strong>Type:</strong>
                  <span>{stats.ddos.attackType}</span>
                </div>
                <div className="ddosDetailItem">
                  <strong>Packet Rate:</strong>
                  <span>
                    {stats.ddos.packetRate.toLocaleString()} packets/sec
                  </span>
                </div>
                <div className="ddosDetailItem">
                  <strong>Duration:</strong>
                  <span>{stats.ddos.durationSeconds} seconds</span>
                </div>
                <div className="ddosDetailItem">
                  <strong>Bandwidth Spike:</strong>
                  <span>{stats.ddos.bandwidthSpikePercent}%</span>
                </div>
                <div className="ddosDetailItem ddosSourceIPs">
                  <strong>Source IPs:</strong>
                  <ul>
                    {stats.ddos.sourceIPs.map((ip, i) => (
                      <li key={i}>{ip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        <p>Modix Game Panel © 2025 — Performance Monitor</p>
      </footer>
    </main>
  );
};

export default Performance;
