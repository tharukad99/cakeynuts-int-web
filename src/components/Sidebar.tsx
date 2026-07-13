import { NavLink } from "react-router-dom";
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
      <div className="brand">
        <span role="img" aria-label="cake">🎂</span> CakeyNuts
      </div>

      <div className="section-title">Invoices</div>
      <NavLink to="/invoices/add" className={linkClass} onClick={onClose}>
        Add Invoice
      </NavLink>
      <NavLink to="/invoices/history" className={linkClass} onClick={onClose}>
        View History
      </NavLink>
      <NavLink to="/invoices/update" className={linkClass} onClick={onClose}>
        Update Invoice
      </NavLink>

      <div className="section-title">Ingredients / Inventory</div>
      <NavLink to="/inventory" className={linkClass} onClick={onClose}>
        View All
      </NavLink>
      <NavLink to="/inventory/add" className={linkClass} onClick={onClose}>
        Add Ingredient
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
