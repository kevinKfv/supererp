# Guía de Despliegue en Cloudflare Pages — SuperERP (OptimusAI) ⚡

Esta guía contiene el instructivo **paso a paso** para desplegar la aplicación en **Cloudflare Pages**, con CDN global en el Edge, certificado SSL automático y alta disponibilidad sin costo.

---

## 🗺️ Índice
1. [Requisitos Previos](#-requisitos-previos)
2. [Estructura del Proyecto y Regla de Redirección SPA](#-estructura-del-proyecto-y-regla-de-redirección-spa)
3. [Opción 1: Despliegue Automático con Git (GitHub / GitLab)](#-opción-1-despliegue-automático-con-git-recomendado)
   - [Paso 1: Iniciar sesión en Cloudflare](#paso-1-iniciar-sesión-en-cloudflare)
   - [Paso 2: Conectar el Repositorio](#paso-2-conectar-el-repositorio)
   - [Paso 3: Configurar el Build de Vite](#paso-3-configurar-el-build-de-vite)
   - [Paso 4: Variables de Entorno](#paso-4-variables-de-entorno)
   - [Paso 5: Desplegar](#paso-5-desplegar)
4. [Opción 2: Despliegue Directo desde Terminal con Wrangler CLI](#-opción-2-despliegue-directo-desde-terminal-con-wrangler-cli)
5. [Dominio Personalizado y Certificado SSL](#-dominio-personalizado-y-certificado-ssl)
6. [Resolución de Problemas Comunes (Troubleshooting)](#-resolución-de-problemas-comunes-troubleshooting)

---

## 📋 Requisitos Previos

1. Una cuenta activa y gratuita en [Cloudflare](https://dash.cloudflare.com/sign-up).
2. Tener el código del proyecto en tu cuenta de GitHub (ej. `kevinKfv/supererp` o tu repositorio propio).

---

## 📁 Estructura del Proyecto y Regla de Redirección SPA

La aplicación está construida con **React 19**, **Vite** y **React Router**. Para evitar que al recargar páginas internas (como `/optimization`, `/prediction`, `/rules` o `/chat`) Cloudflare devuelva un error HTTP 404, se utiliza un archivo de redirección SPA.

El archivo [`_redirects`](file:///c:/Users/jazmin/.gemini/antigravity-ide/scratch/supererp/optimus-ai/frontend/public/_redirects) ya se encuentra configurado en la carpeta pública:

```text
optimus-ai/
  frontend/
    public/
      _redirects       <-- /*   /index.html   200
    src/
    package.json
    vite.config.ts
```

Contenido del archivo `_redirects`:
```text
/*    /index.html   200
```
Cuando Vite compila el proyecto, este archivo se copia directamente en la raíz de `dist/` e instruye a Cloudflare Pages a canalizar todas las rutas hacia `index.html`.

---

## 🚀 Opción 1: Despliegue Automático con Git (Recomendado)

Cada vez que realices un `git push` a tu repositorio, Cloudflare Pages compilará y actualizará el sitio automáticamente.

### Paso 1: Iniciar sesión en Cloudflare
1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com).
2. En el menú lateral izquierdo, haz clic en **Workers & Pages** (o **Compute > Workers & Pages**).
3. Haz clic en el botón azul **Create application**.
4. Ve a la pestaña **Pages** y selecciona **Connect to Git**.

---

### Paso 2: Conectar el Repositorio
1. Selecciona tu cuenta de GitHub/GitLab (si no lo has hecho antes, autoriza el acceso a tus repositorios).
2. Elige el repositorio del proyecto (por ejemplo `supererp`).
3. Haz clic en **Begin setup**.

---

### Paso 3: Configurar el Build de Vite

Completa los campos en la pantalla de configuración:

| Campo | Valor | Explicación |
| :--- | :--- | :--- |
| **Project name** | `supererp-app` *(o el nombre que elijas)* | Será el prefijo de tu URL `*.pages.dev` |
| **Production branch** | `main` | Rama que se desplegará en producción |
| **Framework preset** | **`Vite`** | Configura los valores por defecto de Vite |
| **Root directory** | **`optimus-ai/frontend`** | ⚠️ **Obligatorio:** La app web está en esta subcarpeta |
| **Build command** | `npm run build` | Compila TypeScript y empaqueta la app |
| **Build output directory** | `dist` | Carpeta de salida generada por Vite |

---

### Paso 4: Variables de Entorno

En la sección **Environment variables (advanced)**, agrega las siguientes variables para el entorno de **Production**:

| Variable | Valor | Descripción |
| :--- | :--- | :--- |
| **`NODE_VERSION`** | `20` | Asegura que Cloudflare compile con Node.js 20 compatible con React 19 |
| **`VITE_API_URL`** | *(URL de tu API o déjalo vacío)* | URL pública de tu API si conectas un backend externo (ej. `https://api.tudominio.com`). No incluir barra final `/` |

---

### Paso 5: Desplegar
1. Haz clic en **Save and Deploy**.
2. Cloudflare descargará el repositorio, instalará las dependencias y construirá la aplicación en su red mundial.
3. En aproximadamente 1 minuto el despliegue habrá concluido y verás tu URL activa:
   ```
   https://supererp-app.pages.dev
   ```

---

## 💻 Opción 2: Despliegue Directo desde Terminal con Wrangler CLI

Si prefieres subir la aplicación directamente desde tu computadora sin conectar Git:

### 1. Ubicarse en el directorio del frontend
```powershell
cd optimus-ai/frontend
```

### 2. Instalar dependencias y compilar
```powershell
npm install
npm run build
```
Esto creará la carpeta `dist/` con todos los archivos estáticos empaquetados y optimizados.

### 3. Publicar en Cloudflare Pages
```powershell
npx wrangler pages deploy dist --project-name supererp-app
```
- La primera vez se abrirá una ventana de navegador para autorizar tu cuenta de Cloudflare.
- Una vez completado, Cloudflare Pages te entregará inmediatamente tu enlace `https://supererp-app.pages.dev`.

---

## 🌐 Dominio Personalizado y Certificado SSL

Para asociar tu propio dominio (ej. `app.midominio.com`):

1. En el panel de Cloudflare, ve a **Workers & Pages** y entra a tu proyecto `supererp-app`.
2. Haz clic en la pestaña **Custom domains**.
3. Haz clic en **Set up a custom domain**.
4. Escribe tu dominio o subdominio.
5. Si el dominio está gestionado en Cloudflare, se configurará automáticamente con SSL activado en segundos. Si está en otro proveedor, añade el registro CNAME indicado por Cloudflare.

---

## 🛠️ Resolución de Problemas Comunes (Troubleshooting)

### 1. Error 404 al recargar rutas internas en el navegador
- **Causa:** El servidor web busca una carpeta física con el nombre de la ruta en vez de cargar la aplicación React.
- **Solución:** Verifica que el archivo [`optimus-ai/frontend/public/_redirects`](file:///c:/Users/jazmin/.gemini/antigravity-ide/scratch/supererp/optimus-ai/frontend/public/_redirects) contenga:
  ```
  /*    /index.html   200
  ```
  Este archivo se copia automáticamente a `dist/` al compilar.

### 2. Fallo en el Build: incompatibilidad de versión de Node.js
- **Causa:** Cloudflare Pages usa por defecto una versión anterior de Node que no soporta ciertas características de React 19 o Vite.
- **Solución:** En Cloudflare Pages ➡️ **Settings** ➡️ **Environment variables**, añade:
  - Variable: `NODE_VERSION`
  - Valor: `20`
  Luego ve a la pestaña **Deployments** y haz clic en **Retry deployment**.

### 3. Build fallido: `sh: vite: command not found` o error al encontrar package.json
- **Causa:** No se configuró el **Root directory** y Cloudflare intentó buscar el build en la raíz del repositorio.
- **Solución:** En Cloudflare Pages ➡️ **Settings** ➡️ **Builds & deployments**, configura **Root directory** en:
  ```
  optimus-ai/frontend
  ```
