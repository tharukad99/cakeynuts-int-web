import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import "./layout.css";

export default function AppLayout() {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
            <div className="title">Internal Dashboard</div>
          </div>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
