# Documento de Requisitos de Producto (PRD) — OptimusAI

| Campo | Valor |
|---|---|
| Producto | OptimusAI |
| Estado del documento | Versión inicial basada en el repositorio |
| Audiencia principal | Analistas de negocio y planificación operativa |
| Idioma del producto observado | Mixto: español e inglés |
| Fuente principal | Código y configuración del repositorio |
| Método de validación | Inspección estática; no se validó el sistema de extremo a extremo |

## Convenciones del documento

Este PRD diferencia explícitamente el estado de cada capacidad:

- **Implementado:** existe comportamiento comprobable en el código actual.
- **Parcial o simulado:** existe una interfaz o lógica limitada, estática, en memoria, basada en heurísticas o dependiente de componentes no integrados.
- **Propuesto:** comportamiento requerido para convertir las capacidades existentes en un producto integrado.
- **Futuro / fuera de alcance:** visión mencionada o posible evolución que no forma parte del alcance inmediato.

El código es la fuente principal para describir el estado actual. `README.md` y `TESTING_PLAN.md` se utilizan para reconocer intención y trabajo planificado, pero no como prueba de una funcionalidad terminada.

---

## 1. Descripción general del producto

### 1.1 Descripción del producto

OptimusAI es un prototipo de plataforma de apoyo a decisiones empresariales. Reúne capacidades de optimización matemática, predicción, simulación de escenarios, evaluación de reglas e interpretación de instrucciones en lenguaje natural.

La visión del producto es permitir que un analista formule un problema, ejecute un análisis y comprenda sus resultados desde una interfaz central. El repositorio contiene motores independientes que demuestran estas capacidades, pero todavía no conforman un flujo de producto completo.

### 1.2 Problema que resuelve

Los analistas suelen trabajar con herramientas separadas para asignar recursos, estimar resultados, evaluar riesgos y aplicar reglas de negocio. Esto fragmenta la información, dificulta el seguimiento de los análisis y obliga a interpretar resultados técnicos sin una experiencia unificada.

OptimusAI busca reducir esa fragmentación mediante:

- Un punto central para iniciar distintos tipos de análisis.
- Formularios comprensibles para ingresar parámetros de negocio.
- Resultados explicados y presentados de manera consistente.
- Seguimiento del estado de operaciones que pueden tardar en completarse.
- Visibilidad sobre la actividad y disponibilidad de las capacidades del sistema.

### 1.3 Usuarios objetivo

| Usuario | Necesidad principal | Alcance en este PRD |
|---|---|---|
| Analista de negocio | Ejecutar análisis, comparar resultados y comprender recomendaciones | Usuario principal |
| Planificador de operaciones | Optimizar asignaciones y evaluar escenarios de costos, ingresos y riesgo | Usuario principal |
| Administrador del sistema | Consultar disponibilidad, gestionar acceso y diagnosticar fallos básicos | Usuario secundario |
| Equipo de datos | Entrenar o actualizar modelos predictivos y revisar su disponibilidad | Usuario secundario; responsabilidades detalladas pendientes |

### 1.4 Propuesta de valor

OptimusAI ofrece un espacio unificado para convertir datos y objetivos de negocio en análisis reproducibles y resultados comprensibles. Su valor esperado está en reducir el trabajo manual entre herramientas y hacer visibles las condiciones, estados y limitaciones de cada cálculo.

### 1.5 Estado de madurez

**Parcial o simulado.** El proyecto es un prototipo técnico. Varios motores tienen endpoints y lógica funcional aislada; el frontend solo se conecta directamente con el Knowledge Engine. No existe evidencia en el repositorio de una experiencia completa, segura y persistente lista para uso empresarial.

---

## 2. Objetivos del producto

### 2.1 Objetivos principales

1. Permitir que un analista acceda de forma segura a las capacidades disponibles.
2. Ofrecer flujos guiados para optimización, predicción, simulación y evaluación de reglas.
3. Presentar el estado, resultado y errores de cada análisis de forma clara.
4. Sustituir métricas y actividad simuladas por información derivada de ejecuciones reales.
5. Usar el asistente para interpretar solicitudes y explicar resultados sin afirmar que ejecutó acciones que no ocurrieron.
6. Integrar los servicios mediante un punto de entrada coherente y observable.

### 2.2 Resultados esperados para el usuario

El producto debe ayudar al usuario a:

- Crear y consultar una asignación de recursos basada en una matriz de costos.
- Entrenar o seleccionar un modelo de ventas y solicitar predicciones con entradas válidas.
- Ejecutar una simulación de rentabilidad y entender el rango de resultados y la probabilidad de pérdida.
- Evaluar reglas contra hechos de negocio y revisar qué acciones fueron activadas.
- Expresar una intención en lenguaje natural y confirmar cómo fue interpretada.
- Consultar análisis recientes y distinguir ejecuciones pendientes, exitosas y fallidas.

### 2.3 Objetivos de producto medibles

- Todos los módulos **Must Have** deben estar disponibles desde la navegación principal.
- Todo envío debe mostrar confirmación, progreso o error explícito; ninguna acción debe fallar silenciosamente.
- Los datos presentados como reales deben provenir de servicios o ejecuciones reales y mostrar su momento de actualización.
- Los flujos principales deben poder completarse usando teclado y cumplir WCAG 2.1 nivel AA.
- Ninguna credencial, secreto o configuración sensible de producción debe quedar embebida en el cliente o el repositorio.

Las metas de adopción, ahorro, precisión de modelos, disponibilidad y volumen requieren una línea base de negocio y permanecen abiertas.

### 2.4 Fuera de alcance

- Construir un ERP transaccional completo.
- Ejecutar decisiones empresariales automáticamente sin revisión humana.
- Soportar cualquier modelo matemático, predictivo o regla arbitraria.
- Presentar la extracción heurística actual como un modelo de IA generativa.
- Implementar RAG o búsqueda vectorial hasta definir fuentes, permisos y criterios de calidad.
- Ofrecer garantías de alta disponibilidad, escalabilidad o recuperación ante desastres sin validación operativa.
- Certificar un despliegue Kubernetes para producción.

---

## 3. Estado actual del producto

### 3.1 Páginas y navegación existentes

