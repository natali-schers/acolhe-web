import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Eye, EyeOff, HeartPulse, LoaderCircle, Plus, ShieldCheck, Smartphone, Stethoscope, Trash2, Users,
} from "lucide-react";
import styles from "./RegisterPage.module.css";
import { Brand, Button, Eyebrow, IconBadge, SelectField, Tabs, TextField } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { homePathFor } from "@/routes/ProtectedRoute";
import { paths } from "@/routes/paths";
import { patientService } from "@/services";
import type { Patient, RegisterInput, UserRole } from "@/types";

type Profile = "familiar" | "pessoa" | "medico";
type Errors = Record<string, string>;

const profiles: { id: Profile; title: string; description: string; hint: string; icon: typeof Users }[] = [
  { id: "familiar", title: "Sou cuidador(a)", description: "Familiar, vizinho ou amigo que acompanha uma pessoa. Recebe alertas e vê a rotina.", hint: "Funciona no computador e no celular", icon: Users },
  { id: "pessoa", title: "Sou a pessoa cuidada", description: "Quero um botão de ajuda e lembretes dos meus remédios.", hint: "Funciona no celular", icon: HeartPulse },
  { id: "medico", title: "Sou médico(a)", description: "Prescrevo e acompanho meus pacientes pelo computador.", hint: "Funciona no computador", icon: Stethoscope },
];

const stepNames: Record<"familiar" | "medico", string[]> = {
  familiar: ["Seus dados", "Consentimento", "Pessoa cuidada", "Contatos de apoio"],
  medico: ["Seus dados", "Profissão", "Termos de uso", "Verificação"],
};

const ufs = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const specialties = ["Clínica geral", "Geriatria", "Cardiologia", "Endocrinologia", "Neurologia", "Outra"];

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());
const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;

interface FormData {
  name: string; email: string; phone: string; password: string;
  consent: boolean; terms: boolean;
  patientMode: "code" | "new"; code: string; newName: string; birthYear: string; city: string;
  contacts: { name: string; phone: string }[];
  crm: string; uf: string; specialty: string;
}

const initialData: FormData = {
  name: "", email: "", phone: "", password: "", consent: false, terms: false,
  patientMode: "code", code: "", newName: "", birthYear: "", city: "",
  contacts: [{ name: "", phone: "" }], crm: "", uf: "SP", specialty: specialties[0],
};

