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

*Nota: Supabase (base de datos, auth, storage) está integrado en el proyecto pero aún no conectado al flujo del MVP — queda reservado para la Fase 2. La versión actual del MVP lee documentos desde una carpeta local del navegador.*

---

## ⚙️ Setup

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno:**
   Copia el archivo de ejemplo y agrega tu API key de Cerebras:
   ```bash
   cp .env.local.example .env.local
   ```
   Abre `.env.local` y agrega tu key obtenida en [cloud.cerebras.ai](https://cloud.cerebras.ai):
   ```env
   CEREBRAS_API_KEY=csk-tu-clave-aqui
   ```

3. **Levantar en desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en **Chrome o Edge** (la selección de carpeta usa la File System Access API, no soportada en Firefox/Safari).

4. **Usar el MVP:** Haz click en "Seleccionar carpeta", elige una carpeta local con PDFs o archivos Excel/CSV, y escribe tus preguntas. La IA analizará el contexto usando el modelo `gpt-oss-120b` de Cerebras.

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
**Autoría de:** *Dokeh-404*  
**Fecha de creación:** *18 de junio de 2026*  
**Última actualización:** *20 de junio de 2026 (Manejo de cuota de tokens e interfaz de alertas)*

