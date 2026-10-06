const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'datasets_sinteticos');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function generatePredictionData(numRecords = 1000) {
  const filePath = path.join(OUTPUT_DIR, 'ventas_historicas.csv');
  let csvContent = 'precio,inversion_marketing,temperatura,ventas\n';

  for (let i = 0; i < numRecords; i++) {
    const precio = +(Math.random() * (200 - 50) + 50).toFixed(2);
    const marketing = +(Math.random() * (500 - 10) + 10).toFixed(2);
    const temp = +(Math.random() * 40).toFixed(1);

    const baseSales = 500;
    const salesMarketing = marketing * 1.5;
    const salesPrice = precio * -2.0;
    const salesTemp = -Math.pow(temp - 25, 2) * 2;
    const ruido = Math.random() * 100 - 50;

    let ventas = Math.floor(baseSales + salesMarketing + salesPrice + salesTemp + ruido);
    if (ventas < 0) ventas = 0;

    csvContent += `${precio},${marketing},${temp},${ventas}\n`;
  }

  fs.writeFileSync(filePath, csvContent);
  console.log(`[+] Predicción: Creado ${filePath}`);
}

function generateOptimizationData() {
  const filePath = path.join(OUTPUT_DIR, 'matriz_costos.json');
  const numWorkers = 10;
  const numTasks = 10;
  
  const costs = [];
  for (let i = 0; i < numWorkers; i++) {
    const workerCosts = [];
    for (let j = 0; j < numTasks; j++) {
      workerCosts.push(Math.floor(Math.random() * 91) + 10);
    }
    costs.push(workerCosts);
  }
  
  fs.writeFileSync(filePath, JSON.stringify({ costs }, null, 4));
  console.log(`[+] Optimización: Creado ${filePath}`);
}

function generateSimulationData() {
  const filePath = path.join(OUTPUT_DIR, 'escenarios_simulacion.json');
  const data = {
    projects: [
      {
        id: "PROY-001",
        name: "Expansión Mercado Latam",
        cost_mean: 500000,
        cost_std_dev: 50000,
        revenue_mean: 800000,
        revenue_std_dev: 120000
      },
      {
        id: "PROY-002",
        name: "Nuevo Software ERP",
        cost_mean: 200000,
        cost_std_dev: 15000,
        revenue_mean: 250000,
        revenue_std_dev: 80000
      }
    ]
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  console.log(`[+] Simulación: Creado ${filePath}`);
}

function generateRulesData() {
  const filePath = path.join(OUTPUT_DIR, 'perfiles_clientes.json');
  const clientes = [];
  for (let i = 1; i <= 20; i++) {
    clientes.push({
      client_id: `C${String(i).padStart(3, '0')}`,
      annual_income: Math.floor(Math.random() * 130000) + 20000,
      credit_score: Math.floor(Math.random() * 450) + 400,
      years_as_customer: Math.floor(Math.random() * 16)
    });
  }
  fs.writeFileSync(filePath, JSON.stringify({ clientes }, null, 4));
  console.log(`[+] Reglas: Creado ${filePath}`);
}

function generateKnowledgeData() {
  const filePath = path.join(OUTPUT_DIR, 'politicas_empresa.txt');
  const texto = `Política de Descuentos Corporativos:
1. Los clientes con más de 5 años de antigüedad tienen un descuento automático del 10% en licencias nuevas.
2. Las implementaciones que superen los $50,000 USD requieren aprobación del gerente regional.

Normativas de Asignación de Personal:
- Ningún empleado debe ser asignado a un proyecto cuyo costo de traslado supere los $1,000 USD mensuales.
- Se debe priorizar al personal con certificación AWS para proyectos de infraestructura cloud.

Manejo de Riesgo (Monte Carlo):
- Un proyecto es considerado "Alto Riesgo" si el percentil 5 de rentabilidad en la simulación es negativo.
`;
  fs.writeFileSync(filePath, texto);
  console.log(`[+] Conocimiento: Creado ${filePath}`);
}

generatePredictionData();
generateOptimizationData();
generateSimulationData();
generateRulesData();
generateKnowledgeData();
console.log("¡Generación completada!");
