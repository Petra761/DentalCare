# Especificación de Requisitos de Software (SRS) — Secciones 2.4 y 2.5

**Proyecto:** DentalCare — Sistema de gestión para clínica dental  
**Contexto:** Clínica dental en Tarija, Bolivia  
**Versión del documento:** 1.0  
**Fecha:** Julio 2026

---

## 2.4. Restricciones generales

Esta subsección describe los elementos que limitan las opciones de diseño e implementación del sistema DentalCare. Las restricciones se derivan del análisis del código fuente, la documentación del proyecto, la entrevista con el cliente y los requisitos funcionales y no funcionales establecidos.

### a Políticas regulatorias

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-a.1 | Protección de datos clínicos | La información médica contenida en la ficha clínica digital (alergias, tipo de sangre, historial de citas, antecedentes) debe gestionarse exclusivamente a través del panel web interno de la clínica. No debe exponerse innecesariamente por el canal de WhatsApp (RN-9). |
| RG-a.2 | Minimización de datos en canal público | Por WhatsApp solo se recopilan los datos mínimos necesarios para el contacto y agendamiento: nombre y número de teléfono (según entrevista con el cliente). El resto de datos personales y clínicos se registran presencialmente por personal autorizado (RN-10). |
| RG-a.3 | Información comercial autorizada | El asistente virtual solo puede proporcionar información institucional, comercial y de tratamientos previamente registrada y autorizada por la clínica (RN-7, RF-R 6). Los tratamios complejos no deben recibir precios no autorizados (RN-8). |
| RG-a.4 | Marco normativo local | El sistema se desarrolla como proyecto académico para una clínica privada en Bolivia. No existe implementación formal de marcos internacionales como HIPAA o GDPR; las políticas de privacidad se basan en las reglas de negocio acordadas con el cliente y en buenas prácticas de protección de datos sensibles. |
| RG-a.5 | Prevención de registros fraudulentos | El sistema debe aplicar mecanismos para detectar e impedir registros falsos o maliciosos que puedan saturar la agenda (RN-15, RNF-R 6), conforme a la preocupación expresada por el cliente durante el levantamiento de requisitos. |

### b) Limitaciones de hardware

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-b.1 | Infraestructura de servidor | El despliegue en producción está limitado a una máquina virtual en Google Cloud Platform (Compute Engine) con sistema operativo Debian Linux, con recursos compartidos entre el backend, la base de datos, n8n y el proxy inverso Nginx. |
| RG-b.2 | Conectividad de red | El acceso externo al sistema depende de conectividad a Internet estable. Los puertos 80 (HTTP) y 443 (HTTPS) deben permanecer abiertos en el firewall de la VM para permitir el acceso web y a los webhooks de WhatsApp/n8n. |
| RG-b.3 | Dispositivos de acceso del personal | El panel web debe ser accesible desde laptops, computadoras de escritorio, tablets y teléfonos móviles con navegador web moderno (RNF-R 3, RNF-R 4), sin requerir hardware especializado. |
| RG-b.4 | Requisitos de desarrollo local | Para ejecutar el sistema en entorno de desarrollo se requiere: .NET SDK 8.0+, Node.js 18+, PostgreSQL 15+ y conexión de red local o túnel (ngrok) para pruebas con n8n/WhatsApp. |
| RG-b.5 | Sincronización en tiempo casi real | Los cambios en la agenda deben reflejarse entre el panel web y el asistente virtual en un tiempo máximo de 5 segundos (RNF-R 2), lo que impone restricciones sobre la latencia de red y el tiempo de respuesta del servidor y de la base de datos. |

