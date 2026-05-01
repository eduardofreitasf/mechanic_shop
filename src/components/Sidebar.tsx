import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Car, Wrench } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Wrench size={28} color="var(--primary)" />
        <span>Oficina</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Início</span>
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Users size={20} />
          <span>Clientes</span>
        </NavLink>
        <NavLink to="/vehicles" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Car size={20} />
          <span>Veículos</span>
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Wrench size={20} />
          <span>Serviços</span>
        </NavLink>
      </nav>
    </aside>
  );
}
