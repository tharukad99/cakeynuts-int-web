import { NavLink } from "react-router-dom";
import logo from "../assets/bb.png";
import "./layout.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "link active" : "link";

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <img src={logo} alt="CakeyNuts Logo" style={{ height: '100px', width: 'auto', borderRadius: '50%' }} />
        CakeyNuts
      </div>

      <div className="section-title">Invoices</div>
      <NavLink to="/invoices/add" className={linkClass} onClick={onClose}>
        Add Invoice
      </NavLink>
      <NavLink to="/invoices/history" className={linkClass} onClick={onClose}>
        View History
      </NavLink>

      <div className="section-title">Ingredients / Inventory</div>
      <NavLink to="/inventory" className={linkClass} onClick={onClose}>
        Stock
      </NavLink>
      <NavLink to="/inventory/add" className={linkClass} onClick={onClose}>
        Add Stock
      </NavLink>

      <div className="section-title">Cost Calculate</div>
      <NavLink to="/cost/calc" className={linkClass} onClick={onClose}>
        Calculator
      </NavLink>
      <NavLink to="/cost/history" className={linkClass} onClick={onClose}>
        History
      </NavLink>

      <div style={{ marginTop: "auto", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
        v1.0.0
      </div>
    </aside>
  );
}
