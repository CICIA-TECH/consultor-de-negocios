import { isSupportedFile, parseDocument } from "./parse";
import type { DocumentItem } from "./types";

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

async function collectFiles(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<File[]> {
  const files: File[] = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === "file") {
      files.push(await entry.getFile());
    } else if (entry.kind === "directory") {
      files.push(...(await collectFiles(entry)));
    }
  }

  return files;
}

let nextId = 0;

export async function readDocumentsFromDirectory(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<DocumentItem[]> {
  const files = await collectFiles(directoryHandle);

  return Promise.all(
    files.map(async (file): Promise<DocumentItem> => {
      const id = `${file.name}-${nextId++}`;

      if (!isSupportedFile(file.name)) {
        return { id, name: file.name, status: "unsupported" };
      }

      try {
        const content = await parseDocument(file);
        return { id, name: file.name, status: "loaded", content };
      } catch (error) {
        return {
          id,
          name: file.name,
          status: "error",
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    }),
  );
}