### c) Interfaces con otras aplicaciones

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-c.1 | WhatsApp (Meta) | Canal principal de comunicación con pacientes. La integración se realiza de forma indirecta a través de n8n; el backend no se comunica directamente con la API de WhatsApp. |
| RG-c.2 | n8n | Plataforma de automatización que actúa como intermediario entre WhatsApp, el agente de IA (OpenRouter) y la API REST del backend. El workflow de n8n no está versionado en el repositorio y reside en la instancia desplegada en el servidor. |
| RG-c.3 | OpenRouter AI | Servicio externo de inteligencia artificial utilizado por n8n para interpretar lenguaje natural y determinar la intención del paciente (agendar, reagendar, cancelar, consultar). |
| RG-c.4 | Google Calendar API | Integración implementada en el backend mediante `GoogleCalendarService` y cuenta de servicio (`google-credentials.json`). Toda creación, modificación o cancelación de citas debe sincronizarse con el calendario configurado. |
| RG-c.5 | Cloudflare DNS | Gestión del dominio y subdominio mediante registro DNS tipo A hacia la IP pública estática de Google Cloud (`34.39.133.213`). |
| RG-c.6 | API REST interna | El frontend React se comunica exclusivamente con el backend ASP.NET Core mediante HTTP/JSON sobre los endpoints documentados en Swagger (`/swagger`). |
| RG-c.7 | Endpoints del bot (n8n → Backend) | Los siguientes endpoints están expuestos para consumo por n8n: `POST /api/Citas/agendar-desde-n8n`, `POST /api/Citas/cancelar-desde-n8n`, `POST /api/Citas/reagendar`, `GET\|POST /api/Citas/disponibilidad`, `GET /api/Servicios/catalogo`, entre otros. |

**Diagrama de interfaces externas:**

```text
┌─────────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────────────┐
│  WhatsApp   │────►│   n8n    │────►│  Backend    │────►│   PostgreSQL     │
│  (Meta)     │     │ + OpenRouter│   │  ASP.NET 8  │     │                  │
└─────────────┘     └──────────┘     └──────┬──────┘     └──────────────────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │ Google Calendar  │
                                     │      API         │
                                     └──────────────────┘

┌─────────────┐     ┌──────────┐     ┌─────────────┐
│  Navegador  │────►│  Nginx   │────►│  Backend    │
│  (React)    │ HTTPS│ (Proxy)  │     │  API        │
└─────────────┘     └──────────┘     └─────────────┘
```

### d) Operación en paralelo

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-d.1 | Acceso concurrente al panel web | Múltiples usuarios del personal (Administrador, Recepcionista) pueden operar simultáneamente sobre la agenda, pacientes y reportes desde distintos dispositivos y sesiones. |
| RG-d.2 | Canal WhatsApp y panel web simultáneos | El asistente virtual y el panel web pueden modificar la agenda de forma concurrente. El sistema debe validar la disponibilidad del horario antes de confirmar cualquier cita para evitar conflictos (RN-1, RN-25). |
| RG-d.3 | Un paciente por horario | Un mismo horario de atención no puede asignarse simultáneamente a dos pacientes para el mismo espacio de atención (RN-1). Esta restricción debe aplicarse independientemente del canal de origen (web o WhatsApp). |
| RG-d.4 | Disponibilidad 24/7 del bot | El asistente virtual debe estar disponible fuera del horario laboral de la clínica para atender solicitudes de pacientes (RN-22), mientras que el panel web opera bajo la disponibilidad del servidor y del personal autorizado. |
| RG-d.5 | Sincronización multi-canal | La información mostrada por el asistente virtual y la plataforma web debe corresponder al mismo estado actualizado de la agenda (RN-21). En caso de discrepancia, prevalece la validación de disponibilidad en tiempo real antes de confirmar. |

### e) Funciones de auditoría

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-e.1 | Trazabilidad de operaciones sobre citas | Las operaciones relevantes realizadas sobre las citas (creación, modificación, cancelación, reprogramación) deben quedar registradas para mantener un historial de cambios en la agenda (RN-24). |
| RG-e.2 | Historial de citas por paciente | El sistema debe permitir consultar el historial de citas de un paciente mediante endpoints como `GET /api/Citas/historial` y `GET /api/Citas/cliente/{id}/historial`. |
| RG-e.3 | Estado actual de implementación | No existe actualmente una tabla de auditoría dedicada ni un framework de logging estructurado (Serilog/ILogger) en el backend. La trazabilidad se limita al historial de citas y al campo `Estado`/`EstadoCita` de las entidades. Esta limitación constituye una restricción de diseño que deberá abordarse en iteraciones futuras para cumplir plenamente RN-24. |
| RG-e.4 | Registro de medio de comunicación | Cada cita registra el medio por el cual fue creada (`MedioComunicacion`: WhatsApp, Teléfono, Recepción), lo que permite identificar el canal de origen de la operación. |