| Ruta | Nombre visible | Estado | Comportamiento actual |
|---|---|---|---|
| `/` | Dashboard | **Parcial o simulado** | Muestra cuatro métricas fijas, un espacio reservado para un gráfico y tres actividades estáticas. El botón “View Details” no tiene flujo asociado. |
| `/optimization` | Optimization | **Parcial o simulado** | Muestra únicamente el texto “Optimization UI (En desarrollo)”. |
| `/prediction` | Prediction Lab | **Parcial o simulado** | Muestra únicamente el texto “Prediction Lab (En desarrollo)”. |
| `/chat` | Knowledge AI | **Parcial o simulado** | Permite enviar texto al Knowledge Engine, muestra un indicador de carga, una explicación y la intención extraída. Muestra un mensaje de error genérico si falla la comunicación. |

La aplicación utiliza una barra lateral fija con las cuatro rutas. También muestra un perfil estático llamado “Admin User” con “Enterprise Plan”; no está vinculado al servicio de identidad.

### 3.2 Capacidades backend existentes

| Módulo | Estado | Capacidad verificada | Limitación principal |
|---|---|---|---|
| Gateway | **Parcial o simulado** | Expone raíz, salud y métricas HTTP | Las rutas generales responden `501`; no autentica ni reenvía solicitudes |
| Identidad | **Parcial o simulado** | Registro, login con token JWT y consulta del usuario actual | Usuarios en memoria, secreto embebido, sin roles ni persistencia |
| Optimización | **Implementado de forma aislada** | Encola una asignación por matriz de costos y permite consultar estado y resultado | Sin interfaz; validación insuficiente de matrices; depende de cola y worker |
| Predicción | **Implementado de forma aislada** | Entrena un modelo de ventas con datos recibidos o sintéticos y genera predicciones | Sin interfaz; esquema de variables no formalizado; ciclo de vida del modelo limitado |
| Simulación | **Implementado de forma aislada** | Ejecuta una simulación Monte Carlo de rentabilidad y devuelve percentiles y probabilidad de pérdida | Sin interfaz; semilla fija; faltan límites y validaciones de negocio |
| Reglas | **Implementado de forma aislada** | Evalúa condiciones, prioridades y lógica AND/OR contra hechos enviados | Sin interfaz ni persistencia; operadores y acciones son limitados |
| Knowledge Engine | **Parcial o simulado** | Identifica algunas intenciones, objetivos y porcentajes mediante reglas heurísticas y genera una explicación | No usa un LLM, RAG ni Qdrant; no invoca otros motores |
| Observabilidad | **Parcial** | Prometheus está configurado para consultar métricas del gateway; Grafana está declarado | No hay paneles versionados ni métricas equivalentes para todos los servicios |

### 3.3 Flujos de usuario existentes

#### Flujo A — Consultar el dashboard

1. El usuario abre `/`.
2. El sistema muestra métricas, actividad y un área de gráfico.
3. Todo el contenido de negocio es estático y no permite profundizar en resultados.

Estado: **Parcial o simulado**.

#### Flujo B — Interpretar una instrucción

1. El usuario abre `/chat`.
2. Escribe una instrucción y la envía.
3. El frontend llama directamente al Knowledge Engine en una dirección local fija.
4. El sistema clasifica la instrucción mediante coincidencias de palabras y extrae un porcentaje cuando existe.
5. La interfaz presenta la explicación y el objeto de intención.

Estado: **Parcial o simulado**. La explicación puede indicar que enviará parámetros a otro motor, aunque esa acción no se ejecuta.

#### Flujo C — Consumir motores mediante API

Los endpoints permiten registrar o autenticar usuarios, iniciar una optimización, entrenar o consultar un modelo, ejecutar una simulación y evaluar reglas. Estos flujos requieren acceso técnico directo y no están disponibles como experiencia de usuario integrada.

Estado: **Implementado de forma aislada**.

### 3.4 Infraestructura y entrega

- Docker Compose declara servicios de datos, motores, frontend y observabilidad.
- El archivo Compose no declara el gateway ni el servicio de identidad.
- El repositorio solo contiene un Dockerfile para el frontend, aunque Compose intenta construir varios servicios desde sus directorios.
- Los manifiestos Kubernetes incluyen frontend, gateway, identidad, Knowledge Engine, PostgreSQL, Redis y Qdrant, pero no despliegan todos los motores declarados en la configuración.
- Kafka y Zookeeper están declarados en Compose, pero no existe uso observable en el código de los servicios.
- Qdrant está declarado como dependencia, pero el Knowledge Engine no lo consulta.
- La integración continua ejecuta pruebas por servicio, pero permite que servicios sin pruebas finalicen correctamente y la prueba frontend actual no renderiza la aplicación.

Estado: **Parcial o simulado**.

### 3.5 Limitaciones actuales

- No hay autenticación, autorización ni cierre de sesión en el frontend.
- Los usuarios se pierden cuando reinicia el servicio de identidad.
- El dashboard presenta cifras y eventos que no provienen del sistema.
- El frontend evita el gateway y llama directamente al Knowledge Engine.
- Las URLs y algunos secretos están embebidos.
- Los motores no comparten un historial de ejecuciones ni un modelo común de estados.
- No hay flujos de frontend para optimización, predicción, simulación o reglas.
- El asistente interpreta un conjunto reducido de palabras y no conserva contexto conversacional.
- No existe evidencia de RAG, búsqueda vectorial ni ejecución automática de intenciones.
- Los estados vacíos, errores y validaciones son incompletos.
- La barra lateral fija y el ancho de algunas vistas no ofrecen una navegación móvil completa.
- La cobertura automatizada es limitada y no demuestra los flujos de extremo a extremo descritos en el plan de pruebas.

### 3.6 Evidencia principal del repositorio

| Área | Evidencia |
|---|---|
| Rutas y pantallas | `optimus-ai/frontend/src/App.tsx`, `pages/Dashboard.tsx`, `pages/Chat.tsx` |
| Navegación | `optimus-ai/frontend/src/components/Layout.tsx` |
| APIs y lógica | `optimus-ai/services/*/app/` |
| Ejecución local | `optimus-ai/docker-compose.yml` |
| Despliegue declarado | `optimus-ai/k8s/` |
| Observabilidad | `optimus-ai/prometheus.yml` |
| Cobertura existente | `.github/workflows/ci.yml`, pruebas de cada servicio y `TESTING_PLAN.md` |

---

## 4. Requisitos funcionales

Los requisitos de esta sección describen el producto objetivo derivado de los módulos existentes. Salvo indicación contraria, su estado es **Propuesto**.

### 4.1 Acceso e identidad

