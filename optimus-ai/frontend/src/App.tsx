import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Login } from './pages/Login';
import { OptimizationDemo } from './pages/OptimizationDemo';
import { PredictionDemo } from './pages/PredictionDemo';
import { SimulationDemo } from './pages/SimulationDemo';
import { RulesDemo } from './pages/RulesDemo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública — sin sidebar */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas — con Layout y sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="optimization" element={<OptimizationDemo />} />
          <Route path="prediction" element={<PredictionDemo />} />
          <Route path="simulation" element={<SimulationDemo />} />
          <Route path="rules" element={<RulesDemo />} />
          <Route path="chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
