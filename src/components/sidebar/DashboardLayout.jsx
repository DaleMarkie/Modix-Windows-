import React, { useState, useEffect } from "react";
import {
  FaLaptop,
  FaServer,
  FaUser,
  FaChevronDown,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";
import { navLinks } from "./navConfig.ts";
import SidebarUserInfo from "./SidebarUserInfo";

export default function DashboardLayout({ children }) {
  const [serverInfo, setServerInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSubMenu = (href) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const filteredNavLinks = navLinks
    .map(({ label, href, submenu }) => {
      if (!searchTerm) return { label, href, submenu };

      const lowerSearch = searchTerm.toLowerCase();
      const mainMatch = label.toLowerCase().includes(lowerSearch);

      let filteredSubmenu = null;
      if (submenu) {
        filteredSubmenu = submenu.filter((item) =>
          item.label.toLowerCase().includes(lowerSearch)
        );
      }

      if (mainMatch || (filteredSubmenu && filteredSubmenu.length > 0)) {
        return { label, href, submenu: filteredSubmenu };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: none;
        }
        

        .dashboard-root {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          background-image: url('https://images7.alphacoders.com/627/627909.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 65px;
          box-sizing: border-box;
          color: #ddd;
        }

        .dashboard-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(18, 18, 18, 0.7);
          z-index: 0;
        }

        .dashboard-container {
          position: relative;
          z-index: 1;
          display: flex;
          max-width: 1280px;
          width: 100%;
          background-color: #181818;
          border-radius: 16px;
          box-shadow: 0 10px 15px rgba(0,0,0,0.7), inset 0 0 30px rgba(255,255,255,0.03);
          overflow: hidden;
          min-height: 100vh;
        }

        .sidebar {
          background-color: #1c1c1c;
          color: #eee;
          display: flex;
          flex-direction: column;
          user-select: none;
          transition: width 0.3s ease;
          overflow: hidden;
        }
        .sidebar.open {
          width: 195px;
          padding: 16px 10px;
        }
        .sidebar.closed {
          width: 60px;
          padding: 16px 6px;
        }
        .sidebar-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
          gap: 6px;
        }
        .sidebar-header.closed {
          align-items: center;
          gap: 0;
        }
        .sidebar-header.open {
          align-items: flex-start;
          gap: 6px;
        }
        .sidebar-logo-row {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .sidebar-logo-text {
          font-size: 13px;
          font-weight: 600;
          color: white;
          user-select: none;
          flex-grow: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          marin:left: -35px;
        }
        .sidebar-toggle-button {
          border: none;
          background: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 16px;
          padding: 2px 6px;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        .sidebar-toggle-button:hover {
          background-color: #28a745;
        }
        nav {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 6px;
          display: flex;
          flex-direction: column;
        }
        nav ul {
          list-style: none;
          padding-left: 0;
          margin: 0;
          user-select: none;
          flex-shrink: 0;
        }
        nav li {
          margin-bottom: 8px;
        }
        nav li a, nav li button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          font-weight: 600;
          font-size: 14px;
          border-radius: 10px;
          border: none;
          padding: 10px 14px;
          color: #eee;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        nav li a:hover, nav li button:hover {
          background-color: #28a745;
          color: white;
        }
        nav li ul {
          list-style: none;
          margin-top: 6px;
          margin-left: 4px;
          padding-left: 10px;
          border-left: 1px solid #444;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        nav li ul li a {
          padding: 6px 14px;
          font-weight: 500;
          font-size: 13px;
          color: #ccc;
        }
        nav li ul li a:hover {
          background-color: #218838;
          color: white;
        }
        nav li button .icon {
          margin-left: 6px;
          transition: transform 0.3s ease;
          user-select: none;
        }
        nav li button .icon.rotate {
          transform: rotate(90deg);
        }
        .server-info-section {
          background-color: #222;
          border-radius: 10px;
          padding: 12px 14px;
          margin-top: 20px;
          font-size: 12px;
          color: #aaa;
          user-select: none;
          flex-shrink: 0;
        }
        .server-info-item {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          gap: 6px;
          white-space: nowrap;
        }
        .server-info-icon {
          color: #28a745;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }
        .server-info-label {
          font-weight: 600;
          color: #eee;
          flex-shrink: 0;
          min-width: 65px;
          user-select: text;
        }
        .server-info-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          user-select: text;
        }
        .search-input {
          margin-bottom: 16px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #222;
          background-color: #e0e0e0;
          outline: none;
          user-select: text;
        }
        .search-input::placeholder {
          font-weight: 600;
          color: #555;
          font-style: italic;
        }
      `}</style>

      <div className="dashboard-root" role="main" aria-label="Modix Dashboard">
        <div className="dashboard-overlay" aria-hidden="true" />
        <div className="dashboard-container" tabIndex={-1}>
          <aside
            className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
            aria-label="Primary Sidebar Navigation"
          >
            <div
              className={`sidebar-header ${sidebarOpen ? "open" : "closed"}`}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setSidebarOpen((v) => !v);
              }}
            >
              <div
                className="sidebar-logo-row"
                aria-live="polite"
                aria-atomic="true"
              >
                {sidebarOpen && (
                  <span className="sidebar-logo-text">Modix Game Panel</span>
                )}
                <button
                  className="sidebar-toggle-button"
                  aria-pressed={sidebarOpen}
                  aria-label={
                    sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  <FaBars />
                </button>
              </div>
              {sidebarOpen && <SidebarUserInfo />}
            </div>

            <nav aria-label="Main Navigation">
              <input
                type="search"
                placeholder="Search navigation..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Filter navigation items"
                spellCheck={false}
              />
              <ul>
                {filteredNavLinks.map(({ label, href, submenu }) => (
                  <li key={href}>
                    {submenu ? (
                      <>
                        <button
                          onClick={() => toggleSubMenu(href)}
                          aria-expanded={!!openMenus[href]}
                          aria-controls={`submenu-${href}`}
                        >
                          <span>{label}</span>
                          <span
                            className={`icon ${
                              openMenus[href] ? "rotate" : ""
                            }`}
                            aria-hidden="true"
                          >
                            <FaChevronRight />
                          </span>
                        </button>
                        <ul
                          id={`submenu-${href}`}
                          style={{
                            maxHeight: openMenus[href]
                              ? submenu.length * 38 + "px"
                              : "0px",
                          }}
                        >
                          {submenu.map(({ label: subLabel, href: subHref }) => (
                            <li key={subHref}>
                              <a href={subHref}>{subLabel}</a>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <a href={href}>{label}</a>
                    )}
                  </li>
                ))}
              </ul>

              {/* Moved server info section INSIDE nav, just below the nav links */}
              {serverInfo && (
                <section
                  className="server-info-section"
                  aria-label="Server Information"
                >
                  <div className="server-info-item">
                    <span className="server-info-icon" aria-hidden="true">
                      <FaLaptop />
                    </span>
                    <span className="server-info-label">Hostname:</span>
                    <span
                      className="server-info-value"
                      title={serverInfo.hostname}
                    >
                      {serverInfo.hostname}
                    </span>
                  </div>
                  <div className="server-info-item">
                    <span className="server-info-icon" aria-hidden="true">
                      <FaServer />
                    </span>
                    <span className="server-info-label">Container:</span>
                    <span
                      className="server-info-value"
                      title={serverInfo.container}
                    >
                      {serverInfo.container}
                    </span>
                  </div>
                  <div className="server-info-item">
                    <span className="server-info-icon" aria-hidden="true">
                      <FaUser />
                    </span>
                    <span className="server-info-label">Logged In:</span>
                    <span
                      className="server-info-value"
                      title={serverInfo.loggedInUser}
                    >
                      {serverInfo.loggedInUser}
                    </span>
                  </div>
                </section>
              )}
            </nav>

            {/* Sidebar bottom area or footer if needed */}
          </aside>

          <main
            tabIndex={-1}
            style={{
              flexGrow: 1,
              overflowY: "auto",
              padding: "20px 26px",
            }}
            aria-label="Dashboard Content"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
