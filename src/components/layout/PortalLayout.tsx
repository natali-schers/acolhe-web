import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell, CalendarDays, ChartColumn, FileText, House, LogOut, Menu, Pill, Settings, TriangleAlert, Users, X,
} from "lucide-react";
import styles from "./PortalLayout.module.css";
import { Avatar, Brand } from "@/components/ui";
import { useAuth, useCurrentUser } from "@/contexts/AuthContext";
import { useActiveAlert } from "@/hooks/useCare";
import { usePatient } from "@/hooks/usePatients";
import { paths } from "@/routes/paths";
import { cx } from "@/utils/cx";

const familyNav = [
  { to: paths.family.dashboard, label: "Painel", icon: House, end: true },
  { to: paths.family.alerts, label: "Alertas", icon: TriangleAlert },
  { to: paths.family.routine, label: "Rotina e relatórios", icon: FileText },
  { to: paths.family.prescriptions, label: "Receitas e consultas", icon: Pill },
  { to: paths.family.network, label: "Rede de cuidado", icon: Users },
];

const doctorNav = [
  { to: paths.doctor.patients, label: "Pacientes", icon: Users, end: false },
  { to: paths.doctor.schedule, label: "Agenda", icon: CalendarDays },
  { to: paths.doctor.reports, label: "Relatórios", icon: ChartColumn },
];

export function PortalLayout() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isFamily = user.role === "familiar";
  const nav = isFamily ? familyNav : doctorNav;
  const patientId = isFamily ? user.patientIds[0] : undefined;
  const { data: patient } = usePatient(patientId);
  const { data: activeAlert } = useActiveAlert(patientId ?? "");

  const handleLogout = async () => {
    await logout();
    navigate(paths.login, { replace: true });
  };

  return (
    <div className={styles.shell}>
      <a href="#conteudo" className={styles.skip}>Pular para o conteúdo</a>
      <aside className={cx(styles.aside, menuOpen && styles.open)} aria-label="Menu do portal">
        <div className={styles.asideTop}>
          <Brand inverted />
          <button className={styles.closeMenu} onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><X size={22} /></button>
        </div>

        <div className={styles.context}>
          {isFamily ? (
            <>
              <Avatar initials={patient?.initials ?? "··"} tone="light" />
              <span><small>Você cuida de</small><b>{patient?.name ?? "..."}</b></span>
            </>
          ) : (
            <>
              <Avatar initials={user.initials} tone="light" />
              <span><small>{user.crm}</small><b>{user.name}</b></span>
            </>
          )}
        </div>

        <nav className={styles.nav}>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end ?? false} onClick={() => setMenuOpen(false)} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.asideBottom}>
          <NavLink to={isFamily ? paths.family.settings : paths.doctor.settings} onClick={() => setMenuOpen(false)} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
            <Settings size={20} aria-hidden /> <span>Configurações</span>
          </NavLink>
          <button className={styles.link} onClick={handleLogout}>
            <LogOut size={20} aria-hidden /> <span>Sair</span>
          </button>
        </div>
      </aside>
      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden />}

      <div className={styles.main}>
        <header className={styles.top}>
          <button className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={24} /></button>
          <span className={styles.roleLabel}>{isFamily ? "Portal da família" : "Área médica"}</span>
          <button
            className={styles.bell}
            aria-label={activeAlert ? "Notificações: 1 alerta em andamento" : "Notificações"}
            onClick={() => isFamily && navigate(paths.family.alerts)}
          >
            <Bell size={22} />
            {activeAlert && <span>1</span>}
          </button>
          <span className={styles.userName}>{user.name}</span>
          <Avatar initials={user.initials} size="sm" />
        </header>
        <main id="conteudo" className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
