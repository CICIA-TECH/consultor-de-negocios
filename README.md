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
- **Base de Datos & Auth:** Supabase (PostgreSQL).
- **Almacenamiento:** Supabase Storage (documentos subidos por las empresas).
- **IA:** Por definir.
- **Estilos:** Vanilla CSS.
- **Despliegue:** Vercel.

*Nota: Supabase (base de datos, auth, storage) está integrado en el proyecto pero aún no conectado al flujo del MVP — queda reservado para la Fase 2. La versión actual del MVP lee documentos desde una carpeta local del navegador y usa una respuesta de IA simulada. Ver el detalle en [docs/requerimientos-mvp.md](docs/requerimientos-mvp.md).*

---

## ⚙️ Setup

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Levantar en desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000) en **Chrome o Edge** (la selección de carpeta usa la File System Access API, no soportada en Firefox/Safari).

3. **Usar el MVP:** click en "Seleccionar carpeta" y elegir una carpeta local con PDFs o archivos Excel/CSV. Luego escribir preguntas en el chat (por ahora responde con una IA simulada, ver nota en Tech Stack).

### Setup de Supabase (Fase 2, no requerido para el MVP actual)

1. Crear un proyecto en [supabase.com](https://supabase.com) → "New Project".
2. Copiar la `Project URL` y la `anon public key` desde Project Settings → API.
3. Crear `.env.local` copiando el ejemplo y rellenando con esas claves:
   ```bash
   cp .env.local.example .env.local
   ```

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
**Autoría de:** *Dokeh-404*
**Fecha de creación:** *18 de junio de 2026*
**Última actualización:** *18 de junio de 2026*