type Finished = { role: UserRole; patientName?: string; code?: string };

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialProfile = params.get("perfil");

  const [profile, setProfile] = useState<Profile | null>(
    initialProfile === "familiar" || initialProfile === "pessoa" || initialProfile === "medico" ? initialProfile : null,
  );
  const [chosen, setChosen] = useState<Profile>(profile ?? "familiar");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [found, setFound] = useState<Patient | null>(null);
  const [finished, setFinished] = useState<Finished | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [profile, step, finished, verifying]);

  // Só redireciona quem já estava logado. Durante o envio, a sessão nova ainda não deve tirar a pessoa desta tela.
  if (user && !finished && !busy && !verifying) return <Navigate to={homePathFor(user.role)} replace />;

  const flow = profile === "familiar" || profile === "medico" ? profile : null;
  const names = flow ? stepNames[flow] : [];
  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => { setData((d) => ({ ...d, [key]: value })); setErrors((e) => ({ ...e, [key]: "" })); setFormError(null); };

  const pickProfile = (p: Profile) => { setProfile(p); setStep(0); setErrors({}); setFormError(null); setParams({ perfil: p }, { replace: true }); };
  const backToChoice = () => { setProfile(null); setStep(0); setErrors({}); setFormError(null); setParams({}, { replace: true }); };

  /* ---------- validação por passo ---------- */
  const validate = (): Errors => {
    const e: Errors = {};
    if (step === 0) {
      if (!data.name.trim()) e.name = "Escreva seu nome completo.";
      if (!emailOk(data.email)) e.email = "Digite um e-mail válido, como nome@exemplo.com.";
      if (flow === "familiar" && !phoneOk(data.phone)) e.phone = "Digite o celular com DDD.";
      if (data.password.length < 8) e.password = "A senha precisa ter pelo menos 8 caracteres.";
    }
    if (flow === "familiar") {
      if (step === 1 && !data.consent) e.consent = "Para continuar, marque que a pessoa cuidada autoriza o compartilhamento.";
      if (step === 2) {
        if (data.patientMode === "code" && !/^\d{6}$/.test(data.code)) e.code = "O código tem 6 números.";
        if (data.patientMode === "new") {
          if (!data.newName.trim()) e.newName = "Escreva o nome da pessoa cuidada.";
          const year = Number(data.birthYear);
          if (!(year >= 1900 && year <= new Date().getFullYear())) e.birthYear = "Digite o ano de nascimento, com 4 números.";
          if (!data.city.trim()) e.city = "Informe a cidade.";
        }
      }
      if (step === 3) {
        data.contacts.forEach((c, i) => {
          const filled = c.name.trim() || c.phone.trim();
          if (filled && !c.name.trim()) e[`contactName${i}`] = "Escreva o nome.";
          if (filled && !phoneOk(c.phone)) e[`contactPhone${i}`] = "Digite o celular com DDD.";
        });
      }
    }
    if (flow === "medico") {
      if (step === 1) {
        if (!/^\d{4,8}$/.test(data.crm.trim())) e.crm = "Digite só os números do CRM.";
      }
      if (step === 2 && !data.terms) e.terms = "Para continuar, aceite os termos de uso.";
    }
    return e;
  };

  /* ---------- envio final ---------- */
  const submit = async (skipContacts = false) => {
    setBusy(true);
    setFormError(null);
    try {
      if (flow === "familiar") {
        const input: RegisterInput = {
          role: "familiar", name: data.name, email: data.email, phone: data.phone, password: data.password,
          patientCode: data.patientMode === "code" ? data.code : undefined,
          newPatient: data.patientMode === "new" ? { name: data.newName.trim(), birthYear: Number(data.birthYear), city: data.city.trim() } : undefined,
          supportContacts: skipContacts ? [] : data.contacts.filter((c) => c.name.trim() && c.phone.trim()),
        };
        const created = await register(input);
        const patient = await patientService.getById(created.patientIds[0]);
        setFinished({ role: "familiar", patientName: patient.name, code: data.patientMode === "new" ? patient.inviteCode : undefined });
      } else if (flow === "medico") {
        setVerifying(true);
        setStep(3);
        const [created] = await Promise.all([
          register({ role: "medico", name: data.name, email: data.email, password: data.password, crm: data.crm.trim(), uf: data.uf, specialty: data.specialty }),
          new Promise((r) => setTimeout(r, 1800)),
        ]);
        setVerifying(false);
        setFinished({ role: created.role });
      }
    } catch (err) {
      setVerifying(false);
      setFormError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
      if (flow === "medico") setStep(0);
    } finally {
      setBusy(false);
    }
  };

  const next = async (event?: FormEvent) => {
    event?.preventDefault();
    const problems = validate();
    setErrors(problems);
    if (Object.keys(problems).length) return;

    // Passo "Pessoa cuidada" com código: confere se o código existe antes de seguir.
    if (flow === "familiar" && step === 2 && data.patientMode === "code") {
      setBusy(true);
      const patient = await patientService.findByCode(data.code);
      setBusy(false);
      if (!patient) { setErrors({ code: "Não encontramos esse código. Confira os 6 números no app da pessoa cuidada." }); return; }
      setFound(patient);
    }
    const last = flow === "familiar" ? 3 : 2;
    if (step === last) { await submit(); return; }
    setStep((s) => s + 1);
  };

  const back = () => { if (step === 0) backToChoice(); else setStep((s) => s - 1); setErrors({}); setFormError(null); };

  /* ---------- peças de tela ---------- */
  const passwordField = (
    <TextField
      label="Senha" type={showPassword ? "text" : "password"} autoComplete="new-password" value={data.password}
      onChange={(e) => set("password", e.target.value)} error={errors.password || undefined} hint="Pelo menos 8 caracteres."
      trailing={
        <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
    />
  );

  const shell = (content: ReactNode) => (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <Brand size="lg" inverted />
        <div>
          <h2>Crie sua conta</h2>
          <p>Em poucos passos você começa a cuidar de quem ama, ou a acompanhar seus pacientes.</p>
        </div>
        {flow && !finished && (
          <ol className={styles.stepList} aria-label="Passos do cadastro">
            {names.map((name, i) => (
              <li key={name} className={`${styles.stepItem} ${i < step ? styles.done : ""}`} aria-current={i === step ? "step" : undefined}>
                <span className={styles.bullet}>{i < step ? <Check size={16} aria-hidden /> : i + 1}</span>
                {name}
              </li>
            ))}
          </ol>
        )}
      </aside>
      <main className={styles.main}>
        <div className={styles.column}>
          <div className={styles.top}>
            <span className={styles.mobileBrand}><Brand /></span>
            <span className={styles.login}>Já tem conta? <Link to={paths.login}>Entrar</Link></span>
          </div>
          {flow && !finished && !verifying && (
            <div className={styles.progress}>
              <p className={styles.stepLabel}>Passo {step + 1} de {names.length}: {names[step]}</p>
              <div className={styles.bar} role="progressbar" aria-label="Progresso do cadastro" aria-valuemin={1} aria-valuemax={names.length} aria-valuenow={step + 1}>
                <span style={{ width: `${((step + 1) / names.length) * 100}%` }} />
              </div>
            </div>
          )}
          {content}
        </div>
      </main>
    </div>
  );

  /* ---------- 1) escolha de perfil ---------- */
  if (!profile) {
    return shell(
      <form className={styles.card} onSubmit={(e) => { e.preventDefault(); pickProfile(chosen); }}>
        <Eyebrow>Criar conta</Eyebrow>
        <h1 ref={headingRef} tabIndex={-1}>Como você vai usar o Acolhe?</h1>
        <p className={styles.lead}>Escolha a opção que melhor descreve você. Dá para criar outra conta depois.</p>
        <fieldset className={styles.choices}>
          <legend className="sr-only">Seu perfil</legend>
          {profiles.map(({ id, title, description, hint, icon: Icon }) => (
            <label key={id} className={styles.choice}>
              <input type="radio" name="perfil" value={id} checked={chosen === id} onChange={() => setChosen(id)} />
              <IconBadge size={52}><Icon size={26} /></IconBadge>
              <span className={styles.choiceText}><b>{title}</b><small>{description}</small><small><b>{hint}</b></small></span>
              <span className={styles.tick} aria-hidden><Check size={16} /></span>
            </label>
          ))}
        </fieldset>
        <div className={styles.actions}>
          <Button type="submit" icon={<ArrowRight size={18} />}>Continuar</Button>
        </div>
      </form>,
    );
  }

  /* ---------- 2) pessoa cuidada: o cadastro é no celular ---------- */
  if (profile === "pessoa") {
    return shell(
      <section className={`${styles.card} ${styles.center}`}>
        <IconBadge size={72} round><Smartphone size={34} /></IconBadge>
        <h1 ref={headingRef} tabIndex={-1}>O Acolhe da pessoa cuidada funciona no celular</h1>
        <p className={styles.lead}>O cadastro de quem recebe cuidado é feito pelo aplicativo, com letras grandes, o botão de ajuda e o atalho na tela inicial. Aqui no computador, a família e os médicos acompanham tudo.</p>
        <ol className={styles.steps}>
          <li>Baixe o aplicativo Acolhe no celular.</li>
          <li>Toque em <b>Criar conta</b> e escolha <b>Sou a pessoa cuidada</b>.</li>
          <li>Um familiar pode ajudar a preencher. No fim, o app mostra um <b>código de 6 números</b> para vincular os cuidadores.</li>
        </ol>
        <Button onClick={() => pickProfile("familiar")} icon={<Users size={18} />}>Quero me cadastrar como cuidador(a)</Button>
        <Button variant="ghost" onClick={backToChoice} icon={<ArrowLeft size={18} />}>Voltar</Button>
      </section>,
    );
  }

  /* ---------- 3) verificação do médico (simulada) ---------- */
  if (verifying) {
    return shell(
      <section className={`${styles.card} ${styles.center}`} role="status">
        <LoaderCircle size={44} className={styles.spinner} aria-hidden />
        <h1 ref={headingRef} tabIndex={-1}>Conferindo seu CRM</h1>
        <p className={styles.lead}>Estamos verificando seu registro no conselho regional. Esta verificação é simulada nesta demonstração.</p>
      </section>,
    );
  }

  /* ---------- 4) conta criada ---------- */
  if (finished) {
    const isDoctor = finished.role === "medico";
    return shell(
      <section className={`${styles.card} ${styles.center}`}>
        <IconBadge tone="success" size={72} round><ShieldCheck size={34} /></IconBadge>
        <h1 ref={headingRef} tabIndex={-1}>Conta criada!</h1>
        <p className={styles.lead}>
          {isDoctor
            ? "Seu CRM foi aceito. Você já pode acompanhar pacientes e emitir receitas."
            : `Você agora cuida de ${finished.patientName}. Os contatos de apoio receberam um convite por WhatsApp ou SMS (simulado).`}
        </p>
        {finished.code && (
          <>
            <p className={styles.lead} style={{ marginBottom: 0 }}>Código para ligar o app da pessoa cuidada:</p>
            <div className={styles.code} aria-label={`Código ${finished.code.split("").join(" ")}`}>{finished.code}</div>
            <p className={styles.lead}>No app dela, escolha “Já tenho um cuidador” e digite este código.</p>
          </>
        )}
        <Button onClick={() => navigate(homePathFor(finished.role), { replace: true })} icon={<ArrowRight size={18} />}>
          {isDoctor ? "Ir para meus pacientes" : "Ir para o painel"}
        </Button>
      </section>,
    );
  }

  /* ---------- 5) formulários por passo ---------- */
  const lastStep = flow === "familiar" ? 3 : 2;
  const isLast = step === lastStep;

  const body = (() => {
    if (step === 0) {
      return (
        <>
          <Eyebrow>{flow === "medico" ? "Médico(a)" : "Cuidador(a)"}</Eyebrow>
          <h1 ref={headingRef} tabIndex={-1}>Seus dados</h1>
          <p className={styles.lead}>{flow === "medico" ? "Use o e-mail que você usa no trabalho." : "É com estes dados que você vai entrar no Acolhe."}</p>
          <TextField label="Nome completo" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} error={errors.name || undefined} />
          <TextField label="E-mail" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} error={errors.email || undefined} />
          {flow === "familiar" && (
            <TextField label="Celular" type="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={data.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone || undefined} hint="Usado para avisos por WhatsApp e SMS." />
          )}
          {passwordField}
        </>
      );
    }
    if (flow === "familiar" && step === 1) {
      return (
        <>
          <Eyebrow>Privacidade</Eyebrow>
          <h1 ref={headingRef} tabIndex={-1}>Cuidar com autorização</h1>
          <p className={styles.lead}>Dados de saúde são sensíveis. Só quem a pessoa cuidada autorizar pode vê-los.</p>
          <ul className={styles.bullets}>
            <li>A pessoa cuidada decide o que cada cuidador pode ver.</li>
            <li>Você pode pausar ou sair da rede a qualquer momento.</li>
            <li>Os dados ficam protegidos e não são vendidos nem compartilhados com anúncios.</li>
          </ul>
          <label className={styles.check}>
            <input type="checkbox" checked={data.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={Boolean(errors.consent) || undefined} />
            <span>Confirmo que a pessoa cuidada sabe e autoriza que eu acompanhe seus alertas, rotina e dados de saúde.</span>
          </label>
          {errors.consent && <p className={styles.checkError} role="alert">{errors.consent}</p>}
        </>
      );
    }
    if (flow === "familiar" && step === 2) {
      return (
        <>
          <Eyebrow>Pessoa cuidada</Eyebrow>
          <h1 ref={headingRef} tabIndex={-1}>Quem você vai cuidar?</h1>
          <p className={styles.lead}>Se a pessoa já usa o Acolhe, digite o código dela. Se não, cadastre agora.</p>
          <Tabs
            variant="segmented" label="Como vincular a pessoa cuidada"
            items={[{ id: "code", label: "Tenho um código" }, { id: "new", label: "Cadastrar agora" }]}
            value={data.patientMode} onChange={(v) => { set("patientMode", v); setErrors({}); }}
          />
          {data.patientMode === "code" ? (
            <>
              <TextField
                label="Código de 6 números" inputMode="numeric" maxLength={6} autoComplete="off" value={data.code}
                onChange={(e) => set("code", e.target.value.replace(/\D/g, ""))} error={errors.code || undefined}
                hint="Está no app da pessoa cuidada, em Configurações. Para testar, use 482910."
              />
              {found && !errors.code && (
                <div className={`${styles.panel} ${styles.found}`} role="status">
                  <IconBadge tone="success" round size={44}><Check size={22} /></IconBadge>
                  <span><b>{found.fullName}</b>{found.age} anos • {found.city}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <TextField label="Nome da pessoa cuidada" value={data.newName} onChange={(e) => set("newName", e.target.value)} error={errors.newName || undefined} />
              <div className={styles.row2}>
                <TextField label="Ano de nascimento" inputMode="numeric" maxLength={4} placeholder="1948" value={data.birthYear} onChange={(e) => set("birthYear", e.target.value.replace(/\D/g, ""))} error={errors.birthYear || undefined} />
                <TextField label="Cidade" value={data.city} onChange={(e) => set("city", e.target.value)} error={errors.city || undefined} />
              </div>
              <p className={styles.lead} style={{ fontSize: 15 }}>No final, mostramos um código para ligar o app dela à sua conta.</p>
            </>
          )}
        </>
      );
    }
    if (flow === "familiar" && step === 3) {
      return (
        <>
          <Eyebrow>Opcional</Eyebrow>
          <h1 ref={headingRef} tabIndex={-1}>Contatos de apoio</h1>
          <p className={styles.lead}>Vizinhos ou amigos que podem ajudar em uma emergência. Recebem o alerta por WhatsApp ou SMS e <b>não precisam instalar nada</b>. Dá para pular e adicionar depois.</p>
          {data.contacts.map((c, i) => (
            <div key={i} className={styles.contactRow}>
              <TextField label={`Nome do contato ${i + 1}`} value={c.name} error={errors[`contactName${i}`] || undefined}
                onChange={(e) => { const next = [...data.contacts]; next[i] = { ...c, name: e.target.value }; set("contacts", next); }} />
              <TextField label="Celular" type="tel" placeholder="(11) 90000-0000" value={c.phone} error={errors[`contactPhone${i}`] || undefined}
                onChange={(e) => { const next = [...data.contacts]; next[i] = { ...c, phone: e.target.value }; set("contacts", next); }} />
              {data.contacts.length > 1 && (
                <Button className={styles.remove} variant="ghost" aria-label={`Remover contato ${i + 1}`} icon={<Trash2 size={18} />} onClick={() => set("contacts", data.contacts.filter((_, idx) => idx !== i))} />
              )}
            </div>
          ))}
          {data.contacts.length < 3 && (
            <Button variant="secondary" icon={<Plus size={18} />} onClick={() => set("contacts", [...data.contacts, { name: "", phone: "" }])}>Adicionar outro contato</Button>
          )}
        </>
      );
    }
    if (flow === "medico" && step === 1) {
      return (
        <>
          <Eyebrow>Profissão</Eyebrow>
          <h1 ref={headingRef} tabIndex={-1}>Seu registro profissional</h1>
          <p className={styles.lead}>Usamos o CRM para assinar suas receitas. Nesta demonstração a verificação é simulada.</p>
          <div className={styles.row2}>
            <TextField label="Número do CRM" inputMode="numeric" value={data.crm} onChange={(e) => set("crm", e.target.value.replace(/\D/g, ""))} error={errors.crm || undefined} />
            <SelectField label="Estado (UF)" value={data.uf} onChange={(e) => set("uf", e.target.value)} options={ufs.map((u) => ({ value: u, label: u }))} />
          </div>
          <SelectField label="Especialidade" value={data.specialty} onChange={(e) => set("specialty", e.target.value)} options={specialties.map((s) => ({ value: s, label: s }))} />
        </>
      );
    }
    return (
      <>
        <Eyebrow>Termos</Eyebrow>
        <h1 ref={headingRef} tabIndex={-1}>Termos de uso</h1>
        <p className={styles.lead}>Antes de ver pacientes, confirme como os dados serão tratados.</p>
        <ul className={styles.bullets}>
          <li>Você só vê pacientes que autorizaram seu acompanhamento.</li>
          <li>Receitas assinadas ficam registradas com seu nome e CRM.</li>
          <li>Dados de saúde não podem ser usados fora do cuidado do paciente.</li>
        </ul>
        <label className={styles.check}>
          <input type="checkbox" checked={data.terms} onChange={(e) => set("terms", e.target.checked)} aria-invalid={Boolean(errors.terms) || undefined} />
          <span>Li e aceito os termos de uso e a política de privacidade.</span>
        </label>
        {errors.terms && <p className={styles.checkError} role="alert">{errors.terms}</p>}
      </>
    );
  })();

  return shell(
    <form className={styles.card} onSubmit={next} noValidate>
      <span className={styles.stepLabel}>Passo {step + 1} de {names.length}</span>
      {body}
      {formError && <p className={styles.formError} role="alert">{formError}</p>}
      <div className={styles.actions}>
        <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={back}>Voltar</Button>
        {flow === "familiar" && step === 3 && (
          <Button variant="ghost" loading={busy} onClick={() => void submit(true)}>Pular por enquanto</Button>
        )}
        <Button type="submit" loading={busy} icon={isLast ? <Check size={18} /> : <ArrowRight size={18} />}>
          {isLast ? (flow === "medico" ? "Enviar para verificação" : "Concluir cadastro") : "Continuar"}
        </Button>
      </div>
    </form>,
  );
}
