import { apiConfig } from "./config";
import { http } from "./http";
import { alerts } from "@/mocks/db";
import { mockError, mockResponse } from "@/mocks/helpers";
import type { EmergencyAlert } from "@/types";

const ACTIVE: EmergencyAlert["status"][] = ["enviado", "assumido"];
const DEMO_ID = "a-demo";

/** Alerta de demonstração para a página pública de resposta (/alerta/demo). */
function ensureDemoAlert(): EmergencyAlert {
  const existing = alerts.find((a) => a.id === DEMO_ID);
  if (existing && ACTIVE.includes(existing.status)) return existing;
  if (existing) alerts.splice(alerts.indexOf(existing), 1);

  const now = new Date().toISOString();
  const created: EmergencyAlert = {
    id: DEMO_ID, patientId: "p-maria", createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
    triggeredBy: "Dona Maria", status: "enviado", location: "Rua das Flores, 120 - São Paulo, SP",
    recipients: [
      { caregiverId: "c-ana", status: "enviado", updatedAt: now, channel: "sms", failedChannels: ["app", "whatsapp"] },
      { caregiverId: "c-carlos", status: "enviado", updatedAt: now, channel: "whatsapp", failedChannels: ["app"] },
      { caregiverId: "c-beatriz", status: "enviado", updatedAt: now, channel: "whatsapp" },
    ],
  };
  alerts.push(created);
  return created;
}

export const alertService = {
  async listByPatient(patientId: string): Promise<EmergencyAlert[]> {
    if (!apiConfig.useMocks) return http.get<EmergencyAlert[]>(`/patients/${patientId}/alerts`);
    return mockResponse(
      alerts.filter((a) => a.patientId === patientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  /** Alerta em andamento (enviado ou assumido), se existir. */
  async getActive(patientId: string): Promise<EmergencyAlert | null> {
    if (!apiConfig.useMocks) return http.get<EmergencyAlert | null>(`/patients/${patientId}/alerts/active`);
    return mockResponse(alerts.find((a) => a.patientId === patientId && ACTIVE.includes(a.status)) ?? null);
  },

  /** Usado pela página pública de resposta, aberta pelo link enviado por WhatsApp/SMS. */
  async getById(alertId: string): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.get<EmergencyAlert>(`/alerts/${alertId}`);
    const alert = alertId === "demo" ? ensureDemoAlert() : alerts.find((a) => a.id === alertId);
    return alert ? mockResponse(alert) : mockError("Este alerta não existe ou já foi encerrado.");
  },

  /** Quem recebeu o aviso diz se vai ajudar ("assumiu") ou se não consegue agora ("recusou"). */
  async respond(alertId: string, caregiverId: string, status: "assumiu" | "recusou"): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.post<EmergencyAlert>(`/alerts/${alertId}/respond`, { caregiverId, status });
    const alert = alerts.find((a) => a.id === (alertId === "demo" ? DEMO_ID : alertId));
    if (!alert) return mockError("Alerta não encontrado.");

    const now = new Date().toISOString();
    const recipient = alert.recipients.find((r) => r.caregiverId === caregiverId);
    if (recipient) Object.assign(recipient, { status, updatedAt: now });
    else alert.recipients.push({ caregiverId, status, updatedAt: now });

    if (status === "assumiu" && alert.status === "enviado") {
      alert.status = "assumido";
      alert.assumedByCaregiverId = caregiverId;
      alert.responseTimeSeconds = Math.max(1, Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 1000));
    }
    return mockResponse(alert);
  },

  async resolve(alertId: string, resultNote: string): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.post<EmergencyAlert>(`/alerts/${alertId}/resolve`, { resultNote });
    const alert = alerts.find((a) => a.id === (alertId === "demo" ? DEMO_ID : alertId));
    if (!alert) return mockError("Alerta não encontrado.");
    alert.status = "resolvido";
    alert.resolvedAt = new Date().toISOString();
    alert.resultNote = resultNote;
    return mockResponse(alert);
  },
};
