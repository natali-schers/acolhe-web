import { useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Check, Clock, Phone, ShieldCheck, UserPlus, X } from "lucide-react";
import styles from "./CareNetworkPage.module.css";
import { Avatar, Button, PageHeader } from "@/components/ui";
import {
  Banner, CaregiverFormModal, CaregiverStatusTag, ChannelTag, QueryState, relationTypeLabels,
} from "@/components/domain";
import { useActivePatient } from "@/hooks/useActivePatient";
import { useCaregivers, useReorderCaregivers } from "@/hooks/useCaregivers";
import type { Caregiver, CaregiverLevel } from "@/types";

function permissionSummary(c: Caregiver) {
  if (c.level === "apoio") return "Só recebe alertas";
  const parts = [];
  if (c.permissions.receivesAlerts) parts.push("Recebe alertas");
  if (c.permissions.canViewRoutine) parts.push("vê a rotina");
  if (c.permissions.canViewHealth) parts.push("vê dados de saúde");
  return parts.length ? parts.join(" • ") : "Sem permissões";
}

interface RowProps {
  caregiver: Caregiver;
  index: number;
  total: number;
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
}

function NetworkRow({ caregiver: c, index, total, busy, onMove, onEdit }: RowProps) {
  return (
    <li className={styles.row}>
      <div className={styles.order}>
        <button aria-label={`Subir ${c.name}`} disabled={index === 0 || busy} onClick={() => onMove(-1)}><ArrowUp size={16} /></button>
        <b>{index + 1}º</b>
        <button aria-label={`Descer ${c.name}`} disabled={index === total - 1 || busy} onClick={() => onMove(1)}><ArrowDown size={16} /></button>
      </div>
      <Avatar initials={c.initials} />
      <span className={styles.who}>
        <b>{c.name}</b>
        <small>{c.relation} • {relationTypeLabels[c.relationType]}</small>
      </span>
      <span className={styles.perms}>
        <small className={styles.phone}><Phone size={14} aria-hidden /> {c.phone}</small>
        <small>{permissionSummary(c)}</small>
        <span className={styles.channels} aria-label="Canais de aviso, em ordem de tentativa">
          {c.channels.map((channel, i) => (
            <span key={channel} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span className={styles.arrow} aria-hidden><ArrowRight size={14} /></span>}
              <ChannelTag channel={channel} tone={i === 0 ? "info" : "neutral"} />
            </span>
          ))}
          <small className={styles.phone}><Clock size={14} aria-hidden /> espera {c.waitMinutes} min</small>
        </span>
      </span>
      <CaregiverStatusTag status={c.status} />
      <Button variant="secondary" size="sm" onClick={onEdit}>Editar</Button>
    </li>
  );
}

function Yes({ children = "Sim" }: { children?: string }) {
  return <span className={styles.yes}><Check size={16} aria-hidden />{children}</span>;
}
function No({ children = "Não" }: { children?: string }) {
  return <span className={styles.no}><X size={16} aria-hidden />{children}</span>;
}

