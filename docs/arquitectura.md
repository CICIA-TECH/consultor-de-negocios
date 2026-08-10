# Arquitectura técnica — CICIA Consultor de Negocios

Este documento describe cómo está construida la app hoy: stack, capas, y los sistemas
(auth, chat, cuota, documentos, theming) que ya están implementados. Es un mapa para
orientarse en el código, no un plan de producto — para eso ver `docs/requerimientos-mvp.md`
y el [GitHub Project "MVP Consultor de Negocios"](https://github.com/orgs/CICIA-TECH/projects/1).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) + React 19 |
| Auth / DB | Supabase (Postgres + Auth + RLS) |
| IA | Vercel AI SDK (`ai`, `@ai-sdk/react`) + Cerebras (`gpt-oss-120b`) |
| Parsing de documentos | `pdfjs-dist`, `xlsx` (client-side, sin backend) |
| Gráficos | `recharts` |
| Hosting | Vercel (proyecto `consultor-de-negocios`, org `cicia-tech`) |
| Email transaccional (pendiente de integrar) | Resend — ver issue #14 |

No hay backend propio aparte de las API routes de Next.js: Supabase hace de base de
datos + auth, y Cerebras (vía AI Gateway del SDK) hace de motor de IA.

## Estructura de carpetas

```
app/
  (app)/              → rutas protegidas, comparten layout+estado (ver más abajo)
    layout.tsx         → valida sesión server-side, monta AppShell
    page.tsx            → "/"           (chat)
    empresa/page.tsx    → "/empresa"     (documentos de la empresa)
    configuracion/page.tsx → "/configuracion"
  login/page.tsx       → "/login"   (pública)
  registro/page.tsx    → "/registro" (pública)
  auth/confirm/route.ts → callback de confirmación de email de Supabase
  api/chat/route.ts    → endpoint de streaming del chat (excluido del middleware de auth)

components/            → componentes de UI, casi todos client components
lib/
  supabase/            → 3 variantes del cliente Supabase (browser/server/middleware)
  app-state/context.ts → contexto React compartido entre las páginas de (app)/
  navigation/config.ts → única fuente de verdad del sidebar
  documents/           → parsing de PDF/XLSX/CSV en el navegador
  theme/theme.ts        → persistencia de tema claro/oscuro
  quota.ts              → constantes del límite diario de mensajes

middleware.ts           → gate de autenticación a nivel de request
supabase/migrations/    → schema de la base de datos (profiles, usage_daily)
```

## Autenticación

**Proveedor:** Supabase Auth, con email/password (sin OAuth social todavía).

### Middleware (`middleware.ts` + `lib/supabase/middleware.ts`)

Corre en cada request (excepto `/api/*` y assets estáticos, ver `config.matcher`) y:

1. Refresca la sesión (`supabase.auth.getUser()`) y reescribe las cookies si hace falta.
2. Si **no** hay usuario y la ruta no es pública (`/login`, `/registro`, `/auth`) → redirect a `/login`.
3. Si **hay** usuario y la ruta es `/login` o `/registro` → redirect a `/`.

`/api/*` está explícitamente excluido del matcher: las API routes validan su propia
sesión con `lib/supabase/server.ts` y devuelven `401` en JSON en vez de un redirect
HTML, que es lo correcto para un endpoint consumido por `fetch`/`useChat`.

### Tres variantes del cliente Supabase (patrón estándar de `@supabase/ssr`)

- `lib/supabase/client.ts` — `createBrowserClient`, para Client Components.
- `lib/supabase/server.ts` — `createServerClient` sobre `next/headers`, para Server
  Components y route handlers (usa cookies de la request actual).
- `lib/supabase/middleware.ts` — variante que lee/escribe cookies sobre el objeto
  `NextRequest`/`NextResponse` del middleware.

Los tres usan `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (el
nombre nuevo de Supabase para lo que antes era la "anon key" — mismo propósito, misma
seguridad basada en RLS).

### Flujo de registro/login

- `RegistroForm` (`components/RegistroForm.tsx`) llama `supabase.auth.signUp()`. Por
  diseño anti-enumeración, Supabase **no** devuelve error si el email ya existe y está
  confirmado — devuelve un `user` con `identities: []`; el form detecta ese caso
  explícitamente para no mostrar un falso "revisa tu correo".
- El link de confirmación pega a `app/auth/confirm/route.ts`, que hace
  `supabase.auth.verifyOtp()` y redirige a `/`.
- `LoginForm` usa `signInWithPassword`. `LogoutButton` usa `signOut()`.
- **Deuda conocida:** el envío de esos correos usa el mailer default de Supabase
  (rate limit ~3-4/hora por proyecto, no apto para producción). Fix planeado: issue
  [#14](https://github.com/CICIA-TECH/consultor-de-negocios/issues/14) (SMTP con
  Resend sobre el dominio `cicia.xyz`).

## Enrutamiento y estado compartido (route group `(app)`)

Las tres vistas protegidas (chat, empresa, configuración) son **rutas reales**, no
pestañas simuladas con `useState` — así el refresh, el botón atrás/adelante y las URLs
compartibles funcionan de forma nativa.

El reto de este approach: `documents` (carpeta cargada) y los mensajes del chat
(`useChat`) necesitan sobrevivir a la navegación entre esas rutas. La solución usa una
propiedad del App Router: un `layout.tsx` **no se remonta** al navegar entre las
páginas que envuelve.

```
app/(app)/layout.tsx   (Server Component)
  → valida sesión, redirige si no hay user
  → monta <AppShell userEmail>

components/AppShell.tsx   (Client Component, vive en el layout)
  → holds: documents, isLoadingFolder, useChat() (messages/status/error)
  → expone todo vía AppStateContext (lib/app-state/context.ts)
  → renderiza <Sidebar> + {children}

app/(app)/page.tsx, empresa/page.tsx, configuracion/page.tsx
  → consumen useAppState() y solo pintan UI
```

`Sidebar`/`NavItem` usan `<Link>` + `usePathname()` (no callbacks) para marcar la
vista activa — es navegación real de Next.js, no estado de UI.

## Chat con IA (`app/api/chat/route.ts`)

- Requiere sesión (401 si no hay `user`).
- Antes de llamar al modelo, incrementa la cuota diaria vía el RPC
  `increment_daily_usage()` (ver sección Cuota) y corta con `429` +
  `DAILY_LIMIT_MARKER` si se supera `DAILY_MESSAGE_LIMIT`.
- Usa `streamText` del AI SDK con el modelo `cerebras("gpt-oss-120b")`, un system
  prompt extenso (metodología PTCF para consultoría de negocios) y una tool
  `renderChart` (Zod schema) que el modelo puede invocar para pedir un gráfico —
  el render real ocurre en el cliente (`ChartRenderer.tsx` vía `recharts`), la
  `execute()` del server solo devuelve un string de confirmación para no romper el
  protocolo de tool-results del SDK.
- El contexto de documentos cargados (`documentContext`) se manda desde el cliente en
  el body de cada request — no se persiste server-side (ver Documentos).
- `ChatPanel.tsx` distingue errores de límite diario vs. rate limit del proveedor
  (`isDailyLimit` / `isTokenLimit`) para mostrar UI distinta en cada caso.

## Cuota diaria (`lib/quota.ts` + migración `add_usage_daily.sql`)

- Límite fijo: `DAILY_MESSAGE_LIMIT = 20` mensajes/día, igual para todos los usuarios
  (no hay planes todavía — la tabla `profiles` ya tiene una columna `plan` preparada
  para eso, issue de pagos aún no creado).
- Tabla `usage_daily (user_id, day, message_count)`, PK compuesta `(user_id, day)`.
- El incremento es atómico vía la función Postgres `increment_daily_usage()`
  (`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`), evitando race conditions entre
  leer el contador y decidir si bloquear — todo en un round-trip.
- RLS: cada usuario solo puede ver/insertar/actualizar sus propias filas
  (`auth.uid() = user_id`).

## Documentos de la empresa (`lib/documents/`)

- **100% client-side**, sin subida a ningún backend todavía (issue #11, "Subida de
  documentos a Supabase Storage", sigue en backlog).
- Usa la **File System Access API** del navegador (`showDirectoryPicker`) — por eso
  solo funciona en Chrome/Edge (`isFileSystemAccessSupported()` lo detecta y
  `MiEmpresa.tsx` avisa si no está soportado).
- `readDirectory.ts` recorre la carpeta recursivamente; `parse.ts` extrae texto de
  PDF (`pdfjs-dist`, worker cargado dinámicamente) y de XLSX/XLS/CSV (`xlsx`,
  convertido a CSV por hoja).
- El texto extraído se concatena (`AppShell.tsx`) y viaja como `documentContext` en
  cada mensaje del chat — no hay persistencia ni indexado (RAG) todavía (issue #13
  depende de esto).

## Base de datos (Supabase / Postgres)

Dos tablas hasta ahora, ambas con RLS activado y políticas por `auth.uid()`:

- **`profiles`** — 1 fila por usuario (`id` = `auth.users.id`), creada automáticamente
  vía trigger `on_auth_user_created` → `handle_new_user()` al hacer signup. Columna
  `plan` (default `'free'`) preparada para monetización futura.
- **`usage_daily`** — contador de mensajes por usuario y día (ver Cuota).

**Deuda técnica activa:** el proyecto Supabase es **el mismo para desarrollo/preview y
producción** — no hay separación de entornos a nivel de base de datos. Cualquier
prueba manual (como las de esta sesión) escribe filas reales en la misma DB que
serviría a producción.

## Theming (`lib/theme/theme.ts`)

- Claro/oscuro, persistido en `localStorage` (`THEME_STORAGE_KEY`).
- El tema se aplica como atributo `data-theme` en `<html>`.
- `applyStoredThemeScript` se inyecta inline en `<head>` (`app/layout.tsx`) para fijar
  el tema **antes** del primer paint y evitar el flash de tema incorrecto durante la
  hidratación de React.

## Deploy e infraestructura (Vercel)

- Proyecto `consultor-de-negocios` en el team `cicia-tech`.
- **Production branch:** `main` (confirmado vía deployments — todo `target:
  "production"` viene de `githubCommitRef: "main"`). `development` genera deploys de
  Preview.
- Dominio propio `cicia.xyz` (registrado en Vercel Domains) vinculado como dominio de
  producción del proyecto. Pendiente: verificarlo también en Resend para envío de
  correos (issue #14) — ambos usos (web + email) son compatibles en la misma zona DNS.
- Variables de entorno relevantes: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `CEREBRAS_API_KEY`, `RESEND_API_KEY`,
  `RESEND_EMAIL_DOMAIN` (Resend aún sin integrar en código).

## Deuda técnica y pendientes conocidos

Ver el [project board](https://github.com/orgs/CICIA-TECH/projects/1) para el detalle
y dependencias entre issues. Resumen de lo relevante para entender el estado actual:

- **DB única para dev/preview y producción** — sin issue creado todavía.
- **#9 / cuota** — implementado, pero el límite es global, no por plan.
- **#11 — Documentos en Supabase Storage** — hoy los documentos no se persisten, viven
  solo en memoria del navegador durante la sesión.
- **#12 — Persistencia de conversaciones** — `useChat` hoy no guarda historial; se
  pierde al recargar la página del chat o cerrar el navegador.
- **#13 — RAG/pgvector** — el "contexto" de documentos hoy es texto plano completo
  concatenado en el prompt, sin chunking ni búsqueda semántica.
- **#14 — SMTP de Resend** — mailer default de Supabase, rate-limited, no apto para
  producción.
