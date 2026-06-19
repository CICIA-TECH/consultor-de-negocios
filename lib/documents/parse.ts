import * as XLSX from "xlsx";

const SUPPORTED_EXTENSIONS = ["pdf", "xlsx", "xls", "csv"];

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(getExtension(fileName));
}

async function parsePdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n");
}

async function parseSpreadsheet(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  return workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    return `# Hoja: ${sheetName}\n${csv}`;
  }).join("\n\n");
}

export async function parseDocument(file: File): Promise<string> {
  const extension = getExtension(file.name);

  if (extension === "pdf") {
    return parsePdf(file);
  }

  if (extension === "xlsx" || extension === "xls" || extension === "csv") {
    return parseSpreadsheet(file);
  }

  throw new Error(`Formato no soportado: .${extension}`);
}
