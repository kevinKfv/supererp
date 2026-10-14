import { useState, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BrainCircuit, Eye, EyeOff, Loader2, LogIn, AlertCircle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
            <BrainCircuit size={36} className="text-primary" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">OptimusAI</h1>
            <p className="mt-1 text-sm text-gray-400">Plataforma de Optimización Empresarial con IA</p>
          </div>
        </div>

        <div className="glass-card p-8 shadow-2xl">
          <h2 className="mb-6 text-xl font-semibold text-white">Iniciar sesión</h2>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-username" className="text-sm font-medium text-gray-300">
                Usuario
              </label>
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
                className="premium-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
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
                  className="premium-input pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(v => !v)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:text-white disabled:opacity-40"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Ingresando…</>
                : <><LogIn size={18} aria-hidden="true" /> Ingresar</>}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Credenciales de prueba</p>
            <div className="rounded-lg bg-white/5 px-3 py-2 font-mono text-xs text-gray-300 leading-relaxed">
              <span className="text-gray-500">usuario: </span>admin_supererp<br />
              <span className="text-gray-500">clave: </span>SuperSecretPassword123
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 OptimusAI — Sistema ERP con Inteligencia Artificial
        </p>
      </div>
    </div>
  );
};