| ID | Requisito | Comportamiento del usuario | Comportamiento del sistema | Prioridad |
|---|---|---|---|---|
| FR-AUTH-01 | Registro | El usuario crea una cuenta con nombre, correo y contraseña | Valida campos, evita duplicados y persiste la cuenta sin exponer la contraseña | Must Have |
| FR-AUTH-02 | Inicio de sesión | El usuario ingresa sus credenciales | Valida las credenciales, crea una sesión con vencimiento y dirige al dashboard | Must Have |
| FR-AUTH-03 | Sesión protegida | El usuario accede a módulos habilitados | Requiere una sesión válida y rechaza solicitudes no autorizadas de forma consistente | Must Have |
| FR-AUTH-04 | Cierre y vencimiento | El usuario cierra sesión o su sesión expira | Invalida el acceso local, limpia datos sensibles y solicita autenticación nuevamente | Must Have |
| FR-AUTH-05 | Perfil básico | El usuario consulta su identidad actual | Muestra datos provenientes del servicio de identidad, no valores estáticos | Should Have |

La definición de roles y permisos queda abierta. Hasta resolverla, todos los usuarios autenticados tendrán acceso equivalente a los módulos de análisis y las acciones administrativas deberán permanecer restringidas.

### 4.2 Integración y punto de entrada

| ID | Requisito | Comportamiento esperado | Prioridad |
|---|---|---|---|
| FR-INT-01 | Punto de entrada único | El cliente consume los módulos mediante una dirección configurable y coherente | Must Have |
| FR-INT-02 | Propagación de identidad | Las solicitudes protegidas transportan y validan la identidad del usuario | Must Have |
| FR-INT-03 | Errores uniformes | Los módulos devuelven errores con código, mensaje comprensible y detalle diagnóstico no sensible | Must Have |
| FR-INT-04 | Identificador de ejecución | Todo análisis iniciado recibe un identificador estable para consultar su estado o resultado | Must Have |
| FR-INT-05 | Trazabilidad | Las solicitudes correlacionadas conservan un identificador común en registros y métricas | Should Have |

### 4.3 Dashboard

| ID | Requisito | Comportamiento esperado | Prioridad |
|---|---|---|---|
| FR-DASH-01 | Resumen real | Mostrar cantidad y estado de ejecuciones reales, sin métricas ficticias | Must Have |
| FR-DASH-02 | Actividad reciente | Mostrar tipo de análisis, estado, fecha y acceso al detalle | Must Have |
| FR-DASH-03 | Actualización | Indicar cuándo se actualizaron los datos y permitir reintentar si falla la carga | Must Have |
| FR-DASH-04 | Navegación contextual | Cada indicador o actividad debe abrir la vista relacionada cuando exista | Should Have |
| FR-DASH-05 | Filtros | Permitir filtrar actividad por módulo, estado y período | Could Have |

### 4.4 Optimización de asignaciones

| ID | Requisito | Comportamiento del usuario | Comportamiento del sistema | Prioridad |
|---|---|---|---|---|
| FR-OPT-01 | Crear problema | El usuario ingresa una matriz de costos | Valida que sea rectangular, numérica, no vacía y factible para el modelo soportado | Must Have |
| FR-OPT-02 | Iniciar ejecución | El usuario confirma la matriz | Crea una ejecución asíncrona y muestra su identificador y estado inicial | Must Have |
| FR-OPT-03 | Consultar progreso | El usuario permanece en la vista o regresa luego | Actualiza el estado sin duplicar la tarea y permite reanudar la consulta | Must Have |
| FR-OPT-04 | Ver resultado | El usuario abre una ejecución finalizada | Muestra asignaciones, costo individual, costo total y estado de la solución | Must Have |
| FR-OPT-05 | Manejar fallo | La tarea es inválida, imposible o falla | Diferencia error de validación, problema no factible y error operativo; permite corregir o reintentar | Must Have |
| FR-OPT-06 | Historial | El usuario consulta ejecuciones anteriores | Muestra ejecuciones persistidas con estado y fecha | Should Have |

El alcance inicial cubre exclusivamente el problema de asignación presente en el repositorio. Otros modelos MIP, CP o LP quedan fuera del alcance inmediato.

### 4.5 Predicción de ventas

| ID | Requisito | Comportamiento del usuario | Comportamiento del sistema | Prioridad |
|---|---|---|---|---|
| FR-PRED-01 | Disponibilidad del modelo | El usuario conoce si existe un modelo utilizable | Informa estado, fecha de entrenamiento y esquema de variables requerido | Must Have |
| FR-PRED-02 | Entrenar modelo | Un usuario autorizado proporciona datos válidos o inicia el conjunto de demostración | Valida el conjunto, entrena el modelo, registra el resultado y comunica si fue almacenado | Must Have |
| FR-PRED-03 | Solicitar predicción | El usuario ingresa una o más filas con las variables esperadas | Valida cantidad, orden, nombres y valores antes de procesar | Must Have |
| FR-PRED-04 | Presentar resultado | El usuario consulta la respuesta | Muestra cada predicción asociada a su entrada y la versión o fecha del modelo | Must Have |
| FR-PRED-05 | Falta de modelo | El usuario intenta predecir sin modelo disponible | Explica que debe existir un modelo entrenado y ofrece el siguiente paso autorizado | Must Have |
| FR-PRED-06 | Comparar ejecuciones | El usuario compara predicciones o versiones | Conserva resultados y metadatos mínimos para comparación | Could Have |

El significado definitivo de las variables de entrada, la variable objetivo y las reglas de calidad del conjunto de entrenamiento deben resolverse antes de considerar este módulo apto para datos reales.

### 4.6 Simulación de rentabilidad

| ID | Requisito | Comportamiento del usuario | Comportamiento del sistema | Prioridad |
|---|---|---|---|---|
| FR-SIM-01 | Definir escenario | El usuario ingresa ingresos esperados, incertidumbre de ingresos, costos esperados, incertidumbre de costos e iteraciones | Explica unidades y valida valores numéricos y rangos permitidos | Must Have |
| FR-SIM-02 | Ejecutar simulación | El usuario confirma los parámetros | Ejecuta una sola simulación y muestra progreso si supera el umbral de respuesta inmediata | Must Have |
| FR-SIM-03 | Interpretar resultado | El usuario consulta el resultado | Muestra rentabilidad media, percentiles 5 y 95, probabilidad de pérdida e iteraciones ejecutadas | Must Have |
| FR-SIM-04 | Contextualizar riesgo | El usuario revisa los indicadores | Explica los percentiles sin describirlos como garantías o predicciones ciertas | Must Have |
| FR-SIM-05 | Comparar escenarios | El usuario conserva y compara dos o más conjuntos de parámetros | Presenta diferencias de entradas y resultados | Could Have |

