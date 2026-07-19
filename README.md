# Consultor de Negocios 📊

> **Sube tu información, recibe claridad.**

Next.js 15 (App Router) + Supabase + Vercel.

Consultor de Negocios es una plataforma de asesoría empresarial impulsada por IA. Las empresas suben documentos sobre su operación y reciben análisis, diagnósticos y oportunidades de mercado generados automáticamente.

---

Hacer un diagnóstico empresarial serio suele requerir tiempo, consultores caros o planillas dispersas. Consultor de Negocios busca que ese proceso sea:
- **Accesible:** Diagnósticos de negocio sin depender de una consultora tradicional.
- **Rápido:** De documento subido a análisis en minutos, no semanas.
- **Claro:** Resultados presentados de forma simple y accionable.

---

## 📋 El MVP (Fase 1)

Nos enfocamos en los pilares fundamentales para validar el valor del producto:

### 1. Carga de Documentos
- **Subida de archivos:** Las empresas suben documentos relevantes de su negocio (financieros, operativos, comerciales).
- **Almacenamiento centralizado:** Cada documento queda asociado a la empresa que lo subió.

### 2. Análisis con IA
- **Diagnóstico automático:** La IA procesa los documentos y genera un análisis del estado del negocio.
- **Oportunidades de mercado:** Identificación de áreas de mejora y posibles oportunidades.

### 3. Resultados
- **Panel de resultados:** Visualización simple y clara de los diagnósticos generados.

*Nota: El login/autenticación de usuarios está planificado para una fase posterior. El MVP no requiere autenticación funcional.*

---

## 🛠️ Filosofía de Desarrollo

> *"La tecnología funciona mejor cuando sirve a las personas, no al revés."*
> ~ Linus Torvalds

Definimos una regla clara para nuestro proceso de desarrollo:
**el desarrollador diseña y actúa como arquitecto; la inteligencia artificial ejecuta.**

A partir de este principio, estructuramos nuestro trabajo en:

- **Desarrollo Auditado:** El código es generado y supervisado críticamente por el desarrollador, quien actúa como arquitecto y garante de la calidad.
- **Base de Conocimientos (Docs):** Mantenemos una documentación que va de lo general a lo particular en `/docs`, cubriendo desde el diseño del sistema y reglas de negocio hasta decisiones técnicas específicas.
- **Estándares de Código:** Uso de Conventional Commits para estructurar commits de forma semántica, facilitando la trazabilidad, el versionado y la automatización del changelog.

---

## 🎨 Estética y Experiencia (UX)

