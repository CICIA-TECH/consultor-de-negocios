import { createClient } from "@/lib/supabase/server";
import { parseDocument } from "@/lib/documents/parse";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("No autorizado", { status: 401 });
  }

  const { documentId } = await req.json();

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("id, storage_path, file_name")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    return new Response("Documento no encontrado", { status: 404 });
  }

  await supabase
    .from("documents")
    .update({ status: "parsing" })
    .eq("id", documentId);

  const { data: blob, error: downloadError } = await supabase.storage
    .from("documents")
    .download(doc.storage_path);

  if (downloadError || !blob) {
    await supabase
      .from("documents")
      .update({ status: "error", error_message: "No se pudo descargar el archivo" })
      .eq("id", documentId);
    return new Response("No se pudo descargar el archivo", { status: 500 });
  }

  try {
    const file = new File([blob], doc.file_name, { type: blob.type });
    const content = await parseDocument(file);

    await supabase
      .from("documents")
      .update({ status: "loaded", content, error_message: null })
      .eq("id", documentId);

    return Response.json({ status: "loaded" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    await supabase
      .from("documents")
      .update({ status: "error", error_message: message })
      .eq("id", documentId);
    return new Response(message, { status: 500 });
  }
}
