import { createClient } from "@/lib/supabase/client";
import { isSupportedFile } from "./supportedFiles";
import type { DocumentItem } from "./types";

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, file_name, status, content, error_message, storage_path")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.file_name,
    status: row.status as DocumentItem["status"],
    content: row.content ?? undefined,
    error: row.error_message ?? undefined,
    storagePath: row.storage_path,
  }));
}

export async function uploadDocument(
  file: File,
  onUpdate: (doc: DocumentItem) => void,
): Promise<void> {
  const supabase = createClient();

  if (!isSupportedFile(file.name)) {
    onUpdate({ id: `unsupported-${file.name}`, name: file.name, status: "unsupported" });
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Un solo id generado acá, usado de punta a punta (path en Storage, fila
  // en `documents`, y como key de React) para que cada actualización de
  // estado reemplace la misma fila en vez de crear una nueva.
  const documentId = crypto.randomUUID();
  const storagePath = `${user.id}/${documentId}-${file.name}`;

  onUpdate({ id: documentId, name: file.name, status: "uploading", storagePath });

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);

  if (uploadError) {
    onUpdate({
      id: documentId,
      name: file.name,
      status: "error",
      error: uploadError.message,
      storagePath,
    });
    return;
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: user.id,
    storage_path: storagePath,
    file_name: file.name,
    size_bytes: file.size,
  });

  if (insertError) {
    onUpdate({
      id: documentId,
      name: file.name,
      status: "error",
      error: insertError.message,
      storagePath,
    });
    return;
  }

  onUpdate({ id: documentId, name: file.name, status: "parsing", storagePath });

  try {
    const res = await fetch("/api/documents/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });

    if (!res.ok) {
      const message = await res.text();
      onUpdate({ id: documentId, name: file.name, status: "error", error: message, storagePath });
      return;
    }

    const { data: updated } = await supabase
      .from("documents")
      .select("content")
      .eq("id", documentId)
      .single();

    onUpdate({
      id: documentId,
      name: file.name,
      status: "loaded",
      content: updated?.content ?? undefined,
      storagePath,
    });
  } catch (error) {
    onUpdate({
      id: documentId,
      name: file.name,
      status: "error",
      error: error instanceof Error ? error.message : "Error desconocido",
      storagePath,
    });
  }
}

export async function deleteDocument(doc: DocumentItem): Promise<void> {
  const supabase = createClient();

  if (doc.storagePath) {
    await supabase.storage.from("documents").remove([doc.storagePath]);
  }
  await supabase.from("documents").delete().eq("id", doc.id);
}
