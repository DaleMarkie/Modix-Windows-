from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time
from datetime import timedelta
from typing import List

app = FastAPI()

# Enable CORS so your React app (likely on localhost:3000) can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_cpu_stats():
    usage_per_core = psutil.cpu_percent(percpu=True)
    load_avg = list(psutil.getloadavg())  # 1, 5, 15 min load averages
    return {
        "usagePerCore": usage_per_core,
        "loadAverage": load_avg,
    }

def get_memory_stats():
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        "total": round(mem.total / (1024 ** 2)),  # MB
        "used": round(mem.used / (1024 ** 2)),
        "free": round(mem.available / (1024 ** 2)),
        "buffers": getattr(mem, 'buffers', 0),
        "cache": getattr(mem, 'cached', 0),
        "swapTotal": round(swap.total / (1024 ** 2)),
        "swapUsed": round(swap.used / (1024 ** 2)),
    }

def get_disks_stats():
    disks = []
    for part in psutil.disk_partitions(all=False):
        if 'rw' not in part.opts and 'ro' not in part.opts:
            continue  # Skip non-physical disks or special mounts

        usage = psutil.disk_usage(part.mountpoint)
        disks.append({
            "name": part.device,
            "total": round(usage.total / (1024 ** 3)),  # GB
            "used": round(usage.used / (1024 ** 3)),
            "percent": usage.percent,
        })
    return disks

def get_network_stats():
    stats = []
    net_io = psutil.net_io_counters(pernic=True)
    for iface, counters in net_io.items():
        # Calculate MB/s: For demo, just convert bytes to MB - real MB/s needs delta over time
        rx_mbps = round(counters.bytes_recv / (1024 ** 2), 2)
        tx_mbps = round(counters.bytes_sent / (1024 ** 2), 2)
        stats.append({
            "name": iface,
            "rxMBps": rx_mbps,
            "txMBps": tx_mbps,
        })
    return stats

def get_top_processes(limit=5):
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
        try:
            info = proc.info
            processes.append(info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    # Sort by CPU %
    processes.sort(key=lambda p: p.get('cpu_percent', 0), reverse=True)
    return processes[:limit]

def get_uptime():
    uptime_sec = time.time() - psutil.boot_time()
    return str(timedelta(seconds=int(uptime_sec)))

def get_ddos_stats():
    # Placeholder/mock - you should replace with your actual DDoS detection logic
    # Example: random attack detected 10% of the time
    import random
    attack_detected = random.random() < 0.1
    if not attack_detected:
        return {
            "attackDetected": False
        }
    else:
        return {
            "attackDetected": True,
            "attackType": "SYN Flood",
            "packetRate": 500000,
            "durationSeconds": 120,
            "bandwidthSpikePercent": 300,
            "sourceIPs": ["192.168.1.100", "10.0.0.5", "172.16.0.12"],
        }

@app.get("/api/performance")
async def performance():
    return {
        "cpu": get_cpu_stats(),
        "memory": get_memory_stats(),
        "disks": get_disks_stats(),
        "network": get_network_stats(),
        "totalProcesses": len(psutil.pids()),
        "topProcesses": get_top_processes(),
        "uptime": get_uptime(),
        "ddos": get_ddos_stats(),
    }
