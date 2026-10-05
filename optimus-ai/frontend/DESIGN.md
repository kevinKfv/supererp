---
name: OptimusAI Frontend
description: Interfaz de trabajo para analizar decisiones empresariales.
colors:
  background: "#030712"
  surface: "#111827"
  primary: "#3B82F6"
  primary-dark: "#1D4ED8"
  secondary: "#10B981"
  accent: "#8B5CF6"
  accent-light: "#A78BFA"
  text-primary: "#F3F4F6"
  text-secondary: "#9CA3AF"
  error: "#F87171"
  warning: "#FBBF24"
  white: "#FFFFFF"
typography:
  page-title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
  metric:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
rounded:
  lg: "8px"
  xl: "12px"
  2xl: "16px"
spacing:
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    height: "44px"
---

# Design System: OptimusAI

## 1. Overview

Este documento fija la dirección visual del frontend. Conserva los colores y la escala básica existentes, y establece reglas para las próximas pantallas y correcciones. Los tokens del encabezado son la referencia de valores; el código todavía no implementa todas las reglas descritas aquí.

OptimusAI es una herramienta de trabajo. Cada pantalla debe permitir identificar el estado del sistema, entender los datos y encontrar la siguiente acción sin depender de efectos decorativos. La interfaz utiliza un tema oscuro y una tipografía de sistema; la información y los estados tienen prioridad sobre los brillos y las animaciones.

**Características clave:** navegación clara, datos con contexto, componentes de comportamiento predecible y uso cómodo en desktop y mobile. El idioma principal de la interfaz es español; los nombres técnicos se conservan solo cuando ayudan a comprender una función.

## 2. Colors

La base es azul oscuro. El azul primario identifica acciones y selección; el verde, ámbar y rojo comunican estados. El violeta es un acento secundario y no compite con la acción principal.

### Primary

- **Azul de acción:** botones principales, enlaces y navegación activa.
- **Azul oscuro:** estado hover o pressed de la acción principal.

### Secondary

- **Verde de éxito:** resultados favorables confirmados. Un número negativo no se pinta automáticamente de rojo: el significado depende de la métrica.

### Tertiary

- **Violeta de apoyo:** énfasis puntual y elementos de la identidad. No usarlo como segunda acción principal dentro de la misma pantalla.

### Neutral

- **Fondo:** lienzo de la aplicación.
- **Superficie:** paneles, tarjetas y campos; separar capas primero con tono y espaciado.
- **Texto principal y secundario:** títulos, valores, descripciones y metadatos. Los placeholders y textos informativos deben alcanzar al menos 4.5:1 de contraste sobre su fondo real.
- **Error y advertencia:** acompañar siempre el color con texto o ícono comprensible.

**Regla de color funcional.** Reservar el azul intenso para aquello que se puede accionar o está seleccionado. Evitar gradientes en texto, brillos repetidos y colores de estado sin significado explícito.

## 3. Typography

**Familia:** `ui-sans-serif, system-ui, sans-serif`, coherente con la pila `font-sans` del proyecto. No se necesita una fuente adicional para el producto.

### Hierarchy

- **Título de página:** un `h1` por vista, con el rol `page-title`. El dashboard actual usa un tamaño mayor; unificar la escala entre dashboard, chat y futuras secciones.
- **Sección:** `h2` para bloques principales como rendimiento y actividad; `h3` para títulos dentro de esos bloques.
- **Métrica:** el valor usa el rol `metric`; la etiqueta se muestra antes y explica unidad y período cuando corresponda.
- **Cuerpo:** texto de lectura y ayuda con líneas de hasta 65–75 caracteres cuando el contenido sea descriptivo.
- **Etiqueta:** controles, metadatos y estados breves. No depender del placeholder como única etiqueta de un campo.

**Regla de lectura.** La jerarquía debe surgir de tamaño, peso y espaciado; las mayúsculas, el color y el brillo no sustituyen un encabezado claro.

## 4. Elevation

La profundidad se comunica principalmente con la diferencia entre fondo y superficie. El estilo actual de `.glass-card` usa transparencia, desenfoque y sombra amplia; esas capas se reservan para casos donde separen contenido de forma útil. Las tarjetas habituales deben ser más sobrias.

- **Panel base:** superficie sólida o casi sólida, borde sutil y sin sombra obligatoria.
- **Elemento elevado:** sombra corta y discreta solo cuando la superposición o interacción lo justifique.
- **Foco:** contorno visible y consistente para teclado; nunca quitar el outline sin reemplazo.

**Regla de una sola profundidad.** No acumular borde, sombra grande, blur y glow en el mismo componente.

## 5. Components

### Buttons

- **Primario:** azul de acción, texto blanco, altura mínima de 44 px y radio de 8 px. Usarlo una vez por grupo de acciones.
- **Secundario o textual:** menor énfasis, pero apariencia claramente interactiva. Todo botón visible debe ejecutar una acción; si no existe destino, no mostrarlo como control activo.
- **Estados:** default, hover, focus-visible, pressed, disabled, loading, success y error cuando correspondan. Los botones de solo ícono necesitan nombre accesible.

### Cards / Containers

- **Forma:** radio de 16 px y espaciado interno habitual de 24 px.
- **Uso:** agrupar información relacionada. No levantar ni animar una tarjeta en hover si no es clicable.
- **Métricas:** mostrar nombre, valor, unidad, período, variación y sentido favorable o desfavorable. Identificar de forma visible los datos de demostración.
- **Datos vacíos:** explicar qué falta y ofrecer una acción útil; evitar paneles grandes que solo anuncien una integración futura.

### Inputs / Fields

- **Forma:** altura mínima de 44 px, radio de 12 px y etiqueta visible.
- **Foco:** anillo de foco perceptible sobre el fondo oscuro.
- **Estados:** ayuda, error, disabled y loading con mensajes específicos. El placeholder es un ejemplo, no una etiqueta.

### Navigation

- **Desktop:** barra lateral con nombre, icono y estado activo distinguible sin depender solo del color.
- **Mobile:** navegación compacta que deje el contenido disponible sin desplazamiento horizontal. El contenido usa un solo scroll principal.
- **Destinos incompletos:** señalarlos antes de entrar o retirarlos de la navegación hasta que ofrezcan una tarea útil.

### Chat

- **Mensajes:** distinguir usuario, respuesta y error con texto además del color.
- **Carga:** anunciar el estado y mantener el contexto de la conversación.
- **Error:** explicar el problema sin suponer su causa y ofrecer reintento cuando sea posible.
- **Estado inicial:** mantener una sugerencia concreta de consulta.

## 6. Do's and Don'ts

- **Do:** conservar la paleta oscura y aplicar los tokens de forma consistente entre pantallas.
- **Do:** escribir el texto de la interfaz en español, con fechas y variaciones numéricas formateadas de forma coherente.
- **Do:** comprobar desktop y mobile; ningún control ni dato importante debe quedar fuera del viewport.
- **Do:** mostrar estados de carga, vacío, error y éxito cuando una vista dependa de datos o de una acción.
- **Do:** mantener contraste de texto normal de al menos 4.5:1, controles de al menos 44 px y foco visible; respetar `prefers-reduced-motion`.
- **Don't:** presentar métricas o actividad ficticia como información actual.
- **Don't:** usar glassmorphism, gradientes de texto, sombras amplias y brillos como estilo por defecto de todas las tarjetas.
- **Don't:** crear botones sin acción, bloques con cursor de clic que no se puedan operar con teclado o campos sin etiqueta.
- **Don't:** añadir tablas, modales o componentes genéricos antes de que una pantalla concreta los necesite.