Las desviaciones estándar no pueden ser negativas y las iteraciones deben ser enteras positivas. El límite máximo de iteraciones depende de una prueba de capacidad pendiente.

### 4.7 Reglas de negocio

| ID | Requisito | Comportamiento del usuario | Comportamiento del sistema | Prioridad |
|---|---|---|---|---|
| FR-RULE-01 | Definir reglas | El usuario crea condiciones, lógica AND/OR, acción y prioridad | Valida campos, operadores y compatibilidad de tipos | Should Have |
| FR-RULE-02 | Ingresar hechos | El usuario carga los datos contra los cuales evaluar | Permite estructuras anidadas y señala campos ausentes o incompatibles | Should Have |
| FR-RULE-03 | Evaluar | El usuario inicia la evaluación | Ordena por prioridad y devuelve resultado por regla y acciones activadas | Should Have |
| FR-RULE-04 | Explicar resultado | El usuario inspecciona una regla | Muestra qué condiciones pasaron o fallaron sin afirmar que la acción fue ejecutada | Should Have |
| FR-RULE-05 | Persistir conjuntos | El usuario guarda y reutiliza reglas | Conserva versión, autor y fecha | Could Have |

En el alcance inicial, una “acción activada” es un resultado informativo. No autoriza cambios automáticos en otros sistemas.

### 4.8 Knowledge Assistant

| ID | Requisito | Comportamiento del usuario | Comportamiento del sistema | Prioridad |
|---|---|---|---|---|
| FR-KNOW-01 | Enviar solicitud | El usuario escribe una instrucción de negocio | Valida que exista contenido y presenta un estado de procesamiento | Must Have |
| FR-KNOW-02 | Mostrar interpretación | El usuario revisa la respuesta | Presenta intención, objetivo, parámetros extraídos y explicación en lenguaje claro | Must Have |
| FR-KNOW-03 | Manejar ambigüedad | La intención o los parámetros no son suficientes | Solicita información concreta y no inventa datos ni resultados | Must Have |
| FR-KNOW-04 | Veracidad operativa | La respuesta menciona una acción | Solo confirma ejecución si existe una ejecución real y enlaza su identificador; en caso contrario indica que es una interpretación | Must Have |
| FR-KNOW-05 | Confirmación previa | Una intención puede iniciar un análisis | Muestra los parámetros interpretados y requiere confirmación antes de enviarlos | Should Have |
| FR-KNOW-06 | Contexto conversacional | El usuario realiza preguntas relacionadas | Conserva contexto autorizado dentro de una conversación | Could Have |

La integración con un LLM, RAG o Qdrant es **Futuro / fuera de alcance** hasta definir fuentes, permisos, evaluación de calidad y tratamiento de datos sensibles.

### 4.9 Estado de servicios y operaciones

| ID | Requisito | Comportamiento esperado | Prioridad |
|---|---|---|---|
| FR-OPS-01 | Salud de módulos | Un administrador consulta qué capacidades están disponibles o degradadas | Should Have |
| FR-OPS-02 | Degradación visible | Si un módulo no está disponible, su vista lo informa y bloquea únicamente las acciones dependientes | Must Have |
| FR-OPS-03 | Reintentos seguros | Reintentar una consulta no debe crear ejecuciones duplicadas accidentalmente | Must Have |
| FR-OPS-04 | Diagnóstico | Los errores muestran un identificador que soporte puede buscar sin revelar información sensible | Should Have |

---

## 5. Requisitos del frontend

### 5.1 Páginas y vistas requeridas

| Vista | Estado actual | Requisito objetivo |
|---|---|---|
| Inicio de sesión | No existe | Formulario de acceso, validación, error de credenciales y recuperación de sesión |
| Registro | No existe en UI | Formulario de cuenta con confirmación y manejo de duplicados |
| Dashboard | Estático | Resumen y actividad basados en ejecuciones reales |
| Optimización | Placeholder | Formulario de matriz, seguimiento de tarea y resultado de asignación |
| Predicción | Placeholder | Estado del modelo, entrenamiento autorizado, entradas y resultados |
| Simulación | No existe | Formulario de escenario y resumen de riesgo |
| Reglas | No existe | Definición o carga, evaluación y explicación de resultados |
| Knowledge Assistant | Parcial | Interpretación honesta, ambigüedad, confirmación y errores accionables |
| Historial y detalle | No existe | Lista unificada y detalle de ejecuciones persistidas |
| Estado de servicios | No existe | Vista secundaria para administradores o indicador contextual |
| Ruta no encontrada | No existe | Mensaje claro y retorno seguro al dashboard |

### 5.2 Navegación

- Las vistas principales deben ser accesibles desde una navegación persistente en escritorio.
- En pantallas pequeñas, la navegación debe convertirse en un menú controlable mediante teclado, sin cubrir contenido ni bloquear el desplazamiento.
- El elemento activo debe identificarse visualmente y mediante semántica accesible.
- Los módulos no disponibles deben mostrar su estado; no deben conducir a placeholders sin explicación.
- Las rutas protegidas deben conservar el destino solicitado cuando la sesión requiera renovación.
- Cada vista de detalle debe ofrecer un camino visible de regreso al listado o módulo de origen.

### 5.3 Diseño responsive

- El producto debe ser utilizable desde 320 px de ancho sin desplazamiento horizontal global.
- Tarjetas, formularios, tablas y resultados deben reorganizarse en una sola columna cuando no exista espacio suficiente.
- Las tablas extensas deben ofrecer un tratamiento accesible para pantallas pequeñas, como desplazamiento contenido o presentación por registros.
- Las acciones principales deben permanecer visibles sin depender de hover.
- El contenido no debe quedar oculto detrás de navegación fija, fondos decorativos o barras de acciones.

### 5.4 Estados de interfaz

Cada vista que consume datos debe cubrir:

