from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import asyncio

app = FastAPI()

# Models
class DockerContainer(BaseModel):
    id: str
    name: str
    status: str
    underAttack: bool

class SuspiciousIP(BaseModel):
    ip: str
    threatLevel: str  # "low", "medium", "high"

class BlockIPRequest(BaseModel):
    ip: str

# In-memory example data - replace with real DB or Docker API integration
docker_containers = [
    DockerContainer(id="1", name="pz_server_1", status="running", underAttack=False),
    DockerContainer(id="2", name="pz_server_2", status="running", underAttack=True),
]

suspicious_ips = [
    SuspiciousIP(ip="192.168.1.100", threatLevel="high"),
    SuspiciousIP(ip="10.0.0.55", threatLevel="medium"),
    SuspiciousIP(ip="172.16.0.7", threatLevel="low"),
]

@app.get("/api/docker/containers", response_model=List[DockerContainer])
async def get_docker_containers():
    # Here you would normally query Docker API or your orchestration system
    return docker_containers

@app.get("/api/ddos/suspicious-ips", response_model=List[SuspiciousIP])
async def get_suspicious_ips():
    # Query your logs, firewall, or threat database for suspicious IPs
    return suspicious_ips

@app.post("/api/ddos/block-ip")
async def block_ip(request: BlockIPRequest):
    ip_to_block = request.ip
    # Implement your IP block logic here, e.g., firewall rule, IP ban, etc.
    global suspicious_ips
    if ip_to_block not in [ip.ip for ip in suspicious_ips]:
        raise HTTPException(status_code=404, detail="IP not found in suspicious list")

    # Remove IP from suspicious list as an optimistic UI update
    suspicious_ips = [ip for ip in suspicious_ips if ip.ip != ip_to_block]

    # Simulate async block delay
    await asyncio.sleep(0.5)

    return {"detail": f"Blocked IP {ip_to_block}"}

# Optional: endpoint to toggle container underAttack status for simulation/testing
@app.post("/api/docker/containers/{container_id}/toggle-attack")
async def toggle_container_attack(container_id: str):
    global docker_containers
    for container in docker_containers:
        if container.id == container_id:
            container.underAttack = not container.underAttack
            return {"id": container_id, "underAttack": container.underAttack}
    raise HTTPException(status_code=404, detail="Container not found")
