import json
import csv
import random
import os

# Directorio de salida
OUTPUT_DIR = "datasets_sinteticos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_prediction_data(num_records=1000):
    """
    Genera datos para el Motor Predictivo.
    Precio, Inversión en Marketing, Temperatura -> Ventas
    """
    file_path = os.path.join(OUTPUT_DIR, "ventas_historicas.csv")
    with open(file_path, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["precio", "inversion_marketing", "temperatura", "ventas"])
        
        for _ in range(num_records):
            precio = round(random.uniform(50.0, 200.0), 2)
            marketing = round(random.uniform(10.0, 500.0), 2)
            temp = round(random.uniform(0.0, 40.0), 1)
            
            # Lógica ficticia para las ventas:
            # Más marketing -> más ventas
            # Más precio -> menos ventas
            # Temperatura media (20-30) -> más ventas
            
            base_sales = 500
            sales_marketing = marketing * 1.5
            sales_price = precio * -2.0
            sales_temp = -((temp - 25)**2) * 2  # Parábola con pico en 25 grados
            
            ruido = random.uniform(-50, 50)
            
            ventas = int(max(0, base_sales + sales_marketing + sales_price + sales_temp + ruido))
            writer.writerow([precio, marketing, temp, ventas])
            
    print(f"[+] Predicción: Creado {file_path} con {num_records} registros.")

def generate_optimization_data():
    """
    Genera una matriz de costos para el Motor de Optimización (Asignación de Trabajadores a Tareas).
    Matriz de 10x10.
    """
    file_path = os.path.join(OUTPUT_DIR, "matriz_costos.json")
    num_workers = 10
    num_tasks = 10
    
    costs = []
    for _ in range(num_workers):
        worker_costs = [random.randint(10, 100) for _ in range(num_tasks)]
        costs.append(worker_costs)
        
    data = {"costs": costs}
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)
        
    print(f"[+] Optimización: Creado {file_path} (Matriz {num_workers}x{num_tasks}).")

def generate_simulation_data():
    """
    Genera datos para el Motor de Simulación (Análisis Monte Carlo de Riesgo/Rentabilidad).
    """
    file_path = os.path.join(OUTPUT_DIR, "escenarios_simulacion.json")
    
    data = {
        "projects": [
            {
                "id": "PROY-001",
                "name": "Expansión Mercado Latam",
                "cost_mean": 500000,
                "cost_std_dev": 50000,
                "revenue_mean": 800000,
                "revenue_std_dev": 120000
            },
            {
                "id": "PROY-002",
                "name": "Nuevo Software ERP",
                "cost_mean": 200000,
                "cost_std_dev": 15000,
                "revenue_mean": 250000,
                "revenue_std_dev": 80000
            }
        ]
    }
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)
        
    print(f"[+] Simulación: Creado {file_path}.")

def generate_rules_data():
    """
    Genera perfiles para el Motor de Reglas.
    """
    file_path = os.path.join(OUTPUT_DIR, "perfiles_clientes.json")
    
    clientes = []
    for i in range(1, 21):
        cliente = {
            "client_id": f"C{i:03d}",
            "annual_income": random.randint(20000, 150000),
            "credit_score": random.randint(400, 850),
            "years_as_customer": random.randint(0, 15)
        }
        clientes.append(cliente)
        
    with open(file_path, 'w') as f:
        json.dump({"clientes": clientes}, f, indent=4)
        
    print(f"[+] Reglas: Creado {file_path}.")

def generate_knowledge_data():
    """
    Genera un corpus de texto para el Knowledge Engine (RAG/NLP).
    """
    file_path = os.path.join(OUTPUT_DIR, "politicas_empresa.txt")
    
    texto = """Política de Descuentos Corporativos:
1. Los clientes con más de 5 años de antigüedad tienen un descuento automático del 10% en licencias nuevas.
2. Las implementaciones que superen los $50,000 USD requieren aprobación del gerente regional.

Normativas de Asignación de Personal:
- Ningún empleado debe ser asignado a un proyecto cuyo costo de traslado supere los $1,000 USD mensuales.
- Se debe priorizar al personal con certificación AWS para proyectos de infraestructura cloud.

Manejo de Riesgo (Monte Carlo):
- Un proyecto es considerado "Alto Riesgo" si el percentil 5 de rentabilidad en la simulación es negativo.
"""
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(texto)
        
    print(f"[+] Conocimiento: Creado {file_path}.")

if __name__ == "__main__":
    print("Generando dataset sintético para OptimusAI...")
    generate_prediction_data()
    generate_optimization_data()
    generate_simulation_data()
    generate_rules_data()
    generate_knowledge_data()
    print("¡Generación completada! Los archivos están en la carpeta:", OUTPUT_DIR)
