import http from 'k6/http';
import { check, group, sleep } from 'k6';

// ==============================================================================
// PRUEBA DE CARGA OFICIAL EXIGIDA POR CÁTEDRA (EJE C - RESILIENCIA Y CARGA)
// ==============================================================================
// Parámetros exigidos:
// - 50 usuarios concurrentes (VUs)
// - 5 minutos de duración continua
// - 3 endpoints críticos del sistema (Optimización, Predicción, Simulación)
// - Umbrales mínimos de aprobación: p95 < 500ms y tasa de error < 1%
// ==============================================================================

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up a 50 usuarios concurrentes
    { duration: '4m', target: 50 },   // Carga constante de 50 usuarios concurrentes
    { duration: '30s', target: 0 },   // Ramp-down controlado
  ],
  thresholds: {
    // Rúbrica: p95 < 500 ms en los endpoints críticos
    'http_req_duration{endpoint:predict}': ['p(95)<500'],
    'http_req_duration{endpoint:simulate}': ['p(95)<500'],
    'http_req_duration{endpoint:optimize}': ['p(95)<500'],
    // Rúbrica: Tasa de error < 1%
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.GATEWAY_URL || 'http://localhost:8000';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-SuperERP-Performance-Tester/1.0',
  };

  // Endpoint Crítico 1: Predicción de Ventas (Machine Learning / XGBoost)
  group('1. Prediccion ML', function () {
    const payload = JSON.stringify({
      features: [[100.0, 80.0, 25.0]]
    });
    const res = http.post(`${BASE_URL}/api/v1/predict/predict`, payload, {
      headers,
      tags: { endpoint: 'predict' },
    });
    check(res, {
      'predict status 200': (r) => r.status === 200,
      'predict latency < 500ms': (r) => r.timings.duration < 500,
    });
  });

  // Endpoint Crítico 2: Simulación Financiera Monte Carlo (NumPy vectorizado)
  group('2. Simulacion Monte Carlo', function () {
    const payload = JSON.stringify({
      expected_revenue: 100000,
      revenue_std: 15000,
      expected_cost: 70000,
      cost_std: 10000,
      iterations: 2000
    });
    const res = http.post(`${BASE_URL}/api/v1/simulate/montecarlo`, payload, {
      headers,
      tags: { endpoint: 'simulate' },
    });
    check(res, {
      'simulate status 200': (r) => r.status === 200,
      'simulate latency < 500ms': (r) => r.timings.duration < 500,
    });
  });

  // Endpoint Crítico 3: Encolado de Optimización Matemática
  group('3. Optimizacion Asignacion', function () {
    const payload = JSON.stringify({
      costs: [
        [4.0, 1.0],
        [2.0, 3.0]
      ]
    });
    const res = http.post(`${BASE_URL}/api/v1/optimize/assignment`, payload, {
      headers,
      tags: { endpoint: 'optimize' },
    });
    check(res, {
      'optimize status 200': (r) => r.status === 200,
      'optimize latency < 500ms': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);
}
