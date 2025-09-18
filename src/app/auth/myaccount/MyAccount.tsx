"use client";

import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "./MyAccount.css";
import Subscriptions from "../subscriptions/subscriptions";
import Activity from "../activity/Activity";

// ---------------- TAB BUTTON ----------------
const TabButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    className={`tab ${active ? "active" : ""}`}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
  >
    {label}
  </button>
);

// ---------------- NEWS ITEM TYPE ----------------
interface NewsItem {
  title: string;
  description: string;
  date: string;
  link?: string;
}

// ---------------- MY ACCOUNT ----------------
const MyAccount = () => {
  const { user, loading, authenticated, refresh } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("📊 Dashboard");
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/dashboard/news");
        if (res.ok) {
          const data = await res.json();
          setNews(data.news || []);
        }
      } catch (err) {
        console.error("Failed to fetch news", err);
      }
    };
    fetchNews();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    localStorage.clear();
    refresh();
    router.push("/auth/login");
  };

  if (loading) return <div className="loading">Loading account...</div>;
  if (!authenticated || !user)
    return (
      <div className="not-logged">Please log in to access your account.</div>
    );

  const tabs = [
    "📊 Dashboard",
    "🔐 Security",
    "📜 Activity",
    "🪪 My License",
    "💳 Pricing",
    "⚙️ Settings",
    // Support tab removed
  ];

  return (
    <div className="myaccount-container">
      <h1>⚙️ My Account</h1>

      {/* ---------------- TABS ---------------- */}
      <nav className="tabs" aria-label="Account navigation">
        {tabs.map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </nav>

      {/* ---------------- DASHBOARD ---------------- */}
      {activeTab === "📊 Dashboard" && (
        <section className="dashboard-card">
          <div className="dashboard-user-info">
            <h2>Welcome, {user.username}</h2>
            <p>Email: {user.email || "N/A"}</p>
            <p>Status: {user.active ? "Active ✅" : "Inactive ❌"}</p>
            <span>
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </span>
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>

          <div className="dashboard-news">
            <h3>📢 Latest Announcements & Change Logs</h3>
            {news.length ? (
              <div className="news-cards">
                {news.map((item, idx) => (
                  <div key={idx} className="news-card">
                    <div className="news-header">
                      <strong className="news-title">{item.title}</strong>
                      <span className="news-date">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="news-body">
                      <p>{item.description}</p>
                    </div>
                    {item.link && (
                      <div className="news-footer">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-link"
                        >
                          Read More
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-news">
                <p>No news or updates available.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------- SECURITY ---------------- */}
      {activeTab === "🔐 Security" && (
        <section className="card">
          <h3>🔐 Security</h3>
          <ul>
            <li>2FA: {user.tfa_enabled ? "Enabled" : "Disabled"}</li>
            <li>Last Login: {new Date(user.last_login).toLocaleString()}</li>
            <li>Active Sessions: {user.sessions?.length || 0}</li>
          </ul>
          <button className="manage-sessions-btn">Manage Sessions</button>
        </section>
      )}

      {/* ---------------- ACTIVITY ---------------- */}
      {activeTab === "📜 Activity" && <Activity />}

      {/* ---------------- MY LICENSE ---------------- */}
      {activeTab === "🪪 My License" && <Subscriptions />}

      {/* ---------------- SETTINGS ---------------- */}
      {activeTab === "⚙️ Settings" && (
        <section className="card">
          <h3>⚙️ Settings</h3>
          {/* Settings form/components go here */}
        </section>
      )}
    </div>
  );
};

export default MyAccount;
