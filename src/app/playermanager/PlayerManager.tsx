"use client";

import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaBan,
  FaCheck,
  FaSearch,
  FaTimes,
  FaUsers,
  FaEye,
  FaClock,
  FaGavel,
  FaEnvelopeOpenText,
} from "react-icons/fa";

const samplePlayers = [
  {
    id: 1,
    name: "PlayerOne",
    active: true,
    time: "5h 30m",
    suspensions: 0,
    bans: 0,
    tickets: 2,
  },
  {
    id: 2,
    name: "NoobMaster",
    active: false,
    time: "3h 12m",
    suspensions: 1,
    bans: 1,
    tickets: 0,
  },
  {
    id: 3,
    name: "StealthNinja",
    active: true,
    time: "12h 44m",
    suspensions: 0,
    bans: 0,
    tickets: 1,
  },
  {
    id: 4,
    name: "CasualGamer",
    active: false,
    time: "7h 21m",
    suspensions: 2,
    bans: 1,
    tickets: 3,
  },
];

const PlayerManager = () => {
  const [players, setPlayers] = useState(samplePlayers);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    player: null,
  });

  useEffect(() => {
    const closeMenu = () =>
      setContextMenu((prev) => ({ ...prev, visible: false }));
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", closeOnEsc);
    return () => {
      document.removeEventListener("click", closeMenu);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filter === "active") return player.active && matchesSearch;
    if (filter === "inactive") return !player.active && matchesSearch;
    return matchesSearch;
  });

  const toggleBan = (id: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const openKickModal = (player) => {
    setSelectedPlayer(player);
    setShowKickModal(true);
  };

  const closeKickModal = () => {
    setSelectedPlayer(null);
    setShowKickModal(false);
  };

  const confirmKick = () => {
    alert(`Kicked ${selectedPlayer.name}`);
    closeKickModal();
  };

  const openViewModal = (player) => {
    setSelectedPlayer(player);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setSelectedPlayer(null);
    setShowViewModal(false);
  };

  const handleContextMenu = (e: React.MouseEvent, player) => {
    e.preventDefault();
    // Position menu within viewport limits to avoid overflow
    const menuWidth = 192; // 48 * 4 (w-48)
    const menuHeight = 120; // approx height
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    setContextMenu({ visible: true, x, y, player });
  };

  return (
    <div className="p-6 bg-zinc-900 text-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <FaUsers className="text-xl" />
        <h2 className="text-2xl font-semibold">Player Manager</h2>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-md w-full md:w-1/2">
          <FaSearch className="text-zinc-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-700 hover:bg-zinc-600"
              }`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-md max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-zinc-300 sticky top-0">
            <tr>
              <th className="text-left px-4 py-2">
                <FaUser className="inline-block mr-1" /> Name
              </th>
              <th className="text-left px-4 py-2">
                <FaClock className="inline-block mr-1" /> Play Time
              </th>
              <th className="text-left px-4 py-2">
                <FaGavel className="inline-block mr-1" /> Suspensions
              </th>
              <th className="text-left px-4 py-2">
                <FaBan className="inline-block mr-1" /> Bans
              </th>
              <th className="text-left px-4 py-2">
                <FaEnvelopeOpenText className="inline-block mr-1" /> Tickets
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-zinc-400">
                  No players found.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  onContextMenu={(e) => handleContextMenu(e, player)}
                  className={`border-b border-zinc-800 cursor-context-menu ${
                    player.active ? "bg-zinc-800" : "bg-zinc-900"
                  } hover:bg-zinc-700 transition-colors`}
                >
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">{player.time}</td>
                  <td className="px-4 py-2">{player.suspensions}</td>
                  <td className="px-4 py-2">{player.bans}</td>
                  <td className="px-4 py-2">{player.tickets}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
{contextMenu.visible && contextMenu.player && (
  <div
    className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg w-56"
    style={{ top: contextMenu.y, left: contextMenu.x }}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      onClick={() => {
        openViewModal(contextMenu.player);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaEye /> View Details
    </button>

    <button
      onClick={() => {
        // You can replace this with actual Steam profile URL logic
        window.open(`https://steamcommunity.com/profiles/${contextMenu.player.id}`, '_blank');
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaUsers /> Steam Profile
    </button>

    <button
      onClick={() => {
        // Replace with actual suspend logic
        alert(`Suspend ${contextMenu.player.name}`);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaGavel /> Suspend
    </button>

    <button
      onClick={() => {
        openKickModal(contextMenu.player);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaTimes /> Kick
    </button>

    <button
      onClick={() => {
        toggleBan(contextMenu.player.id);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaBan /> {contextMenu.player.active ? "Ban" : "Unban"}
    </button>

    <button
      onClick={() => {
        // Placeholder for nickname editor
        const newNick = prompt("Enter a new nickname:", contextMenu.player.name);
        if (newNick) {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === contextMenu.player.id ? { ...p, name: newNick } : p
            )
          );
        }
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaUser /> Edit Nickname
    </button>

    <button
      onClick={() => {
        // Placeholder for note logic
        const note = prompt("Enter note for player:");
        if (note) {
          alert(`Note saved: ${note}`);
          // Optionally, attach this to player metadata
        }
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
      className="w-full text-left px-4 py-2 hover:bg-zinc-700 flex items-center gap-2"
    >
      <FaEnvelopeOpenText /> Add Note
    </button>
  </div>
)}


      {/* Kick Modal */}
      {showKickModal && selectedPlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          onClick={closeKickModal}
        >
          <div
            className="bg-zinc-800 p-6 rounded-md shadow-md max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              Kick {selectedPlayer.name}?
            </h3>
            <p className="text-sm mb-4">
              This will disconnect the player immediately.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmKick}
                className="px-4 py-1 bg-red-600 rounded-md text-white text-sm"
              >
                Confirm
              </button>
              <button
                onClick={closeKickModal}
                className="px-4 py-1 bg-zinc-600 rounded-md text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPlayer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          onClick={closeViewModal}
        >
          <div
            className="bg-zinc-800 p-6 rounded-md shadow-md max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              {selectedPlayer.name} Details
            </h3>
            <ul className="text-sm space-y-1">
              <li>
                <strong>Active:</strong> {selectedPlayer.active ? "Yes" : "No"}
              </li>
              <li>
                <strong>Play Time:</strong> {selectedPlayer.time}
              </li>
              <li>
                <strong>Suspensions:</strong> {selectedPlayer.suspensions}
              </li>
              <li>
                <strong>Bans:</strong> {selectedPlayer.bans}
              </li>
              <li>
                <strong>Tickets:</strong> {selectedPlayer.tickets}
              </li>
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeViewModal}
                className="px-4 py-1 bg-zinc-600 rounded-md text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManager;
