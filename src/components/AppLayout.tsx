import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/AuthContext";
import "./layout.css";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="topbar">
          <div className="title">Internal Dashboard</div>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
