# Onboarding para nuevos colaboradores

Checklist para que alguien nuevo en el equipo pueda empezar a hacer cambios en `consultor-de-negocios`.

## 1. Accesos a plataformas

Alguien con permisos (Diego) tiene que invitarlo antes de este paso:

- [ ] Organización **GitHub `CICIA-TECH`** (repo `consultor-de-negocios`), con permiso de escritura.
- [ ] **Team de Vercel `cicia-tech`** (Project Settings → Members).
- [ ] **Proyecto de Supabase** (`CICIA Project`) — Dashboard → Project Settings → Team.
- [ ] Opcional: acceso a **Cerebras Cloud** y/o **Groq Console** si va a tocar temas de proveedor de IA/billing.

## 2. Setup local

```bash
git clone https://github.com/CICIA-TECH/consultor-de-negocios.git
cd consultor-de-negocios
npm install
npm i -g vercel supabase gh
gh auth login
```

## 3. Conectar el proyecto

```bash
vercel login
vercel link          # elegir cicia-tech/consultor-de-negocios
vercel env pull      # baja .env.local con todas las env vars de Development
```

Esto trae automáticamente las keys de Supabase, Cerebras, Groq y el flag `AI_PROVIDER` — no hace falta pedirle nada a mano a nadie.

Para conectar el CLI de Supabase (necesario para aplicar/consultar migraciones):

```bash
supabase login --token sbp_...   # generar el token en supabase.com/dashboard/account/tokens
supabase link --project-ref ybfmieaxpnzgchergaim
```

> ⚠️ **Usar `--token`, no el login interactivo por navegador.** El login por navegador (`supabase login` sin flags) nos dio `Unauthorized` de forma persistente incluso después de loguear correctamente — causa no resuelta. `supabase login --token <PAT>` funciona de forma confiable.

## 4. Crear una cuenta de usuario en la app

Para poder probar el chat hace falta una cuenta (auth de Supabase, no las cuentas de las plataformas del paso 1):

```bash
npm run dev
```

1. Entrar a `http://localhost:3000/registro` y crear una cuenta con tu email.
2. Confirmar el correo (revisar spam si no llega — el mailer default de Supabase tiene un rate limit bajo, ver issue #14 pendiente sobre configurar Resend).

## 5. Flujo de trabajo del repo

- Ramificar siempre desde `development` (no desde `main`), y abrir PRs hacia `development`.
- `main` es producción. Solo se mergea `development → main` cuando algo está probado y listo.
- El estado de las tareas se trackea en el GitHub Project **"MVP Consultor de Negocios"** (org `CICIA-TECH`), no en este documento.

## Notas del proveedor de IA

El endpoint de chat (`app/api/chat/route.ts`) soporta dos proveedores según la variable `AI_PROVIDER`:

- Sin setear (o cualquier valor que no sea `groq`) → usa **Cerebras** (`gpt-oss-120b`).
- `AI_PROVIDER=groq` → usa **Groq** (`openai/gpt-oss-120b`), fallback mientras la cuenta de Cerebras de producción esté bloqueada por billing.

Ambos ya vienen configurados en Vercel (Development/Production) — `vercel env pull` te trae lo que corresponda, no hay que elegir nada manualmente.
