// This is a type definition file for the pdf-parse library.

declare module 'pdf-parse/lib/pdf-parse.js' {
  import { PDFParseOptions, PDFParseResult } from 'pdf-parse';

  function pdfParse(dataBuffer: Buffer | Blob, options?: PDFParseOptions): Promise<PDFParseResult>;
  export = pdfParse;
}
