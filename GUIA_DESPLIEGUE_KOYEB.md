# Guía de Despliegue en Koyeb (Backend Todo en Uno 100% Gratis) 🚀

Esta guía explica cómo desplegar el **Backend completo de OptimusAI (SuperERP)** en **[Koyeb.com](https://www.koyeb.com/)** en un único contenedor **Todo en Uno**, 100% gratuito, con Redis y Base de Datos embebidos dentro de la misma instancia, sin necesidad de pagar ni crear cuentas en servicios externos.

---

## 🏗️ Ventajas de Koyeb frente a Railway y Render
* **Free Tier Real y Permanente:** 512 MB RAM y CPU dedicada sin costo de tarjeta mensual.
* **Todo en Uno:** Ya dejamos preconfigurado Redis Server embebido y SQLite/Postgres dentro de la imagen, por lo que **no requieres contratar bases de datos adicionales**.
* **Dominio Público HTTPS Automático:** Genera inmediatamente una URL segura tipo `https://tu-app.koyeb.app`.
* **Despliegue Continuo:** Cada `git push` a tu repositorio actualiza el backend automáticamente.

---

## 📋 Requisitos Previos
1. Una cuenta activa en [Koyeb.com](https://app.koyeb.com/) (puedes ingresar directamente con tu cuenta de GitHub).
2. Tener el código del proyecto subido a tu GitHub (`kevinKfv/supererp`).
3. Haber hecho `git push` con los nuevos archivos creados:
   - `optimus-ai/Dockerfile.koyeb`
   - `optimus-ai/start_koyeb.sh`

---

## 🚀 Paso a Paso: Desplegar en Koyeb

### Paso 1: Iniciar creación del Servicio
1. Ingresa a [app.koyeb.com](https://app.koyeb.com/) e inicia sesión con GitHub.
2. En tu Dashboard principal, haz clic en el botón verde **"Create Service"** (o **"Deploy"**).

---

### Paso 2: Conectar el Repositorio de GitHub
1. Selecciona la opción **GitHub**.
2. Elige tu repositorio: `kevinKfv/supererp` *(si no aparece en la lista, haz clic en "Configure GitHub permissions" para autorizar el acceso)*.
3. En la rama (**Branch**), selecciona `main`.

---

### Paso 3: Configurar el Dockerfile
En la sección **Build and deployment settings**:
1. En **Builder**, selecciona **`Dockerfile`**.
2. En **Dockerfile location**, escribe exactamente:
   ```text
   optimus-ai/Dockerfile.koyeb
   ```

---

### Paso 4: Elegir el Plan Gratuito (Instance Type)
1. En **Instance**, selecciona el plan gratuito:
   - **Eco** ➡️ **`Nano`** (0.1 vCPU, 512 MB RAM).
   - Costo: **$0.00 / month (Free tier)**.
2. En **Regions**, selecciona la más cercana (ejemplo: `Washington, D.C. (US)` o `Frankfurt (EU)`).

---

### Paso 5: Configuración de Puertos (Exposed Ports)
Baja a la sección **Ports**:
* Asegúrate de que el puerto expuesto sea:
  - **Port:** `8000`
  - **Protocol:** `HTTP`
  - **Public Path:** `/`

---

### Paso 6: Variables de Entorno (Environment Variables)
Baja a la sección **Environment variables** y agrega:
* **`SECRET_KEY`**: `super-secret-key-enterprise-2026`

> [!TIP]
> **Sin complicaciones de bases de datos:** No necesitas agregar `DATABASE_URL` ni `REDIS_URL`. El contenedor inicia su propio Redis local en background y genera la base de datos automáticamente con el usuario administrador predeterminado `admin_supererp`.

---

### Paso 7: Guardar y Desplegar
1. En **Service name**, nómbralo `supererp-backend` (o como prefieras).
2. Haz clic en el botón inferior derecho **"Deploy"**.
3. Koyeb comenzará a compilar la imagen Docker. Al finalizar (2-3 minutos), el estado cambiará a **Healthy (verde)**.
4. En la parte superior de tu servicio verás tu **Public URL**, por ejemplo:
   ```text
   https://supererp-backend-tusuario.koyeb.app
   ```
5. **Copia esa URL**.

---

## 🔗 Vincular el Backend con tu Frontend en Cloudflare Pages

1. Abre tu panel de [Cloudflare](https://dash.cloudflare.com/) ➡️ ve a **Workers & Pages**.
2. Haz clic en tu proyecto `supererp`.
3. Ve a la pestaña **Settings** ➡️ menú lateral **Environment variables**.
4. Haz clic en **Add variable** (o edita la existente):
   - **Variable name:** `VITE_API_URL`
   - **Value:** Pega tu URL de Koyeb (ejemplo: `https://supererp-backend-tusuario.koyeb.app` sin barra `/` al final).
5. Ve a la pestaña **Deployments**, haz clic en los tres puntos `...` del último despliegue y selecciona **Retry deployment**.

---

## 🔑 Credenciales y Verificación

Una vez finalizado el redespliegue de Cloudflare Pages:
1. Abre tu web en **`https://supererp.pages.dev`**.
2. En la pantalla de login, haz clic en **"Auto-completar Credenciales Demo"**:
   - **Usuario:** `admin_supererp`
   - **Contraseña:** `SuperSecretPassword123`
3. ¡Ingresarás al Dashboard y todos los motores (Optimización, Predicción, Simulación Monte Carlo, Reglas y Chat) responderán inmediatamente desde tu backend de Koyeb!