- **Clara y Profesional:** Interfaz que transmite confianza para decisiones de negocio.
- **Simplicidad:** Diseño ligero, enfocado en mostrar resultados de forma directa.
- **Mobile-Friendly:** Usable desde cualquier dispositivo, sin perder claridad.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router).
- **IA:** Cerebras (modelo `gpt-oss-120b`) integrado vía Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/cerebras`).
- **Renderizado de Chat:** `marked` para parsear las respuestas Markdown del asistente a HTML con GitHub Flavored Markdown (GFM).
- **Gráficos:** Recharts para visualización de datos interactiva (barras, líneas, pie) generada por IA via tool calls.
- **Base de Datos & Auth:** Supabase (PostgreSQL).
- **Almacenamiento:** Supabase Storage.
- **Estilos:** Vanilla CSS.
- **Despliegue:** Vercel.
- **Tooling de desarrollo:** [Vercel Plugin para Claude Code](https://github.com/vercel/vercel-plugin) — da acceso a skills/comandos de Vercel (CLI, deploys, logs, storage) directamente dentro de Claude Code.

*Nota: Supabase (base de datos, auth, storage) está integrado en el proyecto pero aún no conectado al flujo del MVP — queda reservado para la Fase 2. La versión actual del MVP lee documentos desde una carpeta local del navegador.*

---

## ⚙️ Setup

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno:**

   **Opción A — manual:**
   Copia el archivo de ejemplo y agrega tu API key de Cerebras:
   ```bash
   cp .env.local.example .env.local
   ```
   Abre `.env.local` y agrega tu key obtenida en [cloud.cerebras.ai](https://cloud.cerebras.ai):
   ```env
   CEREBRAS_API_KEY=csk-tu-clave-aqui
   ```

   **Opción B — vía Vercel CLI (recomendado si el proyecto ya está conectado a Vercel):**
   Sincroniza las variables marcadas como *Development* en el dashboard de Vercel en vez de cargarlas a mano:
   ```bash
   npm i -g vercel
   vercel login
   vercel link      # una sola vez, asocia esta carpeta al proyecto de Vercel
   vercel env pull .env.local
   ```
   Repetir `vercel env pull .env.local` cada vez que una key de desarrollo cambie en Vercel.

3. **Levantar en desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en **Chrome o Edge** (la selección de carpeta usa la File System Access API, no soportada en Firefox/Safari).

4. **Usar el MVP:** Haz click en "Seleccionar carpeta", elige una carpeta local con PDFs o archivos Excel/CSV, y escribe tus preguntas. La IA analizará el contexto usando el modelo `gpt-oss-120b` de Cerebras.

### Vercel Plugin para Claude Code (opcional)

Da acceso a skills de Vercel (CLI, deploys, logs, env vars, storage) dentro de Claude Code. No es requerido para correr el proyecto, es una herramienta de productividad para quienes desarrollan.

**Instalar** (por dev, nivel de usuario — no es parte del repo):
```bash
npx plugins add vercel/vercel-plugin --target claude-code
```
Reiniciar Claude Code después de instalar para que cargue el plugin.

**Usar:** una vez instalado, invocar los skills disponibles (ej. `vercel-cli`, `vercel-connect`, `vercel-storage`) directamente pidiéndole a Claude Code que gestione algo del proyecto en Vercel (deploy, logs, env vars).

### Setup de Supabase (Fase 2)

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.

### Cómo se creó este proyecto

Pasos seguidos para dejar el stack andando desde cero (referencia si necesitas reproducirlo):

```bash
# 1. Crear la app Next.js 15 (App Router, TypeScript, Vanilla CSS, ESLint)
npx create-next-app@latest consultor-de-negocios --typescript --app --no-tailwind --eslint --src-dir=false --import-alias "@/*"

# 2. Instalar el SDK de Supabase
npm install @supabase/supabase-js @supabase/ssr

# 3. Crear lib/supabase/client.ts, lib/supabase/server.ts y lib/supabase/middleware.ts
#    siguiendo la guía oficial de SSR de Supabase para Next.js (ver Documentación abajo)

# 4. Crear middleware.ts en la raíz para refrescar la sesión en cada request