### f) Funciones de control

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-f.1 | Autenticación obligatoria | Todo usuario del panel web debe iniciar sesión con credenciales válidas antes de acceder a funcionalidades protegidas (RF-R 15, RNF-R 8). La autenticación se implementa mediante JWT con expiración de 7 días. |
| RG-f.2 | Autorización por roles | El acceso a funcionalidades se controla según el rol asignado: **Administrador** (gestión de usuarios, dashboard, reportes completos) y **Recepcionista/Operador** (agenda, pacientes, citas, tratamientos, alergias) (RF-R 16, RNF-R 9, RNF-R 10). |
| RG-f.3 | Control de acceso en frontend | Las rutas `/dashboard` y `/usuarios` están restringidas exclusivamente al rol Administrador en el componente `Layout.tsx`. Las demás rutas requieren sesión autenticada. |
| RG-f.4 | Eliminación lógica | Los usuarios y pacientes no se eliminan físicamente; se marcan como `Inactivo`, preservando la integridad referencial y el historial. |
| RG-f.5 | Validación de datos de entrada | El sistema debe validar el formato y consistencia de los datos ingresados antes de procesarlos o almacenarlos (RNF-R 5), incluyendo CI, teléfono, fechas y horarios de citas. |
| RG-f.6 | Validación de disponibilidad | Solo se permiten horarios disponibles al registrar o reprogramar citas (RN-2, RF-R 4). La disponibilidad se calcula cruzando la base de datos PostgreSQL y los eventos de Google Calendar. |
| RG-f.7 | Limitación actual de control en API | El atributo `[Authorize]` está comentado en los controladores del backend, por lo que la protección a nivel de API no está completamente aplicada. Esta es una restricción técnica conocida que debe resolverse antes del despliegue en producción. |

### g) Requisitos de lenguajes de orden superior

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-g.1 | Backend | El backend debe desarrollarse en **C#** sobre **.NET 8.0** (SDK 8.0.100 según `global.json`), utilizando **ASP.NET Core Web API** como framework de servicios REST. |
| RG-g.2 | Frontend | La interfaz web debe desarrollarse en **TypeScript** con **React 19** y **Vite 8** como herramienta de construcción. |
| RG-g.3 | Estilos | Los estilos de la interfaz se implementan con **Tailwind CSS 3.4**. |
| RG-g.4 | Base de datos | La persistencia se gestiona mediante **Entity Framework Core 8** con proveedor **Npgsql** para **PostgreSQL 15+**. |
| RG-g.5 | Automatización | Los flujos de automatización (bot WhatsApp) se configuran en **n8n** (JavaScript/JSON para workflows), sin código adicional versionado en el repositorio principal. |
| RG-g.6 | Restricción de lenguajes | No se utilizarán otros lenguajes de programación de alto nivel para los componentes principales del sistema (backend, frontend, base de datos). Las dependencias de terceros (Chart.js, jsPDF, xlsx) se consumen desde el ecosistema JavaScript/TypeScript del frontend. |