| Estado | Requisito |
|---|---|
| Inicial | Explicar el propósito y el primer paso disponible |
| Vacío | Diferenciar “sin ejecuciones” de “sin resultados para el filtro” |
| Cargando | Mostrar progreso sin bloquear navegación innecesariamente |
| En cola o procesando | Indicar estado, permitir abandonar la vista y recuperar la ejecución |
| Éxito | Confirmar la operación y presentar resultado o siguiente acción |
| Validación | Asociar cada problema con su campo y conservar entradas válidas |
| Error recuperable | Explicar qué ocurrió y ofrecer reintento seguro |
| Error no recuperable | Mostrar un identificador diagnóstico y una salida clara |
| Servicio no disponible | Identificar el módulo afectado sin presentar datos antiguos como actuales |

Los indicadores de carga deben aparecer dentro de los 200 ms posteriores a una acción si todavía no existe respuesta.

### 5.5 Formularios y validación

- Todo campo debe tener etiqueta visible, descripción de unidad o formato cuando corresponda y mensaje de error asociado.
- Los campos requeridos deben identificarse antes del envío.
- La validación de cliente debe mejorar la experiencia, pero el sistema debe repetir las validaciones relevantes al procesar la solicitud.
- Los valores numéricos deben rechazar entradas no finitas y respetar límites de negocio definidos.
- Los formularios deben conservar los valores válidos después de un error recuperable.
- El botón de envío debe evitar duplicados mientras una solicitud idéntica está en curso.
- Las confirmaciones deben reservarse para acciones costosas, destructivas o que inicien una ejecución real desde el asistente.

### 5.6 Componentes reutilizables

El frontend debe contar con patrones compartidos para:

- Estructura de página y encabezado.
- Navegación y perfil de sesión.
- Campos, matrices editables y mensajes de validación.
- Botones y acciones primarias, secundarias y de riesgo.
- Tarjetas de métricas con fuente y fecha de actualización.
- Etiquetas de estado para `Queued`, `Pending`, `Running`, `Success`, `Failure` y equivalentes normalizados.
- Tablas o listas de ejecuciones y resultados.
- Estados vacío, cargando, error y servicio no disponible.
- Notificaciones y confirmaciones.

### 5.7 Accesibilidad

- Cumplir WCAG 2.1 nivel AA en los flujos principales.
- Utilizar estructura semántica, títulos jerárquicos y regiones identificables.
- Permitir uso completo mediante teclado y mantener un orden de foco lógico.
- Mostrar foco visible en enlaces, botones, campos y controles personalizados.
- Proporcionar nombres accesibles para botones que solo contienen iconos.
- No comunicar estado únicamente mediante color.
- Mantener contraste mínimo AA para texto, controles y estados.
- Anunciar errores, resultados y cambios de estado relevantes mediante regiones vivas sin interrumpir innecesariamente.
- Respetar la preferencia de movimiento reducido para animaciones decorativas.

### 5.8 Consistencia UX y contenido

- Usar un único idioma por versión del producto; la elección inicial debe definirse antes de consolidar textos.
- Utilizar los mismos nombres de módulos en navegación, títulos, mensajes y documentación.
- Diferenciar claramente “interpretado”, “enviado”, “en proceso”, “completado” y “fallido”.
- No utilizar lenguaje como “IA”, “enterprise”, “seguro” o “optimizado” para describir capacidades que no puedan demostrarse.
- Explicar métricas de riesgo y resultados técnicos en lenguaje comprensible, conservando acceso a los datos detallados.

---

## 6. Historias de usuario

### Acceso y navegación

- Como analista de negocio, quiero iniciar sesión, para que mis análisis y resultados estén asociados a una identidad protegida.
- Como analista de negocio, quiero ver únicamente capacidades disponibles, para que no pierda tiempo en flujos que no puedo completar.
- Como usuario móvil, quiero navegar entre módulos sin perder contenido, para que pueda consultar resultados desde distintos dispositivos.
- Como administrador, quiero identificar módulos degradados, para que pueda diagnosticar por qué una función no está disponible.

### Dashboard e historial

- Como analista de negocio, quiero ver el estado de mis ejecuciones recientes, para que pueda continuar un análisis pendiente o revisar uno finalizado.
- Como analista de negocio, quiero conocer cuándo se actualizaron las métricas, para que pueda decidir si la información sigue siendo útil.
- Como analista de negocio, quiero abrir el detalle desde una actividad reciente, para que no tenga que reconstruir el contexto manualmente.

### Optimización

- Como planificador de operaciones, quiero ingresar una matriz de costos, para que el sistema determine una asignación factible de menor costo.
- Como planificador de operaciones, quiero conocer el estado de una optimización, para que pueda continuar con otras tareas mientras se procesa.
- Como planificador de operaciones, quiero ver las asignaciones y el costo total, para que pueda evaluar y comunicar la propuesta.

### Predicción

- Como analista de negocio, quiero saber qué variables requiere el modelo, para que pueda preparar entradas válidas.
- Como analista de negocio, quiero solicitar predicciones para varias filas, para que pueda analizar más de un escenario en una ejecución.
- Como integrante autorizado del equipo de datos, quiero entrenar una nueva versión del modelo, para que las predicciones utilicen datos actualizados.

### Simulación

- Como analista de riesgo, quiero ingresar supuestos de ingresos y costos, para que pueda estimar un rango de rentabilidad.
- Como analista de riesgo, quiero ver la probabilidad de pérdida y percentiles, para que pueda comunicar la incertidumbre del escenario.
- Como analista de riesgo, quiero comparar escenarios, para que pueda entender el impacto de diferentes supuestos.

### Reglas

- Como analista de negocio, quiero evaluar reglas contra hechos actuales, para que pueda identificar qué condiciones y acciones aplican.
- Como analista de negocio, quiero ver por qué una regla pasó o falló, para que pueda validar el resultado.
- Como administrador de reglas, quiero versionar conjuntos de reglas, para que los cambios sean trazables.

### Asistente

- Como analista de negocio, quiero escribir un objetivo en lenguaje natural, para que el sistema me ayude a estructurar el análisis adecuado.
- Como analista de negocio, quiero revisar los parámetros interpretados antes de ejecutar, para que pueda corregir malentendidos.
- Como analista de negocio, quiero que el asistente admita cuando falta información, para que no tome decisiones basadas en supuestos ocultos.

---

## 7. Criterios de aceptación

### 7.1 Autenticación

**AC-AUTH-01 — Registro válido**

- Dado un nombre y correo no registrados y una contraseña válida,
- cuando el usuario envía el registro,
- entonces la cuenta queda persistida, la respuesta no contiene la contraseña y el usuario puede iniciar sesión después de reiniciar el servicio.

**AC-AUTH-02 — Acceso protegido**

