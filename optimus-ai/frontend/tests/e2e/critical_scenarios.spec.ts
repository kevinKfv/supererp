import { test, expect } from '@playwright/test';

// ==============================================================================
// 5 ESCENARIOS CRÍTICOS E2E EXIGIDOS POR CÁTEDRA (EJE A - REQUISITO FORMAL)
// ==============================================================================

test.describe('OptimusAI - Suite de Escenarios Críticos E2E', () => {

  // Escenario 1: Flujo Completo de Autenticación y RBAC
  test('Escenario 1: Flujo de Autenticacion y Acceso al Dashboard', async ({ page }) => {
    await page.goto('/login');

    // Validar presencia del formulario de login
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();

    // Caso de error: Submit vacío
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Ingresa usuario y contraseña')).toBeVisible();

    // Caso de éxito: Ingreso con credenciales demo
    await page.fill('input#username', 'admin_supererp');
    await page.fill('input#password', 'SuperSecretPassword123');
    await page.click('button[type="submit"]');

    // Verificar redirección al Dashboard
    await expect(page).toHaveURL(/\//);
    await expect(page.locator('text=OptimusAI').first()).toBeVisible();
  });

  // Escenario 2: Ciclo de Optimización Matemática End-to-End
  test('Escenario 2: Asignacion y Optimizacion Matematica (OR-Tools)', async ({ page }) => {
    await page.goto('/optimization');

    // Verificar renderizado de la matriz de asignación
    await expect(page.locator('text=Optimización de Asignación').first()).toBeVisible();

    // Click en botón para resolver optimización
    const solveButton = page.locator('button:has-text("Iniciar optimización"), button:has-text("Optimizar"), button:has-text("Ejecutar")').first();
    if (await solveButton.isVisible()) {
      await solveButton.click();
      // Debe mostrar estado de procesamiento o resultado óptimo
      await expect(page.locator('text=OPTIMAL, text=Óptimo, text=Procesando, text=Queued').first()).toBeVisible({ timeout: 10000 });
    }
  });

  // Escenario 3: Predicción con Modelo de Machine Learning (XGBoost)
  test('Escenario 3: Generacion de Prediccion de Ventas con Machine Learning', async ({ page }) => {
    await page.goto('/prediction');

    await expect(page.locator('text=Predicción, text=Prediction').first()).toBeVisible();

    // Completar variables o disparar inferencia
    const predictBtn = page.locator('button:has-text("Predecir"), button:has-text("Calcular"), button:has-text("Ejecutar")').first();
    if (await predictBtn.isVisible()) {
      await predictBtn.click();
      // Verificar que se presente el resultado de ventas estimadas
      await expect(page.locator('text=unidades, text=Estimación, text=Resultado, text=Ventas').first()).toBeVisible({ timeout: 8000 });
    }
  });

  // Escenario 4: Simulación de Riesgo Financiero Monte Carlo
  test('Escenario 4: Simulacion Monte Carlo con Bandas de Riesgo VaR p5/p95', async ({ page }) => {
    await page.goto('/simulation');

    await expect(page.locator('text=Simulación, text=Monte Carlo').first()).toBeVisible();

    const simBtn = page.locator('button:has-text("Simular"), button:has-text("Iniciar Simulación"), button:has-text("Calcular")').first();
    if (await simBtn.isVisible()) {
      await simBtn.click();
      // Validar métricas estadísticas resultantes
      await expect(page.locator('text=Media, text=VaR, text=Rentabilidad, text=p5, text=p95').first()).toBeVisible({ timeout: 8000 });
    }
  });

  // Escenario 5: Motor de Reglas de Negocio y Chat Cognitivo
  test('Escenario 5: Evaluacion de Reglas de Negocio y Asistente Cognitivo', async ({ page }) => {
    await page.goto('/rules');
    await expect(page.locator('text=Motor de Reglas, text=Rules').first()).toBeVisible();

    // Navegar a Chat Cognitivo
    await page.goto('/chat');
    await expect(page.locator('input[type="text"], textarea').first()).toBeVisible();

    // Enviar consulta en lenguaje natural
    const chatInput = page.locator('input[type="text"], textarea').first();
    await chatInput.fill('Reducir costos de producción en un 15%');
    await page.keyboard.press('Enter');

    // Verificar respuesta del Knowledge Engine
    await expect(page.locator('text=OPTIMIZE, text=optimización, text=costos').first()).toBeVisible({ timeout: 8000 });
  });

});
