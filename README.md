# Carta-Digital-Interactive-B2B

> Sistema de gestión gastronómica en tiempo real para la orquestación automatizada de inventario y cartas digitales móviles bajo una arquitectura serverless zero-build con un costo operativo de $0 USD.

[🌐 Ver demo en vivo](https://carta-digital-interactiva.vercel.app/)

[⚙️ Panel de Administración](https://carta-digital-interactiva.vercel.app/admin.html)

---

## 🎯 Contexto

Gestionar cartas físicas y control de stock en locales gastronómicos —como cafeterías, restaurantes y pastelerías de especialidad— suele requerir procesos manuales o la reimpresión constante de menús.

Cuando un cliente selecciona un producto agotado, se genera fricción operativa y una mala experiencia de servicio debido al desfase entre la cocina y la mesa.

Este proyecto propone un **Single Source of Truth (SSOT)** basado en una arquitectura serverless que centraliza la administración del catálogo en tiempo real. Permite al personal del local alternar la disponibilidad de ítems (*Disponible/Agotado*) e inyectar cambios de forma instantánea a los dispositivos móviles de los clientes mediante WebSockets.

El proyecto actúa además como una estrategia comercial de **"Caballo de Troya"**: una solución de entrada de alto valor y bajo costo ($0 CLP Setup + $29.900 CLP/mes) que abre las puertas a proyectos mayores de digitalización operativa en PyMEs.

---

## 💡 Solución

Se desarrolló una plataforma web liviana en arquitectura **Zero-Build** (sin empaquetadores como Vite o Webpack) que centraliza:

* Captura de cambios de stock en tiempo real desde el panel del personal.
* Motor de datos asíncrono con **Supabase (PostgreSQL)**.
* Sincronización multi-cliente vía canal pub/sub de **WebSockets (Realtime)**.
* Interfaz móvil responsive para clientes con filtrado dinámico por categorías y búsqueda predictiva.
* Panel de administración (*Staff MVP*) protegido con autenticación.

La solución prioriza la velocidad de carga en redes móviles de bajo ancho de banda:

```text
Panel Staff / Garzón (admin.html)
        │
        ▼
Cambio de Stock / Operación CRUD
        │
        ▼
Supabase Realtime DB (PostgreSQL)
        │
        ├──► Sincronización por WebSockets
        │
        ▼
Carta Digital Cliente (index.html)

```

---

## 🚀 Funcionalidades

### Carta Digital Cliente (`index.html`)

* Renderizado dinámico de productos por categorías dinámicas.
* Filtro de búsqueda en tiempo real con sanitización de texto.
* Sincronización pasiva instantánea cuando un producto cambia a "AGOTADO" o se edita su precio.
* Renderizado defensivo con *placeholders* en caso de imágenes fallidas o caídas de red.
  
### Panel de Control Staff (`admin.html`)

* Control de stock mediante un botón *Toggle* rápido (*Disponible/Agotado*).


* Formulario modal para operaciones CRUD (Crear, Editar, Eliminar productos).
* Autenticación de usuarios del personal vía Supabase Auth.
* Carga asíncrona de categorías mediante elementos de sugerencia inteligente.

---

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura híbrida de **Frontend puro (Single Page / Jamstack)** combinada con un **Backend-as-a-Service (BaaS)** proporcionado por Supabase.

```text
               Capa 1: Cliente / Usuario
               (Navegador Móvil / QR)
                          │
                          ▼
             Capa 2: Capa de Presentación
            (Vanilla JS ES6+ / Tailwind CSS)
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
Capa 3: Motor BaaS              Capa 4: Canal Realtime
(Supabase PostgreSQL / Auth)    (WebSockets Pub/Sub)

```

### Estructura principal

```text
/
├── README.md
├── admin.html              # Vista del staff (Panel CRUD y Toggle de Stock)
├── index.html              # Vista pública del cliente (Menú interactivo)
├── css/
│   └── styles.css          # Estilos complementarios y utilidades
├── js/
│   ├── config.js           # Variables de entorno globales (SUPABASE_URL, ANON_KEY)
│   ├── supabase.js         # Inicializador defensivo del cliente de Supabase
│   ├── admin/
│   │   ├── auth.js         # Autenticación de personal
│   │   └── stock.js        # Lógica CRUD y gestión de inventario
│   ├── public/
│   │   └── menu.js         # Lógica de carga, filtros y suscripción a WebSockets
│   └── vendor/             # Dependencias locales (Tailwind Play CDN)
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql # Esquema SQL y políticas RLS

```

---

## 🛠️ Tech Stack

### Frontend & UI

* HTML5
* Tailwind CSS (Play CDN / Local Vendor)
* Vanilla JavaScript ES6+ (Zero-Build)
  
### Backend & Persistencia (BaaS)

* Supabase (PostgreSQL)
* Supabase Realtime (WebSockets)
* Supabase Auth & Row Level Security (RLS)

### Development & Hosting

* Git & GitHub
* Vercel (CI/CD Despliegue Continuo)

---

## 📐 Diseño de la solución

La solución fue diseñada bajo un principio de **soberanía, simplicidad y cero costo operativo ($0 USD)**.

En lugar de construir microservicios complejos o depender de frameworks pesados que requieren tiempo de compilación (como React o Vue), se optó por un enfoque **Zero-Build**. Esto garantiza que el sitio cargue en menos de 1 segundo en conexiones móviles 3G/4G.

> **Acción del Garzón → Mutación en Supabase PostgreSQL → Emisión WebSocket → Actualización del DOM en los clientes en <100ms.**
> 

---

## 📋 Alcance actual

### MVP

El alcance actual incluye:

* Vista de menú pública responsive con filtrado dinámico.
* Sincronización en tiempo real vía WebSockets para cambios de disponibilidad.
* Panel de administración con control de stock de un solo clic (*Toggle*) y CRUD completo.


* Conexión a base de datos de producción en Supabase.
* Autenticación segura y protección de escrituras mediante Row Level Security (RLS).

### Fuera del alcance actual

El MVP no incluye inicialmente:

* Pasarela de pagos integrada para pedidos desde la mesa.
* Impresión automática de comandas en cocina.
* Aplicación móvil nativa (iOS/Android).

---

## 🔮 Roadmap

### Fase 1 — MVP Base

* [x] Esquema inicial en Supabase PostgreSQL
* [x] Frontend público responsivo con Tailwind CSS
* [x] Panel de administración con operaciones CRUD
* [x] Sincronización Realtime por WebSockets
* [x] Despliegue continuo en Vercel

### Fase 2 — Multi-tenancy & Branding

* [ ] Esquema multi-marca (`brands` table) para gestión de múltiples clientes desde una sola instancia
* [ ] Carga dinámica de colores corporativos y logos vía parámetros de URL / subdominios
* [ ] Selector de idioma (Español / Inglés)

### Fase 3 — Analítica & Notificaciones

* [ ] Dashboard analítico de productos más buscados y agotados con mayor frecuencia
* [ ] Integración con WhatsApp API para notificaciones al personal del local

---

## 🧪 Estado del proyecto

**MVP Funcional — En Producción**

El proyecto se encuentra desplegado en su versión productiva en Vercel y sincronizado con Supabase.

La lógica de sincronización en tiempo real opera de manera estable mediante suscripciones WebSockets y mecanismos de carga diferida.

---

## 🔐 Seguridad y configuración

Las credenciales de producción y los tokens se gestionan de manera segura bajo el principio de menor privilegio:

* Las escrituras en la base de datos (INSERT, UPDATE, DELETE) están estrictamente protegidas mediante **Row Level Security (RLS)** en Supabase.
* La API Key pública (`ANON_KEY`) solo posee permisos de lectura (SELECT) para los usuarios anónimos de la carta.
* Las credenciales globales se inyectan dinámicamente mediante el archivo `js/config.js`.

---

## 🧠 Decisiones técnicas

### ¿Por qué Zero-Build (Vanilla JS + HTML)?

Evita dependencias complejas de Node.js, procesos de build pesados y reduce el tamaño de transferencia de la red. La aplicación es ligera, fácil de mantener y se despliega al instante.

### ¿Por qué Supabase Realtime?

En lugar de hacer *polling* constante (peticiones repetidas cada pocos segundos) para detectar si un producto se agotó, Supabase emite un evento vía WebSockets solo cuando ocurre una mutación en PostgreSQL, reduciendo el consumo de batería y datos del cliente.

---

## 📊 Flujo principal

```text
Cliente escanea QR
        │
        ▼
Carga index.html (Vanilla JS)
        │
        ▼
Consulta inicial SELECT a Supabase DB
        │
        ├──► Apertura de Canal WebSockets (`public:products`)
        │
        ▼
Escucha cambios en tiempo real
        │
        ▼
Actualización inmediata del DOM (UI)

```

---

## ⚙️ Instalación local

### Requisitos

* Servidor HTTP local (por ejemplo, *Live Server* en VS Code o `python -m http.server`)
* Cuenta en Supabase

### Clonar repositorio

```bash
git clone https://github.com/Victopvl/Carta-Digital-Interactivav.git
cd Carta-Digital-Interactivav

```

### Configuración de variables de entorno

Crea o actualiza el archivo `js/config.js` con tus credenciales de Supabase:

```javascript
window.SUPABASE_URL = "https://tu-proyecto.supabase.co";
window.SUPABASE_ANON_KEY = "tu-anon-key-aqui";

```

### Ejecución

Simplemente abre `index.html` mediante un servidor local en tu editor.

---

## ⚠️ Limitaciones actuales

* La versión MVP requiere que la carga inicial de imágenes utilice URLs externas estables.
* El soporte offline es limitado si el cliente pierde conexión a internet por completo durante la navegación.

---

## 📚 Aprendizajes

Este proyecto permitió consolidar competencias en:

* Desarrollo con arquitecturas serverless y BaaS (Supabase).
* Sincronización de estado en tiempo real mediante WebSockets.
* Optimización de rendimiento en interfaces web sin frameworks (Zero-Build).
* Estrategias de seguridad en base de datos mediante Row Level Security (RLS).

---

## 🎯 Capacidades demostradas

**Systems Architecture**

* Diseño de soluciones BaaS / Serverless de bajo costo.
* Sincronización en tiempo real cliente-servidor.

**Frontend & Mobile UX**

* Interfaces móviles ultrarrápidas y accesibles.
* Componentes con Tailwind CSS y Vanilla JS.

**Product Management & TI**

* Estrategia de producto B2B y empaquetamiento comercial ("Caballo de Troya").
* Despliegue ágil orientado a validación en terreno.

---

## 👩🏻‍💻 Autora

**Victoria Vallejos**

Consultora TI, Workspaces Architect & Product Manager

Estudiante de Ingeniería Civil Informática — Universidad Andrés Bello

Áreas de especialización:

* Digitalización de procesos.
* Arquitectura de workspaces.
* Tech Project Management & Product Management.
* Optimización operativa para PyMEs.

### Links

* [Portfolio](https://victopvl.github.io)
* [GitHub](https://github.com/Victopvl)
* [Email](https://www.google.com/search?q=mailto%3Avictoriapaz.sa%40gmail.com)

---

## 📄 Licencia

Proyecto desarrollado con fines de demostración profesional y portfolio B2B.
](https://carta-digital-interactiva.vercel.app/)
