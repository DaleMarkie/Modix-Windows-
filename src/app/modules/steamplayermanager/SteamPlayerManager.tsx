import React, { useState, useEffect, useMemo, useRef } from "react";
import "./SteamPlayerManager.css";

interface Player {
  steamId: string;
  name: string;
  containerId: string;
  countryCode: string;
  countryName: string;
  playtime: number; // in hours
  online: boolean;
  lastOnline: Date | null; // new
  vpn: boolean;
  vacBanned: boolean;
  notes: string;
  banned: boolean;
  banReason?: string;  // new
  banDate?: Date | null;  // new
  avatarUrl?: string; // new (derived from steamId)
}

const PAGE_SIZE = 10;

const SteamPlayerManager: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<{ key: keyof Player; asc: boolean }>({ key: "name", asc: true });
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const [showVPNOnly, setShowVPNOnly] = useState(false);
  const [showVACOnly, setShowVACOnly] = useState(false);
  const [modalPlayer, setModalPlayer] = useState<Player | null>(null);
  const [editingNoteSteamId, setEditingNoteSteamId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>("");
  const [containerFilter, setContainerFilter] = useState("all");
  const [availableContainers, setAvailableContainers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contextMenuPlayer, setContextMenuPlayer] = useState<Player | null>(null);
  const contextMenuRef = useRef<HTMLUListElement>(null);
  const [activeTab, setActiveTab] = useState("Details");
  const [showNotesEditor, setShowNotesEditor] = useState(false);

const updatePlayerNotes = (steamId: string, newNotes: string) => {
  setModalPlayer((prev) => prev?.steamId === steamId ? { ...prev, notes: newNotes } : prev);
  // optionally trigger backend save here
};

const updatePlayerTags = (steamId: string, newTags: string[]) => {
  setModalPlayer((prev) => prev?.steamId === steamId ? { ...prev, tags: newTags } : prev);
  // optionally trigger backend save here
};


  useEffect(() => {
    const fetchPlayers = async () => {
      // Dummy players with extended fields
      const dummyPlayers: Player[] = [
        {
          steamId: "76561198000000001",
          name: "OV3RLORD",
          containerId: "pz-server-1",
          countryCode: "UK",
          countryName: "Scotland",
          playtime: 123,
          online: true,
          lastOnline: new Date(),
          vpn: false,
          vacBanned: false,
          notes: "Active daily.",
          banned: false,
          avatarUrl: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/00/0000000000000000000000000000000000000000_full.jpg`,
        },
        {
          steamId: "76561198000000002",
          name: "GameSmithOnline",
          containerId: "pz-server-2",
          countryCode: "US",
          countryName: "United States",
          playtime: 456,
          online: false,
          lastOnline: new Date(Date.now() - 3600 * 24 * 1000 * 3), // 3 days ago
          vpn: true,
          vacBanned: true,
          notes: "Possible cheater.",
          banned: true,
          banReason: "VAC ban for cheating",
          banDate: new Date(Date.now() - 3600 * 24 * 1000 * 10),
          avatarUrl: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/01/0101010101010101010101010101010101010101_full.jpg`,
        },
        {
          steamId: "76561198000000003",
          name: "ApocQueen",
          containerId: "pz-server-1",
          countryCode: "DE",
          countryName: "Germany",
          playtime: 89,
          online: true,
          lastOnline: new Date(),
          vpn: false,
          vacBanned: false,
          notes: "Very friendly player.",
          banned: false,
          avatarUrl: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/02/0202020202020202020202020202020202020202_full.jpg`,
        },
        {
          steamId: "76561198347512345",
          name: "ModixAdmin",
          containerId: "pz-server-3",
          countryCode: "CA",
          countryName: "Canada",
          playtime: 999,
          online: true,
          lastOnline: new Date(),
          vpn: false,
          vacBanned: false,
          notes: "This is you.",
          banned: false,
          avatarUrl: `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/03/0303030303030303030303030303030303030303_full.jpg`,
        },
      ];

      setPlayers(dummyPlayers);
      const containers = [...new Set(dummyPlayers.map((p) => p.containerId))];
      setAvailableContainers(containers);
    };

    fetchPlayers();
  }, []);

  // Sorting helper
  const toggleSort = (key: keyof Player) => {
    setSortOption((current) => {
      if (current.key === key) return { key, asc: !current.asc };
      return { key, asc: true };
    });
  };

  // Filter + sort + paginate players
  const filteredPlayers = useMemo(() => {
    let filtered = players;

    if (containerFilter !== "all") filtered = filtered.filter((p) => p.containerId === containerFilter);
    if (showBannedOnly) filtered = filtered.filter((p) => p.banned);
    if (showVPNOnly) filtered = filtered.filter((p) => p.vpn);
    if (showVACOnly) filtered = filtered.filter((p) => p.vacBanned);
    if (searchQuery.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.steamId.includes(searchQuery)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const key = sortOption.key;
      let aVal = a[key];
      let bVal = b[key];

      // For date fields, convert to timestamp
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOption.asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOption.asc ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [players, searchQuery, sortOption, showBannedOnly, showVPNOnly, showVACOnly, containerFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // Handle right-click on player row
  const handleContextMenu = (e: React.MouseEvent, player: Player) => {
    e.preventDefault();

    const clickX = e.clientX;
    const clickY = e.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = contextMenuRef.current?.offsetWidth || 150;
    const rootH = contextMenuRef.current?.offsetHeight || 150;

    const x = clickX + rootW > screenW ? screenW - rootW - 10 : clickX;
    const y = clickY + rootH > screenH ? screenH - rootH - 10 : clickY;

    setContextMenuPosition({ x, y });
    setContextMenuPlayer(player);
    setContextMenuVisible(true);
  };

  // Hide context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenuVisible) setContextMenuVisible(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenuVisible]);

  // Confirmation modals for kick/ban/unban
  const [confirmAction, setConfirmAction] = useState<{ action: "kick" | "ban" | "unban"; player: Player } | null>(null);

  const performAction = () => {
    if (!confirmAction) return;
    alert(`${confirmAction.action.toUpperCase()} player ${confirmAction.player.name}`);
    setConfirmAction(null);

    // TODO: Implement real backend call to kick/ban/unban here
    if (confirmAction.action === "ban") {
      setPlayers((prev) =>
        prev.map((p) =>
          p.steamId === confirmAction.player.steamId ? { ...p, banned: true, banDate: new Date(), banReason: "Admin ban" } : p
        )
      );
    } else if (confirmAction.action === "unban") {
      setPlayers((prev) =>
        prev.map((p) => (p.steamId === confirmAction.player.steamId ? { ...p, banned: false, banReason: "", banDate: null } : p))
      );
    }
  };

  // Inline note editing
  const startEditingNote = (steamId: string, currentNote: string) => {
    setEditingNoteSteamId(steamId);
    setNoteInput(currentNote);
  };
  const saveNote = (steamId: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.steamId === steamId ? { ...p, notes: noteInput } : p))
    );
    setEditingNoteSteamId(null);
  };
  const cancelNoteEdit = () => {
    setEditingNoteSteamId(null);
  };

  // Helper to format date difference nicely
  const timeSince = (date: Date | null) => {
    if (!date) return "N/A";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="steam-player-manager">
      <h2>RCON Player Manager</h2>
      <p className="text-sm text-neutral-400 mb-4 max-w-3xl">
      The Player Manager provides real-time visibility into all connected and historical players on your server.
      Use the search to filter by name or SteamID, then click on a player to access detailed administrative tools, ban history,
      chat logs, and security flags like VPN detection. This is your central hub for managing community activity,
      enforcing rules, and taking quick action when needed.
    </p>
      <div className="spm-controls">
        <input
          type="text"
          placeholder="Search by player name or SteamID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="sort-controls">
          Sort by:{" "}
          {(["name", "playtime", "countryName", "lastOnline"] as (keyof Player)[]).map((key) => (
            <button
              key={key}
              className={sortOption.key === key ? "active" : ""}
              onClick={() => toggleSort(key)}
              title={`Sort by ${key}`}
            >
              {key}
              {sortOption.key === key && (sortOption.asc ? " ▲" : " ▼")}
            </button>
          ))}
        </div>

        <div className="filter-checkboxes">
          <label>
            <input type="checkbox" checked={showBannedOnly} onChange={() => setShowBannedOnly((v) => !v)} /> Show Banned Only
          </label>
          <label>
            <input type="checkbox" checked={showVPNOnly} onChange={() => setShowVPNOnly((v) => !v)} /> VPN Only
          </label>
          <label>
            <input type="checkbox" checked={showVACOnly} onChange={() => setShowVACOnly((v) => !v)} /> VAC Banned Only
          </label>
        </div>

        <div className="container-filter">
          <label htmlFor="containerFilter">Container:</label>
          <select id="containerFilter" value={containerFilter} onChange={(e) => setContainerFilter(e.target.value)}>
            <option value="all">All</option>
            {availableContainers.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination-controls">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            &lt; Prev
          </button>
          <span>
            Page {currentPage} / {totalPages || 1}
          </span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next &gt;
          </button>
        </div>
      </div>

      <table className="spm-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>SteamID</th>
            <th>Country</th>
            <th>Playtime (hrs)</th>
            <th>Online</th>
            <th>Last Online</th>
            <th>VPN</th>
            <th>VAC Ban</th>
            <th>Banned</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPlayers.length === 0 && (
            <tr>
              <td colSpan={11} style={{ textAlign: "center" }}>
                No players found.
              </td>
            </tr>
          )}
          {paginatedPlayers.map((player) => (
            <tr
              key={player.steamId}
              className={player.banned ? "banned-player" : ""}
              onContextMenu={(e) => handleContextMenu(e, player)}
              onDoubleClick={() => setModalPlayer(player)}
              title="Right-click for actions, double-click for details"
            >
              <td>
                <img
                  src={player.avatarUrl || `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/00/0000000000000000000000000000000000000000_full.jpg`}
                  alt={`${player.name} avatar`}
                  className="avatar-img"
                />
              </td>
              <td>{player.name}</td>
              <td>{player.steamId}</td>
              <td title={player.countryName}>{player.countryCode}</td>
              <td>{player.playtime}</td>
              <td>{player.online ? "🟢" : "⚪"}</td>
              <td>{player.lastOnline ? timeSince(player.lastOnline) : "N/A"}</td>
              <td>{player.vpn ? "✅" : "❌"}</td>
              <td>{player.vacBanned ? "✅" : "❌"}</td>
              <td>{player.banned ? "🚫" : "✅"}</td>
              <td>
                {editingNoteSteamId === player.steamId ? (
                  <>
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveNote(player.steamId);
                        if (e.key === "Escape") cancelNoteEdit();
                      }}
                      autoFocus
                    />
                    <button onClick={() => saveNote(player.steamId)}>Save</button>
                    <button onClick={cancelNoteEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{player.notes || "—"}</span>{" "}
                    <button onClick={() => startEditingNote(player.steamId, player.notes)}>Edit</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {contextMenuVisible && contextMenuPlayer && (
  <ul
    ref={contextMenuRef}
    className="fixed z-[9999] w-56 rounded-md border border-neutral-700 bg-neutral-900 text-sm text-white shadow-lg"
    style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
  >
    <li className="px-4 py-2 font-semibold text-neutral-300">Player: {contextMenuPlayer.name}</li>
    <hr className="border-neutral-700" />

    {/* Info / Utility */}
    <li className="menu-item" onClick={() => { setModalPlayer(contextMenuPlayer); setContextMenuVisible(false); }}>
      View Details
    </li>
    <li className="menu-item" onClick={() => { navigator.clipboard.writeText(contextMenuPlayer.steamId); setContextMenuVisible(false); }}>
      Copy Steam ID
    </li>
    <li className="menu-item" onClick={() => { navigator.clipboard.writeText(contextMenuPlayer.ip); setContextMenuVisible(false); }}>
      Copy IP Address
    </li>
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "message", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Send Private Message
    </li>
    <li
  className="menu-item"
  onClick={() => {
    setConfirmAction({ action: "message", player: contextMenuPlayer });
    setContextMenuVisible(false);
    setActiveTab("Export Player Data");
    setModalPlayer(contextMenuPlayer); // Make sure this is the player to export
  }}
>
  Export Player Data *Webhook
</li>


    <hr className="border-neutral-700" />

    {/* Admin Actions */}
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "teleportTo", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Teleport to Player
    </li>
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "bringPlayer", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Bring Player to Me
    </li>
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "heal", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Heal Player
    </li>
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "kill", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Kill Player
    </li>

    <hr className="border-neutral-700" />

    {/* Moderation */}
    {!contextMenuPlayer.banned && (
      <>
        <li className="menu-item" onClick={() => { setConfirmAction({ action: "kick", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
          Kick Player
        </li>
        <li className="menu-item" onClick={() => { setConfirmAction({ action: "ban", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
          Ban Player
        </li>
      </>
    )}
    {contextMenuPlayer.banned && (
      <li className="menu-item" onClick={() => { setConfirmAction({ action: "unban", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
        Unban Player
      </li>
    )}
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "warn", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Issue Warning
    </li>
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "mute", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Mute Player
    </li>
    <li className="menu-item" onClick={() => { setConfirmAction({ action: "unmute", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Unmute Player
    </li>


    <hr className="border-neutral-700" />

    {/* Danger */}
    <li className="menu-item text-red-400" onClick={() => { setConfirmAction({ action: "reset", player: contextMenuPlayer }); setContextMenuVisible(false); }}>
      Reset Player Data
    </li>
  </ul>
)}
<style jsx>{`
  .menu-item {
    @apply px-4 py-2 cursor-pointer hover:bg-neutral-800 transition;
  }
`}</style>


      {/* Player Detail Modal */}
      {modalPlayer && (
  <div
    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
    onClick={() => setModalPlayer(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4">
          <img
            src={modalPlayer.avatarUrl}
            alt="Avatar"
            className="w-14 h-14 rounded-full border border-neutral-700"
          />
          <div>
            <h2 className="text-xl font-semibold text-white">{modalPlayer.name}</h2>
            <p className="text-xs text-neutral-400">Steam ID: {modalPlayer.steamId}</p>
          </div>
        </div>
        <button
          className="text-neutral-500 hover:text-white text-2xl"
          onClick={() => setModalPlayer(null)}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-4 border-b border-neutral-800">
        {["🌍 Overview", "🛠️ Admin Tools","🧾 Logs","🛡️ Security","📌 Notes & Tags", "📅 History"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-md font-medium transition-colors ${
              activeTab === tab
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {activeTab === "🧾 Logs" && (
  <div className="max-h-[420px] overflow-y-auto p-4 bg-neutral-900 rounded-md border border-neutral-700 shadow-inner text-neutral-200 font-mono text-sm">
    <h3 className="mb-4 text-lg font-semibold border-b border-neutral-700 pb-2 flex items-center gap-2">
      🧾 Player Activity Logs
    </h3>

    <ul className="space-y-3">
      {[
        {
          message: "Player connected from IP 192.168.1.42",
          type: "info",
          timestamp: "2025-07-08T18:23:14Z",
        },
        {
          message: "Entered safe zone (Sector B2)",
          type: "event",
          timestamp: "2025-07-08T18:26:03Z",
        },
        {
          message: "Attempted unauthorized container access at /locker_03",
          type: "warning",
          timestamp: "2025-07-08T18:27:18Z",
        },
        {
          message: "Triggered anti-cheat: abnormal speed detected (ID: SP-AX9)",
          type: "error",
          timestamp: "2025-07-08T18:28:07Z",
        },
        {
          message: "Disconnected: User timeout",
          type: "info",
          timestamp: "2025-07-08T18:29:45Z",
        },
        {
          message: "Reconnected from new IP 192.168.1.43",
          type: "info",
          timestamp: "2025-07-08T18:31:10Z",
        },
        {
          message: "Banned by admin (Reason: Speedhack abuse)",
          type: "error",
          timestamp: "2025-07-08T18:33:52Z",
        },
      ].map((log, idx) => {
        const typeIcon =
          log.type === "error"
            ? "❌"
            : log.type === "warning"
            ? "⚠️"
            : log.type === "event"
            ? "📌"
            : "ℹ️";

        const tagColor =
          log.type === "error"
            ? "bg-red-600 text-white"
            : log.type === "warning"
            ? "bg-yellow-400 text-black"
            : log.type === "event"
            ? "bg-blue-600 text-white"
            : "bg-neutral-600 text-white";

        return (
          <li
            key={idx}
            className="flex items-start justify-between bg-neutral-800 rounded-md px-4 py-3 hover:bg-neutral-700 transition-colors shadow-sm border border-neutral-700"
          >
            <div className="flex-1 pr-4 space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-lg">{typeIcon}</span>
                <span className="text-neutral-100">{log.message}</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
            <div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${tagColor}`}>
                {log.type}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
)}


      

      {/* Notes & Tags Tab */}
{activeTab === "📌 Notes & Tags" && (
  <div className="w-full max-w-full p-4 bg-neutral-900 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-semibold text-neutral-300">Notes</label>
        <textarea
          className="w-full rounded bg-neutral-800 p-3 border border-neutral-700 resize-y text-white"
          rows={8}
          value={modalPlayer.notes || ""}
          onChange={(e) => updatePlayerNotes(modalPlayer.steamId, e.target.value)}
          placeholder="Enter notes about this player..."
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold text-neutral-300">Tags</label>
        <input
          type="text"
          className="w-full rounded bg-neutral-800 p-3 border border-neutral-700 text-white"
          value={modalPlayer.tags?.join(", ") || ""}
          onChange={(e) => updatePlayerTags(modalPlayer.steamId, e.target.value.split(",").map(tag => tag.trim()))}
          placeholder="e.g. friendly, troublemaker, VIP"
        />
      </div>
    </div>
  </div>
)}



      

      {/* Content */}
      <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === "🌍 Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p><span className="text-neutral-400">Country:</span> {modalPlayer.countryName} ({modalPlayer.countryCode})</p>
              <p><span className="text-neutral-400">Playtime:</span> {modalPlayer.playtime} hrs</p>
              <p><span className="text-neutral-400">Online:</span> {modalPlayer.online ? "Yes" : "No"}</p>
              <p><span className="text-neutral-400">Last Online:</span> {modalPlayer.lastOnline?.toLocaleString() || "N/A"} <span className="text-xs">({timeSince(modalPlayer.lastOnline)})</span></p>
              <p><span className="text-neutral-400">VPN:</span> {modalPlayer.vpn ? "Yes" : "No"}</p>
            </div>

            <div className="space-y-2 text-sm">
              <p><span className="text-neutral-400">VAC Banned:</span> {modalPlayer.vacBanned ? "Yes" : "No"}</p>
              <p><span className="text-neutral-400">Banned:</span> {modalPlayer.banned ? `Yes (Reason: ${modalPlayer.banReason ?? "Unknown"}, Date: ${modalPlayer.banDate?.toLocaleDateString() ?? "Unknown"})` : "No"}</p>
              <p><span className="text-neutral-400">Notes:</span> {modalPlayer.notes || "None"}</p>
              <div className="mt-3">
                <button
                  onClick={() => navigator.clipboard.writeText(modalPlayer.steamId)}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  Copy Steam ID
                </button>
                
              </div>
            </div>
          </div>
        )}

{/* Admin Tools Tab */}

{activeTab === "🛠️ Admin Tools" && (
  <>
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      <button onClick={() => setConfirmAction({ action: "kick", player: modalPlayer })} className="btn-admin-action">👢 Kick Player</button>
      <button onClick={() => setConfirmAction({ action: "ban", player: modalPlayer })} className="btn-admin-action">🚫 Ban Player</button>
      <button onClick={() => setConfirmAction({ action: "message", player: modalPlayer })} className="btn-admin-action">💬 Send Message</button>
      <button onClick={() => setConfirmAction({ action: "teleportTo", player: modalPlayer })} className="btn-admin-action">🧭 Teleport to Player</button>
      <button onClick={() => setConfirmAction({ action: "bringPlayer", player: modalPlayer })} className="btn-admin-action">🧲 Bring to Me</button>
      <button onClick={() => setConfirmAction({ action: "heal", player: modalPlayer })} className="btn-admin-action">⚰️ Revive Player</button>
      <button onClick={() => setConfirmAction({ action: "heal", player: modalPlayer })} className="btn-admin-action">❄️ Freeze Player</button>
      <button onClick={() => setConfirmAction({ action: "heal", player: modalPlayer })} className="btn-admin-action">🔓 Unfreeze Player</button>
      <button onClick={() => setConfirmAction({ action: "heal", player: modalPlayer })} className="btn-admin-action">🕵️‍♂️ Spectate Player</button>
      <button onClick={() => setConfirmAction({ action: "heal", player: modalPlayer })} className="btn-admin-action">🔇 Mute Player</button>
      <button onClick={() => setConfirmAction({ action: "heal", player: modalPlayer })} className="btn-admin-action">🔊 Unmute Player</button>



      {/* Toggle Inline Notes Editor */}
      <button
        onClick={() => setShowNotesEditor(prev => !prev)}
        className="btn-admin-action col-span-full sm:col-span-2 md:col-span-1"
      >
        📝 {showNotesEditor ? "Hide Notes & Tags" : "Notes & Tags"}
      </button>
    </div>

    {/* Inline Notes/Tags Editor */}
    {showNotesEditor && (
      <div className="mt-4 border border-neutral-700 rounded-lg p-4 bg-neutral-800 space-y-3 text-sm text-white">
        <div>
          <label className="block mb-1 font-semibold text-neutral-300">Notes</label>
          <textarea
            className="w-full rounded bg-neutral-900 p-2 border border-neutral-700 resize-none"
            rows={4}
            value={modalPlayer.notes || ""}
            onChange={(e) => updatePlayerNotes(modalPlayer.steamId, e.target.value)}
            placeholder="Enter notes about this player..."
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-neutral-300">Tags</label>
          <input
            type="text"
            className="w-full rounded bg-neutral-900 p-2 border border-neutral-700"
            value={modalPlayer.tags?.join(", ") || ""}
            onChange={(e) => updatePlayerTags(modalPlayer.steamId, e.target.value.split(",").map(tag => tag.trim()))}
            placeholder="e.g. friendly, troublemaker, VIP"
          />
        </div>

        <div className="text-right">
          <button
            onClick={() => setShowNotesEditor(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded"
          >
            Done
          </button>
        </div>
      </div>
    )}
  </>
)}



{/* Export Player Data Tab */}
{activeTab === "Export Player Data" && (
  <div className="p-4 max-w-lg bg-neutral-900 rounded border border-neutral-700 text-white space-y-4">
    <h3 className="font-semibold text-lg mb-2">Export Player Data</h3>
    <p>
      Export data for player: <span className="font-mono">{modalPlayer?.steamId}</span>
    </p>

    {/* Example export info */}
    <pre className="bg-neutral-800 p-3 rounded overflow-x-auto text-sm max-h-48 overflow-y-auto">
      {JSON.stringify(modalPlayer, null, 2)}
    </pre>

    {/* Export button */}
    <button
      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      onClick={() => {
        // Your webhook export logic here
        alert(`Exported data for player ${modalPlayer?.steamId}`);
      }}
    >
      Export via Webhook
    </button>
  </div>
)}

        {/* Security Tab */}
{activeTab === "🛡️ Security" && (
  <div className="text-sm text-neutral-300 max-h-[360px] overflow-y-auto p-4 bg-neutral-900 rounded-md border border-neutral-700 shadow-inner">
    <h3 className="mb-4 text-lg font-semibold text-indigo-400 border-b border-neutral-700 pb-2 flex items-center gap-2">
      🛡️ Player Security Overview
    </h3>

    <ul className="space-y-3">
      <li className="flex justify-between items-center">
        <span>🖥️ Last IP Connected:</span>
        <code className="font-mono bg-neutral-800 px-2 py-1 rounded">{modalPlayer.ip || "Unknown"}</code>
      </li>

      <li className="flex justify-between items-center">
        <span>⏳ Last Session Duration:</span>
        <span>{modalPlayer.sessionDuration ? `${modalPlayer.sessionDuration} minutes` : "N/A"}</span>
      </li>

      <li className="flex justify-between items-center">
        <span>🔌 Connection Status:</span>
        <span className={modalPlayer.online ? "text-green-400" : "text-red-400"}>
          {modalPlayer.online ? "Online" : "Offline"}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <span>🚩 VPN Detected:</span>
        <span className={modalPlayer.vpn ? "text-yellow-400 font-semibold" : "text-neutral-500"}>
          {modalPlayer.vpn ? "Yes" : "No"}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <span>⛔ Banned Status:</span>
        {modalPlayer.banned ? (
          <div className="flex flex-col items-end">
            <span className="text-red-500 font-semibold">BANNED</span>
            <span className="text-xs text-neutral-400">
              Reason: {modalPlayer.banReason ?? "No reason provided"}
            </span>
            <span className="text-xs text-neutral-400">
              Date: {modalPlayer.banDate ? modalPlayer.banDate.toLocaleDateString() : "Unknown"}
            </span>
          </div>
        ) : (
          <span className="text-green-400 font-semibold">Not banned</span>
        )}
      </li>

      <li className="flex justify-between items-center">
        <span>🕵️‍♂️ Suspicious Activity Flags:</span>
        <span className="text-neutral-400">
          {modalPlayer.suspiciousFlags && modalPlayer.suspiciousFlags.length > 0
            ? modalPlayer.suspiciousFlags.join(", ")
            : "None"}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <span>🗓️ Last Login:</span>
        <span>
          {modalPlayer.lastOnline
            ? modalPlayer.lastOnline.toLocaleString()
            : "Unknown"}
        </span>
      </li>

      <li className="flex justify-between items-center">
        <span>🔐 Account Security Notes:</span>
        <span className="italic text-neutral-400">
          {modalPlayer.securityNotes || "No additional notes"}
        </span>
      </li>
    </ul>
  </div>
)}


        {/* History Tab */}
{activeTab === "📅 History" && (
  <div className="text-sm text-neutral-300 max-h-[360px] overflow-y-auto p-4 bg-neutral-900 rounded border border-neutral-700 shadow-md">
    <p className="mb-4 text-neutral-400 font-semibold text-lg flex items-center space-x-2">
      <span>📅</span>
      <span>Ban / Connection History</span>
      <span className="text-xs italic text-neutral-500">(Detailed audit trail)</span>
    </p>

    <ul className="list-disc list-inside space-y-3">
      <li>
        <strong>🟢 Connected:</strong>{" "}
        <time
          dateTime="2025-06-14T00:00:00Z"
          title={new Date("2025-06-14T00:00:00Z").toLocaleString()}
          className="font-mono"
        >
          June 14, 2025
        </time>{" "}
        from IP <span className="font-mono">{modalPlayer.ip}</span>
      </li>

      <li>
        <strong>🔴 Disconnected:</strong>{" "}
        <time
          dateTime="2025-06-14T16:21:00Z"
          title={new Date("2025-06-14T16:21:00Z").toLocaleString()}
          className="font-mono"
        >
          June 14, 2025 16:21
        </time>{" "}
        <em>(Timeout)</em>
      </li>

      {modalPlayer.banned && (
        <li>
          <strong>⛔ Banned:</strong>{" "}
          <time
            dateTime={modalPlayer.banDate?.toISOString() ?? undefined}
            title={modalPlayer.banDate?.toLocaleString() ?? "Unknown"}
            className="font-mono"
          >
            {modalPlayer.banDate?.toLocaleDateString() ?? "Unknown Date"}
          </time>{" "}
          — <em>{modalPlayer.banReason ?? "No reason provided"}</em>
        </li>
      )}

      <li>
        <strong>🕵️‍♂️ VPN Flagged:</strong>{" "}
        <span className={modalPlayer.vpn ? "text-red-400 font-semibold" : "text-green-400"}>
          {modalPlayer.vpn ? "Yes" : "No"}
        </span>
      </li>

      <li>
        <strong>🕒 Last Play Session:</strong>{" "}
        <time
          dateTime={modalPlayer.lastOnline?.toISOString() ?? undefined}
          title={modalPlayer.lastOnline?.toLocaleString() || "Unknown"}
          className="font-mono"
        >
          {modalPlayer.lastOnline?.toLocaleString() || "Unknown"}
        </time>
      </li>

      {/* Additional Details */}
      <li>
        <strong>🛡️ Security Notes:</strong>{" "}
        <em>{modalPlayer.securityNotes || "No additional security notes available."}</em>
      </li>

      <li>
        <strong>📍 Last Known Location:</strong>{" "}
        <span>{modalPlayer.location || "Unknown"}</span>
      </li>
    </ul>
  </div>
)}


      </div>
    </div>
  </div>
)}


      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="modal-backdrop" onClick={() => setConfirmAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              Confirm {confirmAction.action.charAt(0).toUpperCase() + confirmAction.action.slice(1)} Player
            </h3>
            <p>
              Are you sure you want to <b>{confirmAction.action}</b> player{" "}
              <b>{confirmAction.player.name}</b> (SteamID: {confirmAction.player.steamId})?
            </p>
            <button onClick={performAction}>Yes</button>
            <button onClick={() => setConfirmAction(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SteamPlayerManager;
