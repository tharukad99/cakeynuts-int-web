import { NavLink } from "react-router-dom";
import "./layout.css";

export default function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "link active" : "link";

  return (
    <aside className="sidebar">
      <div className="brand">
        <span role="img" aria-label="cake">🎂</span> CakeyNuts
      </div>

      <div className="section-title">Invoices</div>
      <NavLink to="/invoices/add" className={linkClass}>
        Add Invoice
      </NavLink>
      <NavLink to="/invoices/history" className={linkClass}>
        View History
      </NavLink>
      <NavLink to="/invoices/update" className={linkClass}>
        Update Invoice
      </NavLink>

      <div className="section-title">Ingredients / Inventory</div>
      <NavLink to="/inventory" className={linkClass}>
        View All
      </NavLink>
      <NavLink to="/inventory/add" className={linkClass}>
        Add Ingredient
      </NavLink>

      <div className="section-title">Cost Calculate</div>
      <NavLink to="/cost/calc" className={linkClass}>
        Calculator
      </NavLink>
      <NavLink to="/cost/history" className={linkClass}>
        History
      </NavLink>

      <div style={{ marginTop: "auto", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
        v1.0.0
      </div>
    </aside>
  );
}