### h) Protocolos de intercambio de señales

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-h.1 | HTTP/HTTPS | Toda comunicación entre frontend, backend, n8n y servicios externos se realiza mediante el protocolo HTTP/1.1. En producción, las comunicaciones externas deben usar HTTPS con certificados SSL/TLS gestionados por Certbot (Let's Encrypt). |
| RG-h.2 | REST + JSON | La API del backend expone servicios RESTful. El formato de intercambio de datos es **JSON** (`application/json`) para solicitudes y respuestas. |
| RG-h.3 | JWT (Bearer Token) | La autenticación del panel web utiliza tokens JWT transmitidos en el encabezado `Authorization: Bearer {token}`. El algoritmo de firma es HMAC-SHA256. |
| RG-h.4 | OAuth 2.0 (Google) | La integración con Google Calendar utiliza autenticación mediante cuenta de servicio con credenciales OAuth 2.0 (`google-credentials.json`). |
| RG-h.5 | Webhooks (n8n) | n8n recibe mensajes de WhatsApp mediante webhooks HTTP POST y reenvía las acciones al backend mediante solicitudes HTTP POST/GET. Se recomienda implementar autenticación por API Key en los endpoints del bot (pendiente). |
| RG-h.6 | CORS | El backend configura políticas CORS: `AllowAll` (desarrollo) y `AllowFrontend` (origen `http://localhost:5173`). En producción debe restringirse a orígenes conocidos. |
| RG-h.7 | SSH | La administración remota del servidor se realiza mediante SSH (Secure Shell). |
| RG-h.8 | DNS | La resolución de nombres de dominio se gestiona mediante registros DNS tipo A en Cloudflare. |

### i) Requisitos de confiabilidad

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-i.1 | Disponibilidad del sistema | El sistema debe mantenerse disponible como mínimo el **99.9%** del tiempo para garantizar la atención automatizada mediante WhatsApp (RNF-R 1). |
| RG-i.2 | Integridad de la agenda | La agenda debe mantener información consistente sobre disponibilidad de horarios y citas registradas (RN-4). Las operaciones de creación, modificación y cancelación deben ser atómicas respecto a la base de datos. |
| RG-i.3 | Sincronización Calendar | Los errores de sincronización con Google Calendar se capturan internamente; una falla en Calendar no debe impedir el registro de la cita en la base de datos local, aunque puede generar inconsistencias temporales entre canales. |
| RG-i.4 | Recuperación ante fallos | La base de datos PostgreSQL es el repositorio principal de verdad. Google Calendar actúa como réplica de disponibilidad. El endpoint `POST /api/Citas/sincronizar` permite reconciliar citas no sincronizadas. |
| RG-i.5 | Modo demostración (mock) | El frontend incluye un modo mock que permite operar con datos simulados cuando el backend no está disponible, facilitando demostraciones pero sin garantía de persistencia. |
| RG-i.6 | Consistencia entre canales | En caso de discrepancia temporal entre la información del asistente virtual y el panel web, el sistema debe revalidar la disponibilidad antes de confirmar una cita (RN-25). |

### j) Criticidad de la aplicación

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-j.1 | Nivel de criticidad | El sistema tiene **criticidad media-alta** para la operación diaria de la clínica. Una indisponibilidad prolongada afecta directamente la captación de pacientes (canal WhatsApp 24/7) y la organización de la agenda. |
| RG-j.2 | Impacto en ingresos | Según el cliente, la falta de respuesta oportuna en WhatsApp provoca pérdida de pacientes potenciales. El módulo de agendamiento automatizado es crítico para el negocio. |
| RG-j.3 | Datos sensibles | El sistema gestiona datos personales y clínicos de pacientes (CI, tipo de sangre, alergias, historial). La pérdida o exposición indebida de estos datos tiene impacto reputacional y legal. |
| RG-j.4 | No es sistema de soporte vital | DentalCare no es un sistema de misión crítica de salud (no controla equipos médicos, no administra medicamentos, no realiza diagnósticos). Su función es administrativa y de gestión de citas. |
| RG-j.5 | Contexto académico | El sistema se desarrolla como proyecto universitario con despliegue en una clínica real, lo que implica criticidad operativa moderada con tolerancia a iteraciones y mejoras incrementales. |

### k) Consideraciones de seguridad

| ID | Restricción | Descripción |
|----|-------------|-------------|
| RG-k.1 | Hash de contraseñas | Las contraseñas se almacenan mediante **PBKDF2-SHA256** con 100.000 iteraciones y salt de 128 bits. Nunca se almacenan en texto plano (RNF-R 7). |
| RG-k.2 | Autenticación JWT | Los tokens JWT tienen expiración configurable (7 días por defecto). La clave de firma (`Jwt:Key`), emisor y audiencia deben configurarse en `appsettings.json` y no deben versionarse en el repositorio. |
| RG-k.3 | Cifrado en tránsito | En producción, toda comunicación externa debe realizarse mediante HTTPS/SSL-TLS (Certbot + Let's Encrypt). |
| RG-k.4 | Protección de credenciales | Los archivos `appsettings.json`, `google-credentials.json` y variables de entorno sensibles están excluidos del control de versiones (`.gitignore`). |
| RG-k.5 | Separación de información clínica | Los datos sensibles de expedientes clínicos no se transmiten por WhatsApp; solo se gestionan en el panel web interno (RN-9). |
| RG-k.6 | Detección de interacciones maliciosas | El sistema debe identificar registros inválidos, mensajes maliciosos o interacciones sospechosas durante la comunicación por WhatsApp (RNF-R 6, RN-15). |
| RG-k.7 | Autorización por roles | Un usuario no puede acceder a funcionalidades o información fuera de los permisos de su rol (RNF-R 9, RNF-R 10, RN-14). |
| RG-k.8 | Endpoints del bot sin autenticación | Actualmente los endpoints consumidos por n8n no requieren token de autenticación, lo que representa un riesgo de seguridad. Se debe implementar validación por API Key antes del despliegue en producción. |
| RG-k.9 | CORS permisivo en desarrollo | La política `AllowAll` de CORS permite cualquier origen en desarrollo. Debe restringirse en producción a dominios autorizados. |
| RG-k.10 | Comparación constante en verificación | El servicio `PasswordHasher` implementa comparación en tiempo constante para prevenir ataques de temporización. |

---

## 2.5. Supuestos y dependencias

Esta subsección enumera los factores que afectan a los requisitos establecidos en el SRS. Estos factores no son restricciones de diseño del software, sino condiciones externas cuya modificación podría impactar los requisitos del sistema.

### 2.5.1. Supuestos

| ID | Supuesto | Impacto si no se cumple |
|----|----------|-------------------------|
| SU-1 | **Conectividad a Internet estable** en la clínica y en el servidor de producción. | El panel web, el bot de WhatsApp y la sincronización con Google Calendar dejarían de funcionar. |
| SU-2 | **El personal de la clínica cuenta con dispositivos** (laptop, PC, tablet o smartphone) con navegador web moderno (Chrome, Firefox, Edge o Safari actualizado). | No podrían acceder al panel de gestión. |
| SU-3 | **Los pacientes utilizan WhatsApp** como canal principal de comunicación con la clínica. | El módulo de asistente virtual perdería su canal de atención; sería necesario un canal alternativo. |
| SU-4 | **La clínica dispone de una cuenta de Google** con Google Calendar configurado y una cuenta de servicio con permisos de lectura/escritura sobre el calendario de la clínica. | La sincronización de disponibilidad y eventos con Google Calendar no funcionaría. |
| SU-5 | **El odontólogo/propietario proporciona y mantiene actualizada** la información institucional, comercial y de tratamientos que el asistente virtual puede divulgar. | El bot respondería con información desactualizada o incompleta. |
| SU-6 | **El personal autorizado (recepcionista/auxiliar) registra la ficha clínica completa** del paciente de forma presencial, una vez que este asiste a la clínica. | Los expedientes clínicos quedarían incompletos; solo existirían datos mínimos de contacto. |
| SU-7 | **La clínica opera con un único consultorio/espacio de atención**, por lo que no se requiere gestión multi-sala en la agenda. | Sería necesario extender el modelo de datos para soportar múltiples espacios simultáneos. |
| SU-8 | **Los horarios de atención de la clínica son configurables** y el sistema puede consultarlos para calcular disponibilidad. | El cálculo de slots libres sería incorrecto. |
| SU-9 | **PostgreSQL estará disponible y operativo** como motor de base de datos en el entorno de producción (local o contenedor Docker). | El backend no podría persistir ni recuperar información. |
| SU-10 | **El equipo de desarrollo tiene acceso SSH** al servidor de Google Cloud para despliegue y mantenimiento. | No sería posible actualizar ni administrar el sistema en producción. |
| SU-11 | **Los servicios externos (WhatsApp Business API, OpenRouter, Google Calendar API, Cloudflare) mantienen sus interfaces estables** y disponibles según sus SLA. | Cambios en APIs externas requerirían adaptación del sistema. |
| SU-12 | **El cliente acepta que el sistema es un proyecto académico** con funcionalidades que se entregan de forma incremental, no como producto comercial terminado. | Expectativas de funcionalidad completa desde el primer despliegue. |
| SU-13 | **La clínica cuenta con personal mínimo** (odontólogo y auxiliar/recepcionista) que operará el panel web durante horario laboral. | El panel web no sería utilizado fuera del horario de atención presencial. |
| SU-14 | **Los pacientes proporcionan datos verídicos** (nombre y teléfono) al interactuar con el bot de WhatsApp. | Podrían generarse registros falsos pese a los mecanismos de detección (RN-15). |
| SU-15 | **El dominio y subdominio de la clínica están registrados** y gestionados en Cloudflare con IP estática en Google Cloud. | El acceso por URL amigable y con HTTPS no estaría disponible. |

### 2.5.2. Dependencias

| ID | Dependencia | Tipo | Descripción | Componente afectado |
|----|-------------|------|-------------|---------------------|
| DE-1 | **.NET SDK 8.0+** | Software | Runtime y SDK necesarios para compilar y ejecutar el backend. | Backend (ASP.NET Core) |
| DE-2 | **Node.js 18+** y **npm/pnpm** | Software | Entorno de ejecución y gestor de paquetes para el frontend. | Frontend (React/Vite) |
| DE-3 | **PostgreSQL 15+** | Software | Sistema de gestión de bases de datos relacional. | Backend, persistencia |
| DE-4 | **Entity Framework Core 8** | Librería | ORM para mapeo objeto-relacional y migraciones. | Backend |
| DE-5 | **Google.Apis.Calendar.v3** (v1.75.0) | Librería/API | Cliente oficial de Google Calendar API. | GoogleCalendarService |
| DE-6 | **Microsoft.AspNetCore.Authentication.JwtBearer** (v8.0.10) | Librería | Middleware de autenticación JWT. | Backend, seguridad |
| DE-7 | **Npgsql.EntityFrameworkCore.PostgreSQL** (v8.0.11) | Librería | Proveedor EF Core para PostgreSQL. | Backend, persistencia |
| DE-8 | **React 19**, **TypeScript 6**, **Vite 8**, **Tailwind CSS 3.4** | Librerías | Stack frontend completo. | Frontend |
| DE-9 | **Chart.js**, **jsPDF**, **xlsx**, **html2pdf.js** | Librerías | Generación de gráficos y exportación de reportes (PDF/Excel). | Módulo de reportes |
| DE-10 | **Google Cloud Platform (Compute Engine)** | Infraestructura | Máquina virtual Debian para hosting del sistema. | Despliegue producción |
| DE-11 | **Docker** y **Docker Compose** | Infraestructura | Contenerización y orquestación de servicios en producción. | Despliegue producción |
| DE-12 | **Nginx** | Infraestructura | Servidor web y proxy inverso (HTTPS, enrutamiento). | Despliegue producción |
| DE-13 | **Certbot** | Infraestructura | Obtención y renovación automática de certificados SSL/TLS. | Seguridad (HTTPS) |
| DE-14 | **Cloudflare DNS** | Servicio externo | Resolución de dominio hacia IP del servidor. | Acceso web |
| DE-15 | **n8n** | Servicio externo | Plataforma de automatización para el flujo WhatsApp → IA → Backend. | Módulo Bot |
| DE-16 | **WhatsApp Business API** (vía n8n) | Servicio externo | Canal de mensajería con pacientes. | Módulo Bot |
| DE-17 | **OpenRouter AI** | Servicio externo | Modelo de lenguaje para el agente conversacional del bot. | Módulo Bot |
| DE-18 | **Google Calendar API** | Servicio externo | Sincronización de eventos de citas con calendario compartido. | Módulo de citas |
| DE-19 | **ngrok** (solo desarrollo) | Herramienta | Túnel HTTPS para exponer backend local durante pruebas con n8n. | Entorno de desarrollo |
| DE-20 | **Archivo `appsettings.json`** | Configuración | Contiene cadena de conexión PostgreSQL, claves JWT y configuración de Google Calendar. No versionado; debe crearse localmente. | Backend |
| DE-21 | **Archivo `google-credentials.json`** | Configuración | Credenciales de cuenta de servicio de Google Cloud. No versionado; compartido de forma segura. | GoogleCalendarService |
| DE-22 | **Workflow n8n exportado** | Configuración | Flujo de automatización del bot (no versionado actualmente en el repositorio). | Módulo Bot |
| DE-23 | **Swashbuckle.AspNetCore** (v6.6.2) | Librería | Documentación interactiva de la API (Swagger UI). | Backend, desarrollo |

### 2.5.3. Matriz de impacto de dependencias críticas

| Dependencia | Criticidad | Alternativa | Efecto de indisponibilidad |
|-------------|------------|-------------|----------------------------|
| PostgreSQL | **Alta** | Ninguna inmediata | Sistema completamente inoperativo |
| Backend API | **Alta** | Modo mock (solo frontend, sin persistencia) | Panel web y bot sin funcionalidad real |
| WhatsApp + n8n | **Alta** | Atención manual por teléfono | Pérdida del canal automatizado 24/7 |
| Google Calendar API | **Media** | Solo base de datos local | Disponibilidad calculada solo desde BD; posibles conflictos si se usa Calendar externamente |
| OpenRouter AI | **Media** | Flujos n8n basados en reglas (sin IA) | Bot pierde capacidad de lenguaje natural |
| Cloudflare DNS | **Media** | Acceso directo por IP | Pérdida de dominio amigable y posiblemente de HTTPS |
| Google Cloud VM | **Alta** | Ninguna inmediata | Sistema completamente inaccesible |
| Certbot/SSL | **Media** | HTTP sin cifrar (inaceptable en producción) | Comunicaciones no cifradas; riesgo de seguridad |

### 2.5.4. Dependencias entre módulos internos

```text
Frontend (React)
    │
    │ depende de
    ▼
Backend API (ASP.NET Core)
    │
    ├── depende de ──► PostgreSQL (EF Core)
    │
    └── depende de ──► Google Calendar API (GoogleCalendarService)

n8n (Bot)
    │
    ├── depende de ──► WhatsApp (webhook entrante)
    ├── depende de ──► OpenRouter AI (procesamiento NLU)
    └── depende de ──► Backend API (endpoints del bot)

Panel Web + Bot
    │
    └── comparten ──► PostgreSQL (fuente de verdad de citas y pacientes)
```

---

## Referencias cruzadas

| Documento | Ubicación | Relación |
|-----------|-----------|----------|
| Requerimientos funcionales | `docs/requerimientos-funcionales.md` | RF-R 1–23 |
| Requerimientos no funcionales | `docs/requerimientos-no-funcionales.md` | RNF-R 1–10 |
| Reglas de negocio | `docs/reglas-de-negocio.md` | RN 1–25 |
| Entrevista con el cliente | `docs/entrevista.md` | Contexto y necesidades |
| Tecnologías utilizadas | `docs/Melany Castro/Tecnologias.md` | Stack tecnológico |
| Infraestructura y despliegue | `docs/Melany Castro/Servidor.md` | Restricciones de hardware e infraestructura |
| Módulo Bot (WhatsApp/n8n) | `docs/Daniela Zeballos/Gestion_Bot.md` | Interfaces externas y protocolos |
| Guía de pruebas | `docs/Daniela Zeballos/GUIA_PRUEBAS.md` | Dependencias de entorno de desarrollo |
