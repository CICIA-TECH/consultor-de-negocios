import * as XLSX from "xlsx";

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function parsePdf(file: File): Promise<string> {
  // Build "legacy" (Node-compatible): sin worker real, corre en el mismo
  // proceso. Este módulo corre server-side (API route), no en el navegador.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const path = await import("path");

  // process.cwd() (no import.meta.url) porque Next.js/Turbopack reubica este
  // archivo al bundlear la API route — un path relativo al source no
  // sobrevive eso.
  //
  // Sin standardFontDataUrl, pdf.js no encuentra las fuentes estándar
  // (Helvetica, etc.) en PDFs que no embeben su propia fuente.
  //
  // Sin workerSrc explícito, pdf.js intenta resolver su "fake worker"
  // (ejecutar el worker inline, sin thread real) con un import relativo a
  // su propio chunk bundleado, que Turbopack rompe — falla con
  // "Setting up fake worker failed: Cannot find module ...pdf.worker.mjs".
  const standardFontDataUrl =
    path.join(process.cwd(), "node_modules/pdfjs-dist/standard_fonts") + "/";
  pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  );

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    standardFontDataUrl,
  }).promise;

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
