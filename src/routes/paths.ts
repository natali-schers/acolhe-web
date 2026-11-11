/** Todas as URLs do portal em um só lugar. */
export const paths = {
  login: "/login",
  register: "/cadastro",
  /** Página pública aberta pelo link do WhatsApp/SMS. Use "demo" para testar. */
  alertResponse: (alertId: string) => `/alerta/${alertId}`,
  family: {
    root: "/familia",
    dashboard: "/familia",
    alerts: "/familia/alertas",
    routine: "/familia/rotina",
    prescriptions: "/familia/receitas",
    network: "/familia/rede",
    settings: "/familia/configuracoes",
  },
  doctor: {
    root: "/medico",
    patients: "/medico/pacientes",
    patient: (id: string) => `/medico/pacientes/${id}`,
    newPrescription: (id: string) => `/medico/pacientes/${id}/nova-receita`,
    schedule: "/medico/agenda",
    reports: "/medico/relatorios",
    settings: "/medico/configuracoes",
  },
} as const;
