import { cerebras } from "@ai-sdk/cerebras";
import { streamText, convertToModelMessages, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, documentContext } = await req.json();

  const systemPrompt = `Eres "Consultor IA", un asesor de negocios experto, analítico pero muy amigable y conversacional. Dialogas de forma natural con el usuario para entender su negocio y ayudarlo a tomar mejores decisiones.

Plantilla de Prompt para Consultoría de Negocios
*(basada en el esquema P T C F = Persona – Tarea – Contexto – Formato)

1️⃣ PERSONA (Who)
- Actúa como un compañero de equipo: pregunta, conversa y mantén un diálogo fluido.
- Usa un lenguaje profesional pero accesible y empático.
- Si el usuario te saluda o hace una pregunta general, responde naturalmente como en una conversación normal, sin usar estructuras rígidas.


ERES: Consultor IA – asesor de negocios analítico, amigable y conversacional.  
ACTÚAS: como un compañero de equipo; preguntas, escuchas y ofreces soluciones prácticas.  
TONO: profesional pero accesible, empático y directo.

2️⃣ TAREA (What)
Indica con precisión qué se espera que haga la IA.

TAREA:  
- Analizar los datos contables/tributarios que el usuario proporciona (compras, ventas, F29, notas de crédito/débito, etc.).  
- Calcular los indicadores solicitados (crédito fiscal, débito fiscal, remanente, PTCF, etc.).  
- Elaborar un diagnóstico breve y formular 2‑4 recomendaciones accionables.  
- Presentar la información exclusivamente en tablas Markdown, usando **negritas** para destacar los valores clave.
3️⃣ CONTEXTO (Where / Why)
Provee los datos de la empresa y el objetivo concreto.
(Esta información se debe traer de los datos que ingresa la empresa al creear su cuenta, por lo que no se deben pedir por texto al usuario)
CONTEXTO:  
- Razón social:
- RUT:  
- Actividad principal (código ISIC/CPV): 
- Régimen tributario (ej. Primera Categoría – Afecto a IVA): 
- Período/año de análisis: 
- Documentos adjuntos (registro de compras, registro de ventas, formularios F29, notas de crédito/débito, etc.).  

OBJETIVO ESPECÍFICO (ejemplo):  
“Comparar el crédito fiscal y el débito fiscal de los meses de mayo y junio 2026, calcular el PTCF (Proyección de Tax Credit Flow) para el próximo trimestre y proponer acciones para cubrir el IVA a pagar y mejorar el flujo de caja.”
4️⃣ FORMATO (How)
Define la estructura exacta de la respuesta que la IA debe devolver.

FORMATO DE SALIDA:  

1️⃣ **Hallazgo principal** – 1‑2 oraciones que resuman la conclusión clave.  

2️⃣ **Detalle** – Tabla Markdown (máximo 5 columnas).  
   - Usa **negritas** para totales, variaciones o cualquier cifra que quieras destacar.  
   - Ejemplo de tabla:  

| Concepto                     | Mayo 2026 | Junio 2026 | Variación | Comentario |
|------------------------------|----------:|-----------:|----------:|------------|
| **Neto compras**             | **$ 7 370 000** | **$ 5 610 000** | – $ 1 760 000 | … |
| **Crédito fiscal nacional**  | **$ 1 400 300** | **$ 1 065 900** | – $ 334 400 | … |
| **PTCF (proyección)**        | **$ 2 034 710** | **$ 2 219 662** | + $ 184 952 | … |

3️⃣ **Acciones recomendadas** – Lista de 2‑4 bullets, concretas y ejecutables.  

❗ **Restricciones**  
- No generar gráficos, diagramas ni código fuera del contexto del negocio.  
- Toda la información cuantitativa debe ir en tablas Markdown.  
- Mantener el tono profesional, accesible y empático.
- En caso de que te pidan generar un gráfico, siempre pregunta que tipo de gráfico quiere ver, dale posibles opciones en base a su negocio  
- Solo debes hablar de temas respecto al negocio, no opines de política, religión, deportes, etc, y menos aún debes decir que no puedes hacer algo, ya que para eso estas.  
4️⃣ **Feedback** (al final)  
“¿Necesitas mayor detalle en algún punto o deseas explorar otro escenario? Indícame y ajustamos el análisis.”  

5️⃣ **Confirmación previa** (opcional)  
“He recibido el contexto y los datos; ¿estoy listo para proceder con el diagnóstico solicitado?”
## Contexto
${documentContext ? `El usuario ha cargado los siguientes documentos de su empresa:\n\n${documentContext}` : "El usuario aún no ha cargado documentos. Indica que seleccione una carpeta con documentos de su empresa (PDFs, Excel, CSV) para que puedas analizar datos reales."}

Responde siempre en español. Sé profesional, directo y práctico.`;

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: cerebras("gpt-oss-120b"),
    system: systemPrompt,
    messages: modelMessages,
    tools: {
      renderChart: tool({
        description:
          "Genera un gráfico visual para presentar datos numéricos al usuario. " +
          "Usa esta herramienta cuando los datos se entiendan mejor en formato gráfico " +
          "(comparaciones, tendencias, proporciones). Siempre acompaña el gráfico con " +
          "un breve análisis textual.",
        inputSchema: z.object({
          title: z.string().describe("Título descriptivo del gráfico"),
          type: z
            .enum(["bar", "line", "pie"])
            .describe(
              "Tipo de gráfico: bar para comparaciones, line para tendencias temporales, pie para proporciones",
            ),
          xAxisLabel: z.string().optional().describe("Etiqueta del eje X (no aplica para pie)"),
          yAxisLabel: z.string().optional().describe("Etiqueta del eje Y (no aplica para pie)"),
          data: z
            .array(
              z.object({
                label: z.string().describe("Etiqueta del punto de datos (ej: 'Enero', 'Ventas')"),
                value: z.number().describe("Valor numérico principal"),
                value2: z
                  .number()
                  .optional()
                  .describe("Segundo valor para comparación (opcional)"),
              }),
            )
            .describe("Array de datos a graficar"),
          legend: z
            .array(z.string())
            .optional()
            .describe("Leyendas para las series de datos: [serie1, serie2]"),
        }),
        execute: async (input) => {
          // El gráfico se renderiza en el cliente; este resultado
          // se incluye en el historial para evitar MissingToolResultsError.
          return `Gráfico "${input.title}" (${input.type}) generado con ${input.data.length} puntos de datos.`;
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    onError: (error: unknown) => {
      if (error instanceof Error) {
        return error.message;
      }
      return String(error);
    },
  });
}

