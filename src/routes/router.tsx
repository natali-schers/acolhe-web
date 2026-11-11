import { createBrowserRouter, Navigate } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AlertResponsePage } from "@/pages/public/AlertResponsePage";
import { NotFoundPage } from "@/pages/shared/NotFoundPage";
import { SettingsPage } from "@/pages/shared/SettingsPage";
import { FamilyDashboardPage } from "@/pages/family/FamilyDashboardPage";
import { AlertsPage } from "@/pages/family/AlertsPage";
import { RoutinePage } from "@/pages/family/RoutinePage";
import { PrescriptionsPage } from "@/pages/family/PrescriptionsPage";
import { CareNetworkPage } from "@/pages/family/CareNetworkPage";
import { PatientsPage } from "@/pages/doctor/PatientsPage";
import { PatientProfilePage } from "@/pages/doctor/PatientProfilePage";
import { NewPrescriptionPage } from "@/pages/doctor/NewPrescriptionPage";
import { SchedulePage } from "@/pages/doctor/SchedulePage";
import { ReportsPage } from "@/pages/doctor/ReportsPage";
import { homePathFor, ProtectedRoute } from "./ProtectedRoute";
import { paths } from "./paths";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePathFor(user.role) : paths.login} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <HomeRedirect /> },
  { path: paths.login, element: <LoginPage /> },
  { path: paths.register, element: <RegisterPage /> },
  { path: "/alerta/:alertId", element: <AlertResponsePage /> },
  {
    path: paths.family.root,
    element: <ProtectedRoute role="familiar"><PortalLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <FamilyDashboardPage /> },
      { path: "alertas", element: <AlertsPage /> },
      { path: "rotina", element: <RoutinePage /> },
      { path: "receitas", element: <PrescriptionsPage /> },
      { path: "rede", element: <CareNetworkPage /> },
      { path: "configuracoes", element: <SettingsPage /> },
    ],
  },
  {
    path: paths.doctor.root,
    element: <ProtectedRoute role="medico"><PortalLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to={paths.doctor.patients} replace /> },
      { path: "pacientes", element: <PatientsPage /> },
      { path: "pacientes/:patientId", element: <PatientProfilePage /> },
      { path: "pacientes/:patientId/nova-receita", element: <NewPrescriptionPage /> },
      { path: "agenda", element: <SchedulePage /> },
      { path: "relatorios", element: <ReportsPage /> },
      { path: "configuracoes", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
