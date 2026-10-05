import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';

const ComingSoon = ({ title, description }: { title: string; description: string }) => (
  <section className="glass-card max-w-2xl p-6 sm:p-8">
    <p className="mb-3 text-sm font-semibold text-blue-300">En desarrollo</p>
    <h1 className="text-3xl font-bold text-white">{title}</h1>
    <p className="mt-3 text-gray-300">{description}</p>
    <p className="mt-2 text-sm text-gray-400">Todavía no se pueden iniciar análisis desde esta pantalla.</p>
    <Link to="/chat" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primaryDark px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-800">
      Interpretar una instrucción
    </Link>
  </section>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="optimization" element={<ComingSoon title="Optimización" description="La interfaz para configurar y consultar asignaciones de recursos está en preparación." />} />
          <Route path="prediction" element={<ComingSoon title="Predicción" description="La interfaz para consultar modelos y predicciones de ventas está en preparación." />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