export function CareNetworkPage() {
  const { data: patient } = useActivePatient();
  const patientId = patient?.id ?? "";
  const caregiversQuery = useCaregivers(patientId);
  const reorder = useReorderCaregivers(patientId);
  const [modal, setModal] = useState<{ open: boolean; caregiver: Caregiver | null; level: CaregiverLevel }>({ open: false, caregiver: null, level: "cuidador" });
  const patientName = patient?.name ?? "A pessoa cuidada";

  /** A ordem é uma só: primeiro todos os cuidadores, depois os contatos de apoio. */
  const move = (list: Caregiver[], level: CaregiverLevel, index: number, direction: -1 | 1) => {
    const group = list.filter((c) => c.level === level).map((c) => c.id);
    const rest = list.filter((c) => c.level !== level).map((c) => c.id);
    const target = index + direction;
    [group[index], group[target]] = [group[target], group[index]];
    reorder.mutate(level === "cuidador" ? [...group, ...rest] : [...rest, ...group]);
  };

  const open = (level: CaregiverLevel, caregiver: Caregiver | null = null) => setModal({ open: true, caregiver, level });

  return (
    <>
      <PageHeader
        eyebrow="Pessoas e acessos"
        title="Rede de cuidado"
        description="Quem acompanha o dia a dia e quem só ajuda em emergências. Defina a ordem dos avisos e por qual canal cada pessoa é chamada."
      />

      <Banner
        tone="primary"
        icon={<ShieldCheck size={22} />}
        title={`${patientName} autorizou o compartilhamento`}
        description="Os alertas seguem a ordem abaixo: primeiro os cuidadores, depois os contatos de apoio. Se alguém não responder no tempo combinado, o próximo é avisado."
      />

      <QueryState query={caregiversQuery}>
        {(list) => {
          const caregivers = list.filter((c) => c.level === "cuidador");
          const support = list.filter((c) => c.level === "apoio");
          return (
            <>
              <section className={styles.group} aria-labelledby="grp-cuidadores">
                <div className={styles.groupHead}>
                  <div>
                    <h2 id="grp-cuidadores">Cuidadores</h2>
                    <p>Usam o aplicativo. Veem rotina, remédios e, se você permitir, receitas e consultas.</p>
                  </div>
                  <Button icon={<UserPlus size={18} />} onClick={() => open("cuidador")}>Convidar cuidador</Button>
                </div>
                <ol className={styles.list}>
                  {caregivers.map((c, i) => (
                    <NetworkRow key={c.id} caregiver={c} index={i} total={caregivers.length} busy={reorder.isPending} onMove={(d) => move(list, "cuidador", i, d)} onEdit={() => open("cuidador", c)} />
                  ))}
                  {caregivers.length === 0 && <li className={styles.empty}>Nenhum cuidador ainda.</li>}
                </ol>
              </section>

              <section className={styles.group} aria-labelledby="grp-apoio">
                <div className={styles.groupHead}>
                  <div>
                    <h2 id="grp-apoio">Contatos de apoio</h2>
                    <p>Vizinhos, amigos e parentes que só ajudam em emergências. Recebem o alerta por WhatsApp ou SMS, sem instalar nada.</p>
                  </div>
                  <Button variant="secondary" icon={<UserPlus size={18} />} onClick={() => open("apoio")}>Adicionar contato de apoio</Button>
                </div>
                <ol className={styles.list}>
                  {support.map((c, i) => (
                    <NetworkRow key={c.id} caregiver={c} index={i} total={support.length} busy={reorder.isPending} onMove={(d) => move(list, "apoio", i, d)} onEdit={() => open("apoio", c)} />
                  ))}
                  {support.length === 0 && <li className={styles.empty}>Nenhum contato de apoio ainda.</li>}
                </ol>
              </section>
            </>
          );
        }}
      </QueryState>

      <div className={styles.compareWrap}>
        <table className={styles.compare}>
          <caption>O que cada pessoa pode fazer</caption>
          <thead>
            <tr><th scope="col"><span className="sr-only">Recurso</span></th><th scope="col">Cuidador(a)</th><th scope="col">Contato de apoio</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Recebe alertas de emergência</th><td><Yes /></td><td><Yes /></td></tr>
            <tr><th scope="row">Responde ao alerta</th><td><Yes>No app ou pelo link</Yes></td><td><Yes>Pelo link, sem login</Yes></td></tr>
            <tr><th scope="row">Vê rotina e remédios</th><td><Yes>Se permitido</Yes></td><td><No /></td></tr>
            <tr><th scope="row">Vê receitas e consultas</th><td><Yes>Se permitido</Yes></td><td><No /></td></tr>
            <tr><th scope="row">Precisa instalar o app</th><td><Yes /></td><td><No>Não precisa</No></td></tr>
            <tr><th scope="row">Canais de aviso</th><td>App, WhatsApp, SMS</td><td>WhatsApp, SMS</td></tr>
          </tbody>
        </table>
      </div>

      <CaregiverFormModal
        open={modal.open}
        caregiver={modal.caregiver}
        level={modal.level}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        patientId={patientId}
        patientName={patientName}
      />
    </>
  );
}