- Dado un usuario sin sesión válida,
- cuando intenta abrir una ruta o enviar una solicitud protegida,
- entonces el sistema rechaza el acceso, no expone datos y ofrece iniciar sesión.

**AC-AUTH-03 — Sesión vencida**

- Dada una sesión vencida,
- cuando el usuario realiza una acción protegida,
- entonces el sistema explica que debe autenticarse nuevamente y conserva de forma segura el destino o borrador cuando corresponda.

### 7.2 Dashboard

**AC-DASH-01 — Información real**

- Dadas ejecuciones registradas,
- cuando el usuario abre el dashboard,
- entonces los totales y actividades coinciden con esas ejecuciones y muestran su última actualización.

**AC-DASH-02 — Sin información**

- Dado un usuario sin ejecuciones,
- cuando abre el dashboard,
- entonces ve un estado vacío con enlaces hacia los análisis disponibles, sin métricas ficticias.

**AC-DASH-03 — Error de carga**

- Dado un fallo al obtener el resumen,
- cuando finaliza la solicitud,
- entonces el sistema no presenta datos como actuales y ofrece un reintento seguro.

### 7.3 Optimización

**AC-OPT-01 — Validación de matriz**

- Dada una matriz vacía, irregular, no numérica o incompatible con una asignación factible,
- cuando el usuario intenta enviarla,
- entonces el sistema bloquea o rechaza la ejecución y explica el problema exacto.

**AC-OPT-02 — Seguimiento asíncrono**

- Dada una matriz válida,
- cuando el usuario inicia la optimización,
- entonces recibe un identificador, ve un estado de procesamiento y puede recuperar esa ejecución después de salir de la vista.

**AC-OPT-03 — Resultado**

- Dada una optimización finalizada,
- cuando el usuario abre el detalle,
- entonces ve una asignación por tarea, sus costos y un costo total coherente con el resultado del motor.

**AC-OPT-04 — Ejecución no factible**

- Dado un problema sin solución,
- cuando el motor finaliza,
- entonces la vista muestra “no factible” como resultado del análisis y no como un fallo técnico genérico.

### 7.4 Predicción

**AC-PRED-01 — Modelo ausente**

- Dado que no existe un modelo disponible,
- cuando el usuario solicita una predicción,
- entonces el sistema no procesa la solicitud y explica el paso requerido para disponer de un modelo.

**AC-PRED-02 — Esquema de entradas**

- Dado un modelo disponible,
- cuando el usuario prepara una predicción,
- entonces la interfaz muestra las variables y formatos requeridos y rechaza filas incompletas o incompatibles.

**AC-PRED-03 — Correspondencia de resultados**

- Dadas varias filas válidas,
- cuando finaliza la predicción,
- entonces existe exactamente un resultado identificable por cada fila y se muestra el modelo utilizado.

**AC-PRED-04 — Entrenamiento**

- Dado un usuario autorizado y datos válidos,
- cuando solicita entrenamiento,
- entonces el sistema informa progreso, resultado, variables utilizadas y estado de almacenamiento del modelo.

### 7.5 Simulación

**AC-SIM-01 — Validación**

- Dados valores no numéricos, desviaciones negativas o iteraciones no positivas,
- cuando el usuario intenta ejecutar,
- entonces el sistema identifica cada campo inválido y no inicia la simulación.

**AC-SIM-02 — Resultado completo**

- Dados parámetros válidos,
- cuando finaliza la simulación,
- entonces se muestran rentabilidad media, percentiles 5 y 95, probabilidad de pérdida e iteraciones realizadas.

**AC-SIM-03 — Comunicación de incertidumbre**

- Dado un resultado de simulación,
- cuando se presenta al usuario,
- entonces la interfaz explica que los percentiles describen escenarios del modelo y no garantizan resultados futuros.

### 7.6 Reglas

**AC-RULE-01 — Evaluación**

- Dado un conjunto válido de reglas y hechos,
- cuando el usuario ejecuta la evaluación,
- entonces recibe un resultado por regla en orden de prioridad y una lista de acciones activadas.

**AC-RULE-02 — Explicación**

- Dado el resultado de una regla,
- cuando el usuario abre su detalle,
- entonces puede distinguir las condiciones cumplidas y no cumplidas y el sistema no afirma que la acción fue ejecutada.

**AC-RULE-03 — Operador inválido**

- Dada una regla con operador o tipos incompatibles,
- cuando se valida el conjunto,
- entonces el sistema rechaza la regla con un mensaje asociado a la condición problemática.

### 7.7 Knowledge Assistant

**AC-KNOW-01 — Interpretación conocida**

- Dada una solicitud compatible con una intención soportada,
- cuando el usuario la envía,
- entonces el sistema muestra la intención, el objetivo, los parámetros encontrados y una explicación consistente.

**AC-KNOW-02 — Solicitud ambigua**

- Dada una solicitud sin intención o parámetros suficientes,
- cuando el sistema la procesa,
- entonces solicita información concreta y no inicia una ejecución.

**AC-KNOW-03 — Confirmación de ejecución**

- Dada una interpretación que puede iniciar un análisis,
- cuando el usuario todavía no confirmó,
- entonces la interfaz la presenta como propuesta; solo después de confirmar crea una ejecución con identificador.

**AC-KNOW-04 — Error de comunicación**

- Dado un fallo del servicio,
- cuando el usuario envía un mensaje,
- entonces conserva el mensaje, informa que no fue procesado y permite reintentar sin duplicarlo.

### 7.8 Frontend y accesibilidad

**AC-UI-01 — Estados completos**

- Cada vista integrada demuestra estados inicial, vacío, cargando, éxito, validación, error y servicio no disponible cuando apliquen.

**AC-UI-02 — Teclado**

- Todos los flujos Must Have pueden completarse con teclado, con foco visible y orden lógico.

**AC-UI-03 — Responsive**

- Las vistas principales funcionan entre 320 px y escritorio sin desplazamiento horizontal global ni acciones inaccesibles.

**AC-UI-04 — Controles accesibles**

- Todos los campos tienen etiquetas asociadas, los botones con iconos tienen nombre accesible y los cambios críticos de estado son anunciados.

---

## 8. Requisitos no funcionales

### 8.1 Rendimiento y capacidad percibida

