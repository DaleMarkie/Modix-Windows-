"use client";
import React, { useState } from "react";
import {
  FaDiscord,
  FaCoffee,
  FaCheckCircle,
  FaYoutube,
  FaSteam,
  FaTerminal,
  FaFolderOpen,
  FaUsers,
  FaCogs,
  FaPuzzlePiece,
  FaBug,
  FaShieldAlt,
  FaChartLine,
  FaLink,
} from "react-icons/fa";
import type { IconType } from "react-icons";

import "./Welcome.css";

export default function InstalledPage() {
  const [username, setUsername] = useState("test1");
  const [password, setPassword] = useState("test1");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", username);
      params.append("password", password);
      params.append("scope", "");
      params.append("client_id", "string");
      params.append("client_secret", "********");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: params.toString(),
      });

      const result: { token?: string; message?: string } =
        await response.json();

      if (response.ok) {
        if (result.token) {
          localStorage.setItem("token", result.token);
        }
        window.location.href = "/auth/myaccount";
      } else {
        setError(result.message || "Invalid username or password.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#121212] text-gray-200 px-6 py-12 font-sans flex flex-col items-center justify-center text-center space-y-16 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(0, 255, 128, 0.08), transparent 40%),
            radial-gradient(circle at bottom right, rgba(255, 165, 0, 0.08), transparent 50%)
          `,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          opacity: 0.3,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl space-y-20">
        {/* Hero Section */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          {/* Hero Icon */}
          {React.createElement(
            FaCheckCircle as React.ComponentType<{
              size?: number;
              className?: string;
            }>,
            {
              size: 64,
              className: "text-green-500 mx-auto",
            }
          )}

          <h1 className="text-5xl font-bold text-green-500">
            Modix Game Panel
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-gray-300 leading-relaxed">
            A complete, web-based control panel for game server owners.
            <br />
            <span className="text-white font-semibold">
              Fast, Secure, Free
            </span>{" "}
            — with everything from mod management to real-time analytics.
            <br />
            Developed by The Modix Team: OV3RLORD & GameSmithOnline.
          </p>
          <p className="text-sm text-gray-500 italic">
            v1.1.2 — Unstable Release
          </p>

          {/* Quick Login Box */}
          <div className="mt-6 bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-lg p-6 max-w-sm mx-auto text-left">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">
              🔐 Quick Login
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#121212] border border-gray-600 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded transition"
              >
                🚀 Log In
              </button>
            </form>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <FeatureCard
            icon={FaTerminal}
            title="Live Terminal"
            description="Interact with your servers in real-time: view logs, execute commands, and troubleshoot instantly from anywhere."
            color="text-green-400"
          />
          <FeatureCard
            icon={FaFolderOpen}
            title="File Manager"
            description="Browse, upload, edit, and organize server files seamlessly — directly connected to your server's filesystem."
            color="text-yellow-400"
          />
          <FeatureCard
            icon={FaUsers}
            title="Player Manager"
            description="Monitor and manage connected players: kick, ban, or inspect profiles with full Steam integration."
            color="text-blue-400"
          />
          <FeatureCard
            icon={FaPuzzlePiece}
            title="Mod & Workshop Manager"
            description="Install, update, or remove mods effortlessly. Supports Steam Workshop mods, custom uploads, and manages load order automatically — Modix keeps your server modded safely and reliably."
            color="text-pink-400"
          />
          <FeatureCard
            icon={FaCogs}
            title="Server Settings"
            description="Adjust configuration in real-time with an intuitive schema-driven UI. Collapsible categories and validation make misconfigurations nearly impossible."
            color="text-orange-400"
          />
          <FeatureCard
            icon={FaLink}
            title="Webhook Alerts"
            description="Receive instant notifications for server events, crashes, or player actions through Discord webhooks and automation pipelines."
            color="text-cyan-400"
          />
          <FeatureCard
            icon={FaShieldAlt}
            title="DDoS Monitor"
            description="Protect your servers with real-time traffic monitoring, alerting on unusual activity or potential attacks."
            color="text-red-500"
          />
          <FeatureCard
            icon={FaChartLine}
            title="Performance Dashboard"
            description="View live CPU, RAM, network, disk I/O, uptime, and more for all running servers — Modix gives you complete observability."
            color="text-teal-400"
          />
          <FeatureCard
            icon={FaBug}
            title="Mod Debugger"
            description="Automatically detect broken mods, outdated dependencies, or load-order conflicts. Modix provides actionable suggestions to fix issues without downtime."
            color="text-rose-400"
          />
        </section>

        {/* Community Section */}
        <section className="max-w-lg mx-auto text-sm text-gray-400 space-y-3">
          <p className="text-center font-semibold text-gray-300">
            Need help? Join our support or follow development:
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <CommunityButton
              href="https://discord.gg/EwWZUSR9tM"
              icon={FaDiscord}
              label="Discord"
              className="bg-[#5865f2] hover:bg-[#4752c4]"
            />
            <CommunityButton
              href="https://ko-fi.com/modixgamepanel"
              icon={FaCoffee}
              label="Ko-fi"
              className="bg-[#ff5e57] hover:bg-[#e04a46]"
            />
            <CommunityButton
              href="https://www.youtube.com/@modix_panel"
              icon={FaYoutube}
              label="YouTube"
              className="bg-[#FF0000] hover:bg-[#cc0000]"
            />
            <CommunityButton
              href="https://steamcommunity.com/sharedfiles/filedetails/?id=3422448677"
              icon={FaSteam}
              label="Steam Workshop"
              className="bg-[#171a21] hover:bg-[#0f1114]"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

// -----------------------------
// FeatureCard
// -----------------------------
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: IconType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-[#1e1e1e] rounded-lg p-5 shadow-md hover:shadow-lg transition cursor-default">
      <div className={`flex items-center gap-3 mb-3 text-2xl ${color}`}>
        {React.createElement(
          Icon as React.ComponentType<{ className?: string }>,
          {
            className: color,
          }
        )}
      </div>
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-snug">{description}</p>
    </div>
  );
}

// -----------------------------
// CommunityButton
// -----------------------------
function CommunityButton({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: IconType;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold transition ${className}`}
    >
      {React.createElement(
        Icon as React.ComponentType<{ className?: string }>,
        { className: "inline-block" }
      )}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}
