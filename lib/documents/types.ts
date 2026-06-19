export type DocumentStatus = "loaded" | "unsupported" | "error";

export interface DocumentItem {
  id: string;
  name: string;
  status: DocumentStatus;
  content?: string;
  error?: string;
}
