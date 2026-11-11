import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CircleCheck, HandHeart, MapPin, Phone, Siren, UserRoundCheck } from "lucide-react";
import styles from "./AlertResponsePage.module.css";
import { Brand, Button, IconBadge, StatusTag } from "@/components/ui";
import { ChannelTag, QueryState } from "@/components/domain";
import { useAlert, useResolveAlert, useRespondToAlert } from "@/hooks/useCare";
import { useCaregivers } from "@/hooks/useCaregivers";
import { usePatient } from "@/hooks/usePatients";
import type { Caregiver, EmergencyAlert, Patient, RecipientStatus } from "@/types";
import { formatTime, formatTimeAgo } from "@/utils/date";

const statusText: Record<RecipientStatus, { label: string; tone: "neutral" | "info" | "success" | "danger" }> = {
  enviado: { label: "Aviso enviado", tone: "neutral" },
  visto: { label: "Viu o aviso", tone: "info" },
  assumiu: { label: "Está indo ajudar", tone: "success" },
  recusou: { label: "Não pode agora", tone: "danger" },
};

const telHref = (phone: string) => `tel:${phone.replace(/\D/g, "")}`;

/**
 * Página aberta pelo link do WhatsApp/SMS. Não pede login nem instalação:
 * é assim que um contato de apoio (nível 2) responde a um alerta.
 */
export function AlertResponsePage() {
  const { alertId = "demo" } = useParams();
  const [params] = useSearchParams();
  const alertQuery = useAlert(alertId);
  // Em produção o link leva um código próprio de cada contato. Na demonstração, o padrão é a vizinha Beatriz.
  const myId = params.get("c") ?? "c-beatriz";

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <div className={styles.head}>
          <Brand />
          <small className={styles.who}>Aviso de emergência</small>
        </div>
        <QueryState query={alertQuery} loadingLabel="Abrindo o alerta...">
          {(alert) => <AlertView alert={alert} alertId={alertId} myId={myId} />}
        </QueryState>
        <p className={styles.foot}>Em risco de vida, ligue 192 (SAMU) ou 193 (Bombeiros).</p>
      </main>
    </div>
  );
}

