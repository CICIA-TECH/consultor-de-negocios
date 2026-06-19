# Requerimientos del MVP

## 1. Visión

Una interfaz web simple donde el usuario apunta a una carpeta local con documentos de su empresa (PDFs, Excel/CSV) y conversa con una IA que responde preguntas y genera diagnósticos a partir de esos documentos.

No hay autenticación ni almacenamiento en la nube todavía: el MVP es una herramienta de validación del valor del producto (¿la IA da diagnósticos útiles a partir de los documentos?), no un producto multi-usuario.

## 2. Alcance del MVP

### Dentro de alcance
- Selección de una carpeta local desde el navegador.
- Detección y listado de los documentos soportados (PDF, Excel/CSV) dentro de esa carpeta.
- Lectura/extracción de contenido de esos documentos.
- Chat conversacional con la IA que usa el contenido de los documentos como contexto.
- Sin diagnóstico automático previo: el usuario empieza a preguntar directamente, no hay un reporte generado de antemano.

### Fuera de alcance (Fase 2+)
- Login y autenticación (usuario/contraseña por empresa).
- Almacenamiento de documentos en la nube (Supabase Storage).
- Multi-tenant (varias empresas, cada una con sus propios archivos persistidos).
- Búsqueda semántica / RAG sobre una base de conocimientos completa por empresa.
- Historial de conversaciones persistente entre sesiones.
- Paneles visuales con métricas/gráficos o reportes estructurados tipo informe de consultoría.

*Los archivos `lib/supabase/` ya creados en el proyecto quedan reservados para la Fase 2; el MVP no los usa.*

## 3. Usuario y contexto de uso

- Usuario: dueño/encargado de una empresa que quiere un diagnóstico rápido a partir de sus propios documentos.
- Contexto: sesión única en el navegador, sin necesidad de volver a entrar más tarde (no hay persistencia entre sesiones en el MVP).

## 4. Flujos (UX)

### Flujo 1 — Selección de carpeta y carga de documentos
1. El usuario entra al sitio y ve un botón para "Seleccionar carpeta".
2. El navegador abre el selector de directorios nativo (File System Access API).
3. La app escanea la carpeta seleccionada y muestra en una lista lateral los archivos soportados (PDF, Excel/CSV) encontrados.
4. Archivos no soportados se ignoran o se muestran deshabilitados con una indicación visual.
5. La app extrae el contenido de cada documento soportado para usarlo como contexto del chat.

### Flujo 2 — Conversación con la IA
1. Una vez cargados los documentos, el usuario escribe una pregunta en el chat (ej. "¿cuál es mi margen de ganancia este trimestre?").
2. La IA responde usando como contexto el contenido extraído de los documentos de la carpeta.
3. El usuario puede seguir preguntando libremente; no hay un diagnóstico inicial automático.
4. Si no hay documentos cargados, el chat lo indica y sugiere seleccionar una carpeta primero.

## 5. Pantallas (UI)

Una sola pantalla (single view), dividida en:

- **Sidebar izquierdo:**
  - Botón "Seleccionar carpeta".
  - Lista de documentos detectados (nombre + ícono según tipo + estado: cargado / error de lectura).
- **Panel principal (chat):**
  - Historial de mensajes (usuario / IA).
  - Input de texto + botón de enviar.
  - Estado vacío: mensaje guiando a seleccionar una carpeta si no hay documentos.

No se requiere navegación entre páginas para el MVP — todo ocurre en `/`.

## 6. Requerimientos funcionales

| ID | Requerimiento |
|----|----------------|
| RF-1 | El usuario puede seleccionar una carpeta local mediante el selector nativo del navegador. |
| RF-2 | El sistema lista los archivos PDF y Excel/CSV encontrados en la carpeta seleccionada. |
| RF-3 | El sistema extrae el texto/contenido de cada documento soportado. |
| RF-4 | El usuario puede enviar mensajes de chat y recibir respuestas de la IA basadas en el contenido de los documentos cargados. |
| RF-5 | El chat informa cuando no hay documentos cargados aún. |
| RF-6 | Los archivos no soportados se muestran indicados como tales, sin romper el flujo. |

## 7. Requerimientos no funcionales

- **Compatibilidad de navegador:** la File System Access API solo es soportada de forma estable en navegadores basados en Chromium (Chrome, Edge). Firefox y Safari no la soportan completamente — se debe mostrar un mensaje claro si el navegador no es compatible.
- **Privacidad:** los documentos no salen del navegador del usuario salvo el contenido enviado a la IA como contexto de la conversación.
- **Sin persistencia:** recargar la página implica volver a seleccionar la carpeta (no hay guardado de sesión en el MVP).

## 8. Decisiones técnicas relevantes (impacto en UX)

- **Extracción de contenido en el cliente:** el parsing de PDF/Excel/CSV se hace en el navegador (librerías JS), sin enviar los archivos a un servidor. El archivo nunca sale de la máquina del usuario; solo el texto extraído se envía a la IA como contexto del chat. Cuando en Fase 2 los archivos vivan en Supabase Storage, este procesamiento se migra a una API route de Next.js.
- Al no haber diagnóstico automático previo, la primera interacción del usuario es siempre una pregunta libre — el copy del estado vacío del chat debe sugerir ejemplos de preguntas para guiar al usuario.

## 9. Próximos pasos (Fase 2, referencia)

- Login con usuario/contraseña por empresa.
- Subida de documentos a Supabase Storage en vez de carpeta local.
- Persistencia de conversaciones e historial por empresa.
- Búsqueda semántica (RAG/pgvector) sobre la base de conocimientos completa de cada empresa.