- NFR-PERF-01: La estructura inicial de una página debe ser interactiva en un máximo de 3 segundos bajo una conexión y equipo de referencia que deberán documentarse antes de la aceptación.
- NFR-PERF-02: Las interacciones locales deben responder visualmente en menos de 200 ms.
- NFR-PERF-03: Las consultas no intensivas deben apuntar a un percentil 95 menor a 2 segundos, excluyendo procesos asíncronos y dependencias externas; la medición final requiere un entorno acordado.
- NFR-PERF-04: Los procesos largos deben ejecutarse de forma asíncrona, conservar su estado y no bloquear la navegación.
- NFR-PERF-05: Los límites de tamaño de matrices, lotes, reglas e iteraciones deben definirse mediante pruebas de capacidad y mostrarse antes del envío.

### 8.2 Responsive y compatibilidad

- NFR-COMP-01: Compatibilidad con las dos versiones estables más recientes de Chrome, Edge y Firefox.
- NFR-COMP-02: Soporte de anchos desde 320 px y zoom del navegador de al menos 200 % sin pérdida de funcionalidad esencial.
- NFR-COMP-03: Las funciones principales no deben depender de hover, puntero preciso o una orientación específica.

### 8.3 Accesibilidad

- NFR-A11Y-01: Cumplimiento WCAG 2.1 nivel AA para los flujos Must Have.
- NFR-A11Y-02: Auditoría automática sin errores críticos, complementada por pruebas manuales de teclado y lector de pantalla.
- NFR-A11Y-03: Contraste AA, foco visible, estructura semántica y alternativas textuales donde correspondan.
- NFR-A11Y-04: Respeto de `prefers-reduced-motion` y ausencia de animaciones indispensables para comprender el estado.

### 8.4 Seguridad y privacidad

- NFR-SEC-01: Secretos, claves y credenciales deben provenir de configuración segura y no estar embebidos en código o imágenes desplegadas.
- NFR-SEC-02: Las contraseñas deben almacenarse mediante hashing adecuado y nunca registrarse ni devolverse.
- NFR-SEC-03: Las sesiones y tokens deben tener vencimiento, transporte seguro y tratamiento explícito de cierre o revocación.
- NFR-SEC-04: CORS debe restringirse a orígenes autorizados por entorno.
- NFR-SEC-05: Todas las entradas deben validarse en el límite de confianza correspondiente; los mensajes externos no deben incluir trazas ni secretos.
- NFR-SEC-06: Las acciones administrativas y el entrenamiento de modelos deben requerir autorización diferenciada cuando se definan los roles.
- NFR-SEC-07: Debe definirse una política de retención y eliminación antes de persistir conversaciones, conjuntos de datos o resultados de negocio.

### 8.5 Confiabilidad y recuperación

- NFR-REL-01: Toda ejecución debe terminar en un estado terminal identificable o permanecer recuperable para diagnóstico.
- NFR-REL-02: Los reintentos deben ser idempotentes cuando exista riesgo de duplicar trabajos.
- NFR-REL-03: Reiniciar una instancia no debe borrar usuarios, historial o metadatos requeridos por el producto objetivo.
- NFR-REL-04: La indisponibilidad de un motor no debe impedir usar módulos independientes.
- NFR-REL-05: No se establece un SLA hasta medir el sistema en un entorno representativo.

### 8.6 Mantenibilidad

- NFR-MAIN-01: Los módulos deben compartir contratos versionados para identidad, errores y estados de ejecución.
- NFR-MAIN-02: La configuración específica del entorno debe permanecer fuera de la lógica de producto.
- NFR-MAIN-03: Los cambios en contratos públicos deben incluir documentación y pruebas de compatibilidad.
- NFR-MAIN-04: Los flujos Must Have deben contar con pruebas unitarias, de integración y de extremo a extremo relevantes; un servicio sin pruebas no debe considerarse validado automáticamente.
- NFR-MAIN-05: Los textos de producto, estados y nombres de módulos deben administrarse de forma consistente.

### 8.7 Observabilidad

- NFR-OBS-01: Cada servicio debe exponer salud y métricas suficientes para disponibilidad, latencia, errores y volumen.
- NFR-OBS-02: Cada solicitud y ejecución debe tener identificadores correlacionables.
- NFR-OBS-03: Los registros deben ser estructurados y excluir contraseñas, tokens, datos sensibles y conjuntos de entrada completos salvo autorización expresa.
- NFR-OBS-04: Deben existir alertas y paneles para fallos que afecten los flujos Must Have antes de declarar el sistema listo para producción.

---

## 9. Priorización

### Must Have

| Capacidad | Justificación |
|---|---|
| Identidad persistente y sesiones protegidas | El backend actual pierde usuarios y la UI no protege accesos |
| Punto de entrada integrado y configurable | El frontend llama directamente a un servicio y el gateway no enruta |
| Dashboard con ejecuciones reales | La vista principal actual muestra datos ficticios |
| Flujo de optimización de asignaciones | El motor existe y necesita una experiencia utilizable |
| Flujo de predicción con esquema definido | El motor existe, pero sus entradas y modelo no son transparentes para el usuario |
| Flujo de simulación | La capacidad existe solo mediante API |
| Asistente con interpretación honesta | El flujo visible actual puede prometer acciones no ejecutadas |
| Estados completos de UI | Son necesarios para que los flujos integrados sean comprensibles y recuperables |
| Seguridad básica y configuración por entorno | Los secretos, CORS y URLs actuales no son aptos para un producto integrado |

### Should Have

| Capacidad | Justificación |
|---|---|
| Interfaz de evaluación de reglas | El motor existe, pero no es parte de la navegación actual |
| Historial básico de ejecuciones | Permite recuperar tareas asíncronas y revisar resultados |
| Estado de servicios | Facilita explicar indisponibilidad y soporte operativo |
| Confirmación de acciones desde el asistente | Evita ejecuciones involuntarias y valida parámetros interpretados |
| Perfil proveniente de identidad | Sustituye el perfil estático actual |
| Trazabilidad y correlación | Permite diagnosticar flujos distribuidos |

### Could Have

| Capacidad | Condición |
|---|---|
| Comparación visual de escenarios | Después de persistir ejecuciones y normalizar resultados |
| Gráficos avanzados | Cuando existan datos reales y definiciones acordadas |
| Exportación de resultados | Después de definir formatos, privacidad y trazabilidad |
| Contexto conversacional persistente | Después de definir retención y permisos |
| Versionado visual de reglas | Después de validar el flujo básico de evaluación |
| Comparación de modelos o predicciones | Después de formalizar el ciclo de vida del modelo |

### Future / Out of Scope

