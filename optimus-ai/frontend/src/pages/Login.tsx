import { useState, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  BrainCircuit, 
  Eye, 
  EyeOff, 
  Loader2, 
  LogIn, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Sparkles,
  Lock
} from "lucide-react";

const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";
const LOGIN_ENDPOINT = `${API_URL}/api/v1/identity/auth/login`;

export const Login = () => {
  const navigate = useNavigate();
  const usernameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleFillDemo = () => {
    setForm({
      username: "admin_supererp",
      password: "SuperSecretPassword123",
    });
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Completá usuario y contraseña.");
      usernameRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("username", form.username.trim());
      params.append("password", form.password);

      const { data } = await axios.post<{ access_token: string; token_type: string }>(
        LOGIN_ENDPOINT,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      localStorage.setItem("optimus_token", data.access_token);
      localStorage.setItem("optimus_user", form.username.trim());
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Usuario o contraseña incorrectos.");
        } else if (err.response?.status === 422) {
          setError("Datos inválidos. Verificá el formulario.");
        } else if (!err.response) {
          setError("No se pudo conectar con el servidor. ¿Está Docker corriendo?");
        } else {
          setError(`Error del servidor (${err.response.status}). Intentá más tarde.`);
        }
      } else {
        setError("Error inesperado. Intentá nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-primary/30">
      {/* Background Decorative Ambient Mesh & Orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-600/15 via-primary/10 to-transparent blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-10 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-1/3 left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/40 bg-gradient-to-br from-blue-500/20 via-primary/25 to-purple-600/30 p-1 shadow-glow-primary">
            <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-slate-950/80 backdrop-blur-md">
              <BrainCircuit size={40} className="text-primary animate-pulse-slow" aria-hidden="true" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950" />
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                OptimusAI
              </h1>
              <span className="rounded-md border border-primary/40 bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Enterprise
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Plataforma de Optimización Empresarial con IA
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/15 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Iniciar sesión</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ingresá tus credenciales autorizadas</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300">
              <Lock size={16} />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-sm text-red-200 animate-slide-up"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-username" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User size={13} className="text-primary" /> Usuario
              </label>
              <div className="relative">
                <input
                  id="login-username"
                  ref={usernameRef}
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={form.username}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="admin_supererp"
                  className="premium-input font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-primary" /> Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••••••"
                  className="premium-input pr-12 font-medium"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(v => !v)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-primary to-blue-500 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" /> 
                  <span>Ingresando…</span>
                </>
              ) : (
                <>
                  <LogIn size={18} aria-hidden="true" /> 
                  <span>Ingresar al Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Test Credentials Quick Card */}
          <div className="mt-6 border-t border-white/10 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Credenciales de prueba
              </p>
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300 hover:bg-primary/20 transition-colors"
              >
                <Sparkles size={11} /> Autocompletar
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-slate-300 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">usuario:</span>
                <span className="font-semibold text-white">admin_supererp</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">clave:</span>
                <span className="font-semibold text-white">SuperSecretPassword123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-slate-400">
            © 2026 OptimusAI — Sistema ERP con Inteligencia Artificial
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            Autenticación segura JWT vía Gateway :8000
          </p>
        </div>
      </div>
    </div>
  );
};
