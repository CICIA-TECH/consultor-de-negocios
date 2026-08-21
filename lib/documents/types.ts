export type DocumentStatus =
  | "uploading"
  | "parsing"
  | "loaded"
  | "unsupported"
  | "error";

export interface DocumentItem {
  id: string;
  name: string;
  status: DocumentStatus;
  content?: string;
  error?: string;
  storagePath?: string;
}
