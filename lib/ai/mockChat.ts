import type { DocumentItem } from "@/lib/documents/types";

// TODO: reemplazar por una llamada real a un proveedor de IA (Claude u OpenAI)
// cuando se defina cuál usar. Esta función simula la respuesta para poder
// construir y probar la interfaz de chat sin esa dependencia todavía.
export async function getMockChatResponse(
  question: string,
  documents: DocumentItem[],
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const loadedDocs = documents.filter((doc) => doc.status === "loaded");

  if (loadedDocs.length === 0) {
    return "Todavía no detecto documentos cargados. Selecciona una carpeta con PDFs o archivos Excel/CSV para que pueda responder con contexto real.";
  }

  const docNames = loadedDocs.map((doc) => doc.name).join(", ");
  return `(Respuesta simulada) Basándome en ${loadedDocs.length} documento(s) cargado(s) (${docNames}), esta sería la respuesta a: "${question}". Cuando se conecte un proveedor de IA real, aquí aparecerá un análisis generado a partir del contenido de esos documentos.`;
}
