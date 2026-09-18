import numpy as np

def run_profitability_simulation(
    expected_revenue: float,
    revenue_std: float,
    expected_cost: float,
    cost_std: float,
    iterations: int = 10000
) -> dict:
    """
    Ejecuta una Simulación de Monte Carlo vectorizada para estimar la rentabilidad (ingresos - costos).
    Asume una distribución normal para ingresos y costos.
    """
    np.random.seed(42)  # Para reproducibilidad en el PoC
    
    # Generar miles de escenarios posibles para ingresos y costos
    simulated_revenues = np.random.normal(loc=expected_revenue, scale=revenue_std, size=iterations)
    simulated_costs = np.random.normal(loc=expected_cost, scale=cost_std, size=iterations)
    
    # Calcular la rentabilidad en cada uno de los escenarios
    profitability = simulated_revenues - simulated_costs
    
    # Calcular estadísticos descriptivos y percentiles de riesgo
    mean_profit = np.mean(profitability)
    p5 = np.percentile(profitability, 5)   # Peor escenario razonable (VaR 95%)
    p95 = np.percentile(profitability, 95) # Mejor escenario razonable
    
    # Calcular la probabilidad de pérdida (escenarios donde rentabilidad < 0)
    loss_probability = np.sum(profitability < 0) / iterations
    
    return {
        "iterations_run": iterations,
        "mean_profitability": round(float(mean_profit), 2),
        "worst_case_p5": round(float(p5), 2),
        "best_case_p95": round(float(p95), 2),
        "probability_of_loss_percent": round(float(loss_probability) * 100, 2)
    }
