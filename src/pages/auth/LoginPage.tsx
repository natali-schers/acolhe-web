import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";
import styles from "./LoginPage.module.css";
import { Brand, Button, Eyebrow, IconBadge, TextField } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { homePathFor } from "@/routes/ProtectedRoute";
import { paths } from "@/routes/paths";
import { apiConfig } from "@/services";

const demoAccounts = [
  { label: "Familiar ou cuidador", description: "Ana, filha da Dona Maria", email: "ana@exemplo.com", icon: Users },
  { label: "Médico", description: "Dr. Paulo Mendes", email: "paulo@exemplo.com", icon: Stethoscope },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const logged = await login({ email, password });
      navigate(from && from.startsWith(homePathFor(logged.role)) ? from : homePathFor(logged.role), { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("12345678");
    setError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.art} aria-hidden>
        <div className={styles.circle}><HeartPulse size={72} /></div>
      </div>

      <section className={styles.panel}>
        <div className={styles.brand}><Brand size="lg" /></div>
        <Eyebrow>Portal da família e dos médicos</Eyebrow>
        <h1 className={styles.title}>Você nunca está só.</h1>
        <p className={styles.lead}>Acompanhe alertas, remédios, rotina e toda a rede de cuidado no mesmo lugar.</p>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error ?? undefined}
            required
            trailing={
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
          <Button type="submit" fullWidth loading={loading}>Entrar</Button>
          <Button variant="ghost" fullWidth>Esqueci minha senha</Button>
        </form>
        <p className={styles.signup}>Ainda não tem conta? <Link to={paths.register}>Criar conta</Link></p>

        {apiConfig.useMocks && (
          <div className={styles.demo}>
            <p>Modo demonstração: escolha uma conta para preencher</p>
            <div className={styles.demoList}>
              {demoAccounts.map(({ label, description, email: demoEmail, icon: Icon }) => (
                <button key={demoEmail} type="button" className={styles.demoCard} onClick={() => fillDemo(demoEmail)}>
                  <IconBadge><Icon size={24} /></IconBadge>
                  <span><b>{label}</b><small>{description}</small></span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className={styles.privacy}>
          <ShieldCheck size={18} aria-hidden /> Os dados de saúde são protegidos e só são vistos por quem a pessoa cuidada autorizar.
        </p>
      </section>
    </div>
  );
}