function AlertView({ alert, alertId, myId }: { alert: EmergencyAlert; alertId: string; myId: string }) {
  const { data: patient } = usePatient(alert.patientId);
  const { data: caregivers = [] } = useCaregivers(alert.patientId);
  const respond = useRespondToAlert(alertId);
  const resolve = useResolveAlert(alertId);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const me = caregivers.find((c) => c.id === myId);
  const assumedBy = caregivers.find((c) => c.id === alert.assumedByCaregiverId);
  const iAssumed = alert.assumedByCaregiverId === myId;
  const declined = alert.recipients.find((r) => r.caregiverId === myId)?.status === "recusou";
  const phase = alert.status === "resolvido" || alert.status === "cancelado" ? "closed" : iAssumed ? "mine" : alert.status === "assumido" ? "taken" : declined ? "declined" : "open";

  useEffect(() => { headingRef.current?.focus(); }, [phase]);

  const name = patient?.name ?? "A pessoa cuidada";
  const answer = (status: "assumiu" | "recusou") => respond.mutate({ caregiverId: myId, status });

  return (
    <>
      {me && <p className={styles.who}>Você é <b>{me.name}</b>, {me.relation.toLowerCase()} de {name}.</p>}

      {phase === "open" && (
        <>
          <section className={styles.hero}>
            <StatusTag tone="danger" icon={<Siren size={15} className={styles.pulse} />}>Pedido de ajuda</StatusTag>
            <h1 ref={headingRef} tabIndex={-1}>{name} pediu ajuda</h1>
            <p>Há {formatTimeAgo(alert.createdAt).replace("Há ", "")}, às {formatTime(alert.createdAt)}. Você consegue ajudar agora?</p>
          </section>
          <Place alert={alert} patient={patient} />
          <div className={styles.stack}>
            <Button className={styles.big} fullWidth icon={<HandHeart size={22} />} loading={respond.isPending} onClick={() => answer("assumiu")}>Estou indo ajudar</Button>
            <Button className={styles.big} fullWidth variant="secondary" disabled={respond.isPending} onClick={() => answer("recusou")}>Não consigo agora</Button>
          </div>
          <Queue alert={alert} caregivers={caregivers} myId={myId} />
        </>
      )}

      {phase === "declined" && (
        <>
          <section className={`${styles.hero} ${styles.info}`}>
            <h1 ref={headingRef} tabIndex={-1}>Tudo bem, obrigado por avisar</h1>
            <p>Vamos chamar a próxima pessoa da lista. Se mudar de ideia, ainda dá para ajudar.</p>
          </section>
          <Button className={styles.big} fullWidth icon={<HandHeart size={22} />} loading={respond.isPending} onClick={() => answer("assumiu")}>Posso ajudar agora</Button>
          <Queue alert={alert} caregivers={caregivers} myId={myId} />
        </>
      )}

      {phase === "taken" && (
        <>
          <section className={`${styles.hero} ${styles.info}`}>
            <h1 ref={headingRef} tabIndex={-1}>{assumedBy?.name ?? "Alguém"} já está ajudando</h1>
            <p>{name} está sendo atendida. Você não precisa fazer nada agora. Obrigado por estar por perto.</p>
          </section>
          <Place alert={alert} patient={patient} />
          <Queue alert={alert} caregivers={caregivers} myId={myId} />
        </>
      )}

      {phase === "mine" && (
        <>
          <section className={`${styles.hero} ${styles.calm}`}>
            <StatusTag tone="success" icon={<UserRoundCheck size={15} />}>Você assumiu este alerta</StatusTag>
            <h1 ref={headingRef} tabIndex={-1}>Obrigado! A família foi avisada</h1>
            <p>Todos veem que você está indo ajudar {name}.</p>
          </section>
          <section className={styles.card} aria-labelledby="agora">
            <h2 id="agora">O que fazer agora</h2>
            <ol className={styles.todo}>
              <li>
                <b>Ligue para {name}</b>
                {patient?.phone ? <Button fullWidth variant="secondary" icon={<Phone size={20} />} onClick={() => { window.location.href = telHref(patient.phone!); }}>Ligar para {name}</Button> : "Se ela atender, pergunte como está."}
              </li>
              <li><b>Vá até o local</b>{alert.location}<Place alert={alert} patient={patient} bare /></li>
              <li>
                <b>Se ela não responder ou estiver mal, chame socorro</b>
                <div className={styles.emergency}>
                  <Button variant="danger" icon={<Phone size={20} />} onClick={() => { window.location.href = "tel:192"; }}>192 SAMU</Button>
                  <Button variant="dangerOutline" icon={<Phone size={20} />} onClick={() => { window.location.href = "tel:193"; }}>193 Bombeiros</Button>
                </div>
              </li>
            </ol>
          </section>
          <section className={styles.card} aria-labelledby="fim">
            <h2 id="fim">Quando terminar</h2>
            <div className={styles.stack}>
              <Button fullWidth className={styles.big} icon={<CircleCheck size={22} />} loading={resolve.isPending} onClick={() => resolve.mutate("Tudo bem")}>Cheguei e está tudo bem</Button>
              <Button fullWidth variant="secondary" disabled={resolve.isPending} onClick={() => resolve.mutate("Socorro chamado")}>Precisei chamar socorro</Button>
            </div>
          </section>
        </>
      )}

      {phase === "closed" && (
        <section className={`${styles.card} ${styles.center}`}>
          <IconBadge tone="success" round size={64}><CircleCheck size={30} /></IconBadge>
          <h1 ref={headingRef} tabIndex={-1} style={{ margin: "8px 0 0", outline: "none" }}>Alerta encerrado</h1>
          <p>
            {alert.resultNote ? `Resultado: ${alert.resultNote}. ` : ""}
            {assumedBy ? `${assumedBy.name} cuidou da situação. ` : ""}Obrigado por ajudar.
          </p>
        </section>
      )}
    </>
  );
}

function Place({ alert, patient, bare = false }: { alert: EmergencyAlert; patient?: Patient; bare?: boolean }) {
  const address = alert.location ?? patient?.address ?? "";
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const link = <Button fullWidth variant="secondary" icon={<MapPin size={20} />} onClick={() => window.open(maps, "_blank", "noopener")}>Abrir no mapa</Button>;
  if (bare) return <div style={{ marginTop: 8 }}>{link}</div>;
  return (
    <section className={styles.card} aria-label="Onde ela está">
      <div className={styles.address}>
        <IconBadge size={44}><MapPin size={22} /></IconBadge>
        <span><small>Última localização</small><b>{address || "Endereço não informado"}</b></span>
      </div>
      <div style={{ marginTop: 12 }}>{link}</div>
    </section>
  );
}

function Queue({ alert, caregivers, myId }: { alert: EmergencyAlert; caregivers: Caregiver[]; myId: string }) {
  return (
    <section className={styles.card} aria-labelledby="fila">
      <h2 id="fila">Quem foi avisado</h2>
      <ul className={styles.queue}>
        {alert.recipients.map((r) => {
          const c = caregivers.find((x) => x.id === r.caregiverId);
          const s = statusText[r.status];
          return (
            <li key={r.caregiverId}>
              <IconBadge round size={38}>{(c?.initials ?? "?")}</IconBadge>
              <span><b>{c?.name ?? "Contato"}</b>{r.caregiverId === myId && <span className={styles.you}> (você)</span>}</span>
              <span className={styles.tags}>
                <StatusTag tone={s.tone}>{s.label}</StatusTag>
                {r.channel && <ChannelTag channel={r.channel} />}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
