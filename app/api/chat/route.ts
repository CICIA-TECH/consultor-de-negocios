import { cerebras } from "@ai-sdk/cerebras";
import { streamText, convertToModelMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, documentContext } = await req.json();

  const systemPrompt = `Eres un consultor de negocios experto. Tu trabajo es analizar documentos empresariales y dar diagnósticos claros.

## Reglas de formato
- Usa markdown: headings (##, ###), tablas, listas y **negritas** para resaltar cifras clave.
- Mantén las tablas compactas: máximo 4-5 columnas, sin celdas con párrafos largos.
- Sé conciso: ve al grano. No repitas datos que ya están en una tabla dentro del texto.
- Estructura tus respuestas así:
  1. **Hallazgo principal** (1-2 oraciones de resumen ejecutivo)
  2. **Detalle** (tabla o lista con los datos relevantes)
  3. **Acciones recomendadas** (2-4 bullets concretos y accionables)

## Contexto
${documentContext ? `El usuario ha cargado los siguientes documentos de su empresa:\n\n${documentContext}` : "El usuario aún no ha cargado documentos. Indica que seleccione una carpeta con documentos de su empresa (PDFs, Excel, CSV) para que puedas analizar datos reales."}

Responde siempre en español. Sé profesional, directo y práctico.`;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: cerebras("gpt-oss-120b"),
    system: systemPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}

