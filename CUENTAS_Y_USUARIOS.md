# Directorio de Cuentas, Usuarios y Credenciales — OptimusAI / SuperERP

Este documento contiene la totalidad de los accesos, credenciales por defecto, puertos y URLs necesarios para operar y administrar el ecosistema de microservicios y la plataforma visual de **OptimusAI**.

---

## 📋 Tabla de Acceso Rápido

| Servicio | URL / Host | Usuario / Identificador | Contraseña / Clave | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:5173](http://localhost:5173) | Libre / Sesión activa | N/A | Panel de control, simulación, optimización y chat |
| **API Gateway** | [http://localhost:8000](http://localhost:8000) | N/A | N/A | Punto de entrada unificado y Swagger en `/docs` |
| **Identity Service (Admin)** | `/api/v1/identity/auth/login` | `admin_supererp` | `SuperSecretPassword123` | Administrador del sistema en PostgreSQL |
| **Grafana** | [http://localhost:3000](http://localhost:3000) | `admin` | `admin` | Dashboards y visualización de telemetría |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | `optimus_admin` | `optimus_password` | Almacenamiento de modelos ML (`sales_xgboost.joblib`) |
| **PostgreSQL** | `localhost:5432` | `optimus` | `optimus_password` | Base de datos relacional (`optimus_identity`) |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | Libre | N/A | Métricas HTTP y scraping de salud |
| **Qdrant Vector DB** | [http://localhost:6333/dashboard](http://localhost:6333/dashboard) | Libre | N/A | Base de datos vectorial para RAG y embeddings |
| **Redis** | `localhost:6379` | Libre | N/A | Broker y backend de resultados de Celery (OR-Tools) |

---

## 1. Sistema Principal (Identity Service / API REST)

El servicio de identidad administra los tokens de autenticación JWT (JSON Web Tokens) con expiración de 60 minutos.

### Cuenta Administradora Preconfigurada:
* **Nombre de Usuario:** `admin_supererp`
* **Correo Electrónico:** `admin@supererp.com`
* **Contraseña:** `SuperSecretPassword123`

### Endpoints Clave de Identidad (vía API Gateway en puerto 8000):
* **Inicio de Sesión (Login):**
  * `POST http://localhost:8000/api/v1/identity/auth/login`
  * Body (Form Data): `username=admin_supererp&password=SuperSecretPassword123`
  * Retorna: `{"access_token": "<token_jwt>", "token_type": "bearer"}`
* **Registro de Nuevos Usuarios:**
  * `POST http://localhost:8000/api/v1/identity/auth/register`
  * Body (JSON):
    ```json
    {
      "username": "nuevo_usuario",
      "email": "usuario@empresa.com",
      "password": "PasswordSegura123"
    }
    ```
* **Consulta de Usuario Autenticado:**
  * `GET http://localhost:8000/api/v1/identity/users/me`
  * Header: `Authorization: Bearer <access_token>`

---

## 2. Panel Visual Frontend (React 19 + Vite + TailwindCSS)

* **URL Local:** **`http://localhost:5173`**
* **Acceso:** Inmediato desde el navegador.

### Módulos Integrados y Navegables:
1. **Inicio (`/`):** Métricas consolidadas del sistema y acceso directo a los 4 motores.
2. **Optimización (`/optimization`):** Editor de matrices de asignación, restricciones lógicas, importación/exportación CSV y resolución asíncrona mediante Celery y Google OR-Tools (MIP SCIP).
3. **Predicción (`/prediction`):** Estimación de ventas mediante modelo XGBoost descargado desde MinIO.
4. **Simulación Monte Carlo (`/simulation`):** Análisis probabilístico de rentabilidad y riesgo corporativo (percentiles VaR p5, p95 y probabilidad de pérdida).
5. **Reglas de Negocio (`/rules`):** Evaluador dinámico JSON AST con escenarios de descuento, prevención de fraude y logística express.
6. **Interpretar con IA (`/chat`):** Asistente cognitivo que clasifica intenciones en lenguaje natural y deriva directamente a los motores correspondientes.

---

## 3. Grafana (Monitoreo de Infraestructura)

* **URL de Acceso:** **`http://localhost:3000`**
* **Usuario:** `admin`
* **Contraseña:** `admin`
* **Configuración Inicial:** En el primer inicio de sesión, solicitará establecer una nueva contraseña; se puede definir una personalizada o hacer clic en **"Skip"** para mantenerla temporalmente.

---

## 4. MinIO Console (Object Storage S3)

Panel de administración de almacenamiento de objetos donde residen los binarios de Machine Learning entrenados:
* **Consola Web:** **`http://localhost:9001`**
* **Puerto API S3:** `http://localhost:9000`
* **Usuario Administrador:** `optimus_admin`
* **Contraseña:** `optimus_password`
* **Buckets Activos:** `ml-models` (almacena `sales_xgboost.joblib`).

---

## 5. Base de Datos Relacional PostgreSQL

* **Host / Puerto:** `localhost:5432` *(nombre interno en red docker: `postgres`)*
* **Base de Datos:** `optimus_identity`
* **Usuario:** `optimus`
* **Contraseña:** `optimus_password`
* **String de Conexión Estándar:**
  ```text
  postgresql://optimus:optimus_password@localhost:5432/optimus_identity
  ```
* **Tablas Principales:** `users` (id, username, email, hashed_password, created_at).

---

## 6. Documentación Interactiva de APIs (Swagger / OpenAPI)

Para probar manualmente cualquier endpoint de los microservicios sin necesidad de frontend:
* **URL Swagger UI:** **`http://localhost:8000/docs`**
* **Especificación OpenAPI (JSON):** `http://localhost:8000/openapi.json`
