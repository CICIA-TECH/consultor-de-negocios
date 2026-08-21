const SUPPORTED_EXTENSIONS = ["pdf", "xlsx", "xls", "csv"];

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(getExtension(fileName));
}