# 5. Verificar que todo compila
npm run typecheck
npm run lint
npm run build
```

---

## 📂 Estructura

- `app/` — App Router (layouts, páginas, route handlers).
- `app/api/chat/route.ts` — Endpoint del chat con IA. Define las tools disponibles (como `renderChart`).
- `components/` — Componentes React (ChatPanel, ChartRenderer, Sidebar, etc.).
- `components/ChartRenderer.tsx` — Renderizado de gráficos interactivos con Recharts.
- `lib/documents/` — Lectura y procesamiento de documentos del usuario.
- `lib/navigation/` — Configuración de la navegación lateral.
- `lib/supabase/` — Clientes de Supabase para browser (`client.ts`), server components (`server.ts`) y middleware (`middleware.ts`), listos para cuando se conecte Supabase.
- `docs/` — Base de conocimientos y especificaciones.

*Nota: `middleware.ts` (refresco de sesión de Supabase en cada request) está desactivado temporalmente porque el MVP aún no usa Supabase. Para reactivarlo, crear `middleware.ts` en la raíz a partir de `lib/supabase/middleware.ts` (ver guía SSR en Documentación) y configurar `.env.local`.*

---

## 🚀 Deploy a Vercel

1. Push del repo a GitHub.
2. Importar en Vercel.
3. Configurar las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el dashboard de Vercel.

---

## 💬 Feedback de Stakeholders

Canal de retroalimentación durante la etapa de validación del MVP: se comparte el link de producción por WhatsApp, y el feedback se registra en un **Google Sheet** — un slide por cada pantallazo de la app, con los comentarios dejados directamente encima de cada slide. Se crea un **archivo nuevo por cada versión de la app** (no se reutiliza el mismo Sheet entre versiones).

### Acceso

- El link de **Production** (`consultor-de-negocios.vercel.app`) queda **abierto** por ahora, sin Password Protection — es lo único que se comparte con stakeholders.
- Los **Preview Deployments** (generados por rama/PR) quedan reservados para los **desarrolladores** — se usan para revisar cambios antes de mergear a `main`, no se comparten con stakeholders.

---

## 📈 Vercel Speed Insights

Herramienta de Vercel para medir el rendimiento real (Real User Monitoring) del sitio en producción, en base a las visitas reales de los usuarios (no solo tests sintéticos).

### Métricas que reporta (Core Web Vitals + adicionales)

| Métrica | Qué mide |
|---------|----------|
| **LCP** (Largest Contentful Paint) | Velocidad de carga: cuánto tarda en renderizarse el elemento más grande visible (ej. el chat/sidebar principal). |
| **FID / INP** (Interaction to Next Paint) | Responsividad: cuánto tarda la UI en reaccionar a una interacción del usuario (ej. click en "Seleccionar carpeta"). |
| **CLS** (Cumulative Layout Shift) | Estabilidad visual: cuánto se "salta"/reacomoda el layout mientras carga (ej. si el chat empuja contenido al cargar mensajes). |
| **TTFB** (Time to First Byte) | Qué tan rápido responde el servidor con el primer byte de la página. |
| **FCP** (First Contentful Paint) | Cuándo aparece el primer contenido visible en pantalla. |

Se puede filtrar por página, dispositivo y navegador — útil para el caso puntual de este proyecto para ver si stakeholders en navegadores no soportados (Firefox/Safari) tienen métricas mucho peores, o si el flujo de carga de documentos grandes impacta el LCP/INP.

### Cómo está habilitado

1. **Dashboard de Vercel:** Project → tab **Speed Insights** → **Enable**. *(Hecho.)*
2. **Código:** paquete instalado (`@vercel/speed-insights`) y componente `<SpeedInsights />` agregado en `app/layout.tsx`, dentro del `<body>`. Se ejecuta en el navegador de cualquier visitante, sin necesidad de login (ver nota de privacidad abajo).
3. Los datos aparecen en el dashboard después de que haya tráfico real en producción — no hay datos instantáneos al activar.

*Nota: no requiere autenticación de usuarios para funcionar — mide de forma anónima por visita a la página (Web Vitals del navegador), no por identidad de usuario. Ver sección de Setup, no hace falta configurar nada adicional.*

## 📚 Documentación Oficial

- [Next.js (App Router)](https://nextjs.org/docs/app)
- [Supabase](https://supabase.com/docs)
- [Supabase + Next.js (guía SSR)](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Vercel](https://vercel.com/docs)

---

## 📜 Scripts

- `npm run dev` — Desarrollo con Turbopack.
- `npm run build` — Build de producción.
- `npm run start` — Servir build.
- `npm run lint` — ESLint.
- `npm run typecheck` — Verificación de tipos TypeScript.

---

## 📊 Gráficos Interactivos en el Chat

El asistente IA puede generar gráficos interactivos directamente en el chat cuando considera que la visualización aporta más claridad que el texto.

### ¿Cómo funciona?

Se utiliza el sistema de **tool calls** del Vercel AI SDK:

1. El modelo recibe la tool `renderChart` con un schema Zod que define los parámetros del gráfico.
2. Cuando el modelo decide que un gráfico sería útil, invoca la tool con datos estructurados (tipo, título, datos, ejes).
3. El frontend detecta la invocación en los `parts` del mensaje y renderiza un `<ChartRenderer>` con Recharts.

El modelo decide **autónomamente** cuándo usar un gráfico — no necesita que el usuario lo pida explícitamente.

### Tipos de gráficos soportados

| Tipo   | Uso ideal                             | Ejemplo                          |
|--------|---------------------------------------|----------------------------------|
| `bar`  | Comparaciones entre categorías        | Ventas por mes, gastos por área  |
| `line` | Tendencias temporales                 | Evolución de ingresos, proyecciones |
| `pie`  | Proporciones / distribución           | Distribución de gastos, market share |

### Características

- **Dual series**: Soporte para comparar dos series de datos (ej: ingresos vs gastos).
- **Theme-aware**: Los gráficos se adaptan automáticamente al modo claro/oscuro.
- **Tooltips interactivos**: Al pasar el mouse se muestran los valores formateados.
- **Animaciones suaves**: Los gráficos se animan al aparecer.
- **Responsive**: Se adaptan al ancho disponible del chat.

### Archivos clave

- `app/api/chat/route.ts` → Definición de la tool `renderChart` con schema Zod.
- `components/ChartRenderer.tsx` → Componente que renderiza los gráficos con Recharts.
- `components/ChatPanel.tsx` → Detección de `tool-invocation` parts y delegación al renderer.

---

## ⚠️ Manejo de Errores y Límites de Cuota (Rate Limits)

Para ofrecer una experiencia de usuario fluida y transparente, el sistema maneja los errores de cuota de la API de Cerebras (como el exceso de tokens por minuto o límites de peticiones) de la siguiente manera:

1. **Propagación del Error (Backend):** Por defecto, el Vercel AI SDK enmascara los errores del servidor retornando un genérico `"An error occurred."`. Hemos configurado el callback `onError` en `toUIMessageStreamResponse` (`app/api/chat/route.ts`) para propagar el mensaje de error original del proveedor al cliente.
2. **Detección en el Cliente (Frontend):** En `components/ChatPanel.tsx`, evaluamos el mensaje de error para detectar patrones de límite de cuota (como `tokens per minute`, `quota_exceeded` o `429`).
3. **Banner de Advertencia Premium:** En lugar de lanzar una pantalla de error o texto genérico en rojo, se despliega un banner de advertencia elegante con colores de advertencia del sistema (`--color-warning-bg` y `--color-warning-text`), informando al usuario en español que no hay tokens disponibles en ese momento y que debe esperar un minuto antes de reintentar.

---

## ✍️ Visualización y Streaming de Respuestas (Typewriter & Auto-scroll)

Para lograr una experiencia de usuario fluida al nivel de plataformas premium como Claude, Gemini o ChatGPT, se implementaron mejoras en la visualización de respuestas:

1. **Efecto Typewriter (Máquina de escribir):**
   - Aunque la infraestructura de Cerebras genera respuestas de manera instantánea y veloz, el frontend las expone de forma lineal y progresiva.
   - Utiliza un Hook personalizado (`useTypewriter` en [ChatPanel.tsx](file:///c:/Users/benya/Desktop/things/Proyectos/STUP/consultor-de-negocios/components/ChatPanel.tsx)) que procesa y revela el texto a una velocidad parametrizada de **4 caracteres cada 25 ms** (~160 caracteres por segundo).
   - Se muestra un cursor parpadeante estilizado (`|`) al final de la respuesta activa mientras se está revelando el texto.
   - El formateador de Markdown (`marked`) renderiza el HTML sobre el texto revelado de forma dinámica y eficiente.

2. **Auto-scroll Inteligente (No invasivo):**
   - Mediante un `MutationObserver` en el elemento `#chat-messages`, el chat detecta cualquier cambio en la estructura del DOM (caracteres adicionales, formateo o inyección de gráficos) y realiza un scroll hacia el fondo.
   - **Detección de intenciones del usuario (Scrollback Protection):** El sistema calcula si el usuario está cerca del final (umbral de 150px). Si el usuario desplaza el chat hacia arriba de forma manual para repasar un mensaje antiguo, el auto-scroll se detiene de inmediato para evitar que la pantalla salte de forma invasiva.

---
**Autoría de:** *Dokeh-404*  
**Fecha de creación:** *18 de junio de 2026*  
**Última actualización:** *21 de junio de 2026 (Typewriter, Auto-scroll inteligente y Gráficos interactivos)*

