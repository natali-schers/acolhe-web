import styles from "./MessagePreview.module.css";
import { channelLabels } from "./StatusLabels";
import type { AlertChannel } from "@/types";

interface MessagePreviewProps {
  channel: AlertChannel;
  patientName: string;
  /** "alerta" = mensagem de emergência. "convite" = primeira mensagem ao ser cadastrado. */
  kind?: "alerta" | "convite";
  /** Contatos de apoio não têm o app: o link abre a página de resposta no navegador. */
  needsApp?: boolean;
}

/** Mostra como a mensagem chega no celular de quem foi cadastrado. Simulado: não envia nada de verdade. */
export function MessagePreview({ channel, patientName, kind = "alerta", needsApp = false }: MessagePreviewProps) {
  const isApp = channel === "app";
  return (
    <div className={styles.wrap}>
      <span className={styles.caption}>Pré-visualização • {isApp ? "notificação do aplicativo" : channelLabels[channel]} (simulado)</span>
      <div className={styles.phone}>
        <div className={styles.bubble}>
          {kind === "alerta" ? (
            <>
              <b>ALERTA: {patientName} pediu ajuda</b>
              {isApp
                ? "Toque para ver o endereço e avisar que você vai ajudar."
                : "Abra o link para ver o endereço e avisar se você consegue ajudar. Não precisa instalar nada."}
              {!isApp && <span className={styles.link}>acolhe.app/alerta/x7k2</span>}
            </>
          ) : (
            <>
              <b>Você foi indicado(a) para ajudar {patientName}</b>
              {needsApp
                ? "Baixe o aplicativo Acolhe para acompanhar a rotina e receber alertas."
                : "Você vai receber avisos de emergência por esta conversa. Não precisa instalar nada."}
              <span className={styles.link}>acolhe.app/convite/x7k2</span>
            </>
          )}
          <span className={styles.meta}>Acolhe • agora</span>
        </div>
      </div>
    </div>
  );
}