- RAG operativo y búsqueda con Qdrant.
- Automatización de acciones empresariales sin confirmación humana.
- Soporte genérico para modelos MIP, CP o LP distintos de la asignación existente.
- Modelos predictivos adicionales sin caso de negocio y datos definidos.
- Integraciones con ERPs u otros sistemas externos no especificados.
- Despliegue Kubernetes endurecido y certificado para producción.
- Alta disponibilidad, multi-región o recuperación ante desastres.
- Kafka como requisito del producto mientras no exista un flujo que lo utilice.

---

## 10. Preguntas abiertas y riesgos

### 10.1 Preguntas abiertas

| Tema | Pregunta pendiente | Impacto |
|---|---|---|
| Usuarios y roles | ¿Qué acciones corresponden a analistas, administradores y equipo de datos? | Autorización, navegación y aceptación |
| Persistencia | ¿Qué tecnología y política conservarán usuarios, ejecuciones, conversaciones y reglas? | Continuidad, privacidad y recuperación |
| Dashboard | ¿Qué indicadores de negocio son reales, quién los define y de qué fuente provienen? | Evita reemplazar datos ficticios por métricas sin significado |
| Historial | ¿Cuánto tiempo se conservan entradas y resultados? | Costos, privacidad y auditoría |
| Predicción | ¿Cuáles son las variables, unidades, objetivo, fuente de entrenamiento y métricas mínimas de calidad? | Validez del modelo y diseño del formulario |
| Ciclo del modelo | ¿Quién puede entrenar, aprobar, activar o revertir un modelo? | Riesgo operativo y trazabilidad |
| Simulación | ¿Qué monedas, unidades y límites de iteraciones se soportan? | Validación y comparabilidad |
| Reglas | ¿Las acciones son descriptivas o deben integrarse con otros sistemas? | Seguridad y alcance de automatización |
| Asistente | ¿Debe limitarse a estructurar parámetros o también iniciar ejecuciones confirmadas? | Flujo, permisos y expectativas |
| RAG y Qdrant | ¿Qué documentos se indexarían, con qué permisos y criterios de calidad? | Privacidad, seguridad y precisión |
| Gateway | ¿Cuál será el contrato público y cómo se descubrirán o versionarán los módulos? | Integración y compatibilidad |
| Datos de demostración | ¿Cómo se diferenciarán visualmente de datos reales? | Confianza del usuario |
| Idioma | ¿La primera versión será íntegramente en español, inglés o localizada? | Consistencia UX y contenido |
| Métricas de éxito | ¿Qué reducción de tiempo, costo o error debe demostrar el producto? | Priorización y evaluación de valor |
| Operación | ¿Cuál es el entorno objetivo y qué SLOs son necesarios? | Rendimiento, disponibilidad y costo |

### 10.2 Riesgos

| Riesgo | Evidencia actual | Impacto | Mitigación requerida |
|---|---|---|---|
| Credenciales y secretos embebidos | Claves y contraseñas aparecen en código y configuración | Acceso no autorizado | Gestión de secretos por entorno y rotación antes de uso real |
| CORS abierto | Los servicios permiten cualquier origen | Exposición de APIs | Lista explícita de orígenes autorizados |
| Usuarios volátiles | Identidad usa memoria de proceso | Pérdida de cuentas y sesiones inconsistentes | Persistencia y migración de datos de identidad |
| Expectativas falsas del asistente | La explicación dice que enviará parámetros, pero no lo hace | Decisiones basadas en acciones inexistentes | Lenguaje de estado estricto y confirmación vinculada a una ejecución real |
| Métricas ficticias | Dashboard usa valores codificados | Pérdida de confianza | Fuente, fecha y estado vacío visibles |
| Validación matemática incompleta | Matrices, rangos e iteraciones tienen controles limitados | Fallos, resultados inválidos o consumo excesivo | Reglas de validación compartidas y límites probados |
| Modelo predictivo poco definido | Variables y calidad no tienen contrato de producto | Predicciones difíciles de interpretar o comparar | Esquema, versionado y criterios de evaluación |
| Integración fragmentada | UI conecta un servicio directamente y gateway devuelve `501` | Configuración frágil y seguridad inconsistente | Contrato único de integración y autenticación |
| Infraestructura divergente | Compose, Kubernetes y código no declaran los mismos componentes | Despliegues incompletos o engañosos | Inventario único y validación automatizada de despliegue |
| Cobertura insuficiente | Varias pruebas son placeholders o no ejercitan la UI | Regresiones no detectadas | Pruebas por flujo y fallos reales en CI |
| Dependencias sin uso comprobable | Kafka, Zookeeper y Qdrant están declarados sin flujo funcional | Complejidad y superficie operativa | Retirar del alcance activo o asociar a un requisito aprobado |
| Datos sensibles en registros o modelos | No hay política de clasificación o retención | Riesgo legal y de privacidad | Definir clasificación, minimización y auditoría antes de datos reales |
| Acciones automáticas ambiguas | Reglas devuelven acciones sin ejecución, pero el concepto puede confundirse | Cambios empresariales no autorizados | Mantener resultados informativos hasta diseñar controles y aprobaciones |

### 10.3 Dependencias para avanzar

- Definir contratos públicos y estados comunes entre los módulos.
- Elegir persistencia y política de retención.
- Acordar roles y permisos.
- Formalizar datos, variables y métricas del modelo predictivo.
- Definir fuentes y semántica del dashboard.
- Completar una ruta de ejecución local o desplegada que incluya identidad, punto de entrada, motores y frontend.
- Establecer un entorno de prueba representativo para fijar límites y objetivos de rendimiento.

---

## Criterio de salida del alcance inicial

El alcance inicial podrá considerarse completo cuando:

1. Un usuario persistido pueda autenticarse y acceder a las vistas protegidas.
2. Dashboard, optimización, predicción, simulación y asistente usen datos o ejecuciones reales mediante un punto de entrada coherente.
3. Cada flujo Must Have cubra validación, carga, éxito, vacío, error y recuperación.
4. Las ejecuciones asíncronas puedan recuperarse por identificador y permanezcan disponibles después de reinicios previstos.
5. Ninguna pantalla presente datos simulados como reales ni acciones interpretadas como ejecutadas.
6. Los flujos principales cumplan los criterios de accesibilidad, responsive, seguridad y compatibilidad definidos en este PRD.
7. Las pruebas automatizadas y manuales acordadas demuestren los criterios de aceptación en un entorno documentado.
