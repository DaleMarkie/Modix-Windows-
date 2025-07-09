import React, { useState, useEffect } from "react";
import "./FireWallManager.css";

type FirewallRule = {
  id: number;
  action: "allow" | "deny";
  protocol: "tcp" | "udp" | "icmp" | "all";
  port: string;
  ipRange: string;
  description?: string;
};

type FirewallLog = {
  timestamp: string;
  ip: string;
  action: "blocked" | "allowed";
  port: number;
  protocol: string;
};

export default function Firewall() {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [logs, setLogs] = useState<FirewallLog[]>([]);
  const [autoBlock, setAutoBlock] = useState(false);
  const [geoBlockList, setGeoBlockList] = useState<string[]>([]);
  const [newRule, setNewRule] = useState<Omit<FirewallRule, "id">>({
    action: "deny",
    protocol: "tcp",
    port: "",
    ipRange: "any",
    description: "",
  });

  // Fetch current rules and logs from your backend
  useEffect(() => {
    async function fetchData() {
      try {
        const rulesRes = await fetch("/api/docker/firewall/rules");
        const rulesData: FirewallRule[] = await rulesRes.json();
        setRules(rulesData);

        const logsRes = await fetch("/api/docker/firewall/logs");
        const logsData: FirewallLog[] = await logsRes.json();
        setLogs(logsData);

        const geoRes = await fetch("/api/docker/firewall/geoblock");
        const geoData: string[] = await geoRes.json();
        setGeoBlockList(geoData);

        const autoBlockRes = await fetch("/api/docker/firewall/autoblock");
        const autoBlockData: { enabled: boolean } = await autoBlockRes.json();
        setAutoBlock(autoBlockData.enabled);
      } catch (error) {
        console.error("Error fetching firewall data", error);
      }
    }
    fetchData();
  }, []);

  // Add a new firewall rule
  async function addRule() {
    if (!newRule.port) return alert("Port is required");
    try {
      const res = await fetch("/api/docker/firewall/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });
      if (!res.ok) throw new Error("Failed to add rule");
      const addedRule = await res.json();
      setRules([...rules, addedRule]);
      setNewRule({
        action: "deny",
        protocol: "tcp",
        port: "",
        ipRange: "any",
        description: "",
      });
    } catch (e) {
      alert(e.message);
    }
  }

  // Remove a firewall rule by ID
  async function removeRule(id: number) {
    try {
      const res = await fetch(`/api/docker/firewall/rules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete rule");
      setRules(rules.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  // Update Auto Block setting
  async function toggleAutoBlock(enabled: boolean) {
    try {
      const res = await fetch("/api/docker/firewall/autoblock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to update auto block");
      setAutoBlock(enabled);
    } catch (e) {
      alert(e.message);
    }
  }

  // Add or remove Geo Block country codes similarly via backend API
  async function addGeoBlock(code: string) {
    try {
      const res = await fetch("/api/docker/firewall/geoblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: code }),
      });
      if (!res.ok) throw new Error("Failed to add geo block");
      setGeoBlockList([...geoBlockList, code]);
    } catch (e) {
      alert(e.message);
    }
  }

  async function removeGeoBlock(code: string) {
    try {
      const res = await fetch(`/api/docker/firewall/geoblock/${code}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove geo block");
      setGeoBlockList(geoBlockList.filter((c) => c !== code));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="firewall-container" aria-label="Firewall Manager">
      <h1 className="firewall-title">Firewall</h1>

      <section className="toggle-section">
        <label htmlFor="autoBlock">Automatic Block</label>
        <input
          type="checkbox"
          id="autoBlock"
          checked={autoBlock}
          onChange={(e) => toggleAutoBlock(e.target.checked)}
        />
      </section>

      <section className="section-card" aria-label="GeoIP Blocking">
        <h2 className="section-title">GeoIP Block</h2>
        <div className="geoip-buttons">
          {geoBlockList.map((code) => (
            <button
              key={code}
              className="geoip-button remove"
              onClick={() => removeGeoBlock(code)}
              title={`Remove Geo Block for ${code}`}
              aria-label={`Remove Geo Block for ${code}`}
            >
              {code} &times;
            </button>
          ))}
          <button
            className="geoip-button add"
            onClick={() => {
              const newCode = prompt(
                "Enter country code (e.g. US, CN):"
              )?.toUpperCase();
              if (newCode && newCode.length === 2) addGeoBlock(newCode);
            }}
            aria-label="Add GeoIP Block"
          >
            + Add
          </button>
        </div>
      </section>

      <section className="section-card" aria-label="Firewall Rules">
        <h2 className="section-title">Rules</h2>
        <table className="firewall-table" role="grid">
          <thead>
            <tr>
              <th>Action</th>
              <th>Protocol</th>
              <th>Port</th>
              <th>IP Range</th>
              <th>Description</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(
              ({ id, action, protocol, port, ipRange, description }) => (
                <tr key={id}>
                  <td>
                    <span
                      className={
                        action === "allow" ? "status-allow" : "status-deny"
                      }
                    >
                      {action.toUpperCase()}
                    </span>
                  </td>
                  <td>{protocol.toUpperCase()}</td>
                  <td>{port}</td>
                  <td>{ipRange}</td>
                  <td>{description}</td>
                  <td>
                    <button
                      className="action-delete"
                      aria-label={`Delete rule ${description ?? id}`}
                      onClick={() => removeRule(id)}
                      title="Delete Rule"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              )
            )}
            <tr>
              <td>
                <select
                  className="input-select"
                  value={newRule.action}
                  onChange={(e) =>
                    setNewRule((r) => ({
                      ...r,
                      action: e.target.value as FirewallRule["action"],
                    }))
                  }
                  aria-label="Select action"
                >
                  <option value="allow">Allow</option>
                  <option value="deny">Deny</option>
                </select>
              </td>
              <td>
                <select
                  className="input-select"
                  value={newRule.protocol}
                  onChange={(e) =>
                    setNewRule((r) => ({
                      ...r,
                      protocol: e.target.value as FirewallRule["protocol"],
                    }))
                  }
                  aria-label="Select protocol"
                >
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                  <option value="all">All</option>
                </select>
              </td>
              <td>
                <input
                  className="input-text"
                  type="text"
                  value={newRule.port}
                  onChange={(e) =>
                    setNewRule((r) => ({ ...r, port: e.target.value }))
                  }
                  placeholder="Port or range"
                  aria-label="Enter port or range"
                />
              </td>
              <td>
                <input
                  className="input-text"
                  type="text"
                  value={newRule.ipRange}
                  onChange={(e) =>
                    setNewRule((r) => ({ ...r, ipRange: e.target.value }))
                  }
                  placeholder="IP Range"
                  aria-label="Enter IP Range"
                />
              </td>
              <td>
                <input
                  className="input-text"
                  type="text"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule((r) => ({ ...r, description: e.target.value }))
                  }
                  placeholder="Description"
                  aria-label="Enter rule description"
                />
              </td>
              <td>
                <button
                  className="button-add"
                  onClick={addRule}
                  aria-label="Add firewall rule"
                  title="Add firewall rule"
                >
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="section-card" aria-label="Firewall Logs">
        <h2 className="section-title">Firewall Logs</h2>
        <div
          className="logs-container"
          tabIndex={0}
          aria-live="polite"
          aria-atomic="true"
        >
          <table className="logs-table" role="grid">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>IP</th>
                <th>Action</th>
                <th>Port</th>
                <th>Protocol</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(({ timestamp, ip, action, port, protocol }, i) => (
                <tr
                  key={i}
                  className={
                    action === "allowed" ? "logs-allowed" : "logs-blocked"
                  }
                >
                  <td>{new Date(timestamp).toLocaleString()}</td>
                  <td>{ip}</td>
                  <td>{action}</td>
                  <td>{port}</td>
                  <td>{protocol.toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
