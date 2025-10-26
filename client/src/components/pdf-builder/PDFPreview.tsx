import { useState, useEffect, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Field, TemplateFormData } from "@shared/schema";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  pdfUrl: string | null;
  fields: Field[];
  formData: TemplateFormData;
  zoom: number;
}

export function PDFPreview({ pdfUrl, fields, formData, zoom }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);

  const onDocumentLoadSuccess = useCallback(({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageWidth(viewport.width);
    setPageHeight(viewport.height);
  }, []);

  const fieldOverlays = useMemo(() => {
    if (!pageWidth || !pageHeight) return [];

    return fields.map(field => {
      const value = formData[field.id];
      if (!value) return null;

      const scaledX = field.x * zoom;
      const scaledY = field.y * zoom;
      const scaledWidth = field.width * zoom;
      const scaledHeight = field.height * zoom;
      const scaledFontSize = field.fontSize * zoom;

      let displayValue = "";
      
      switch (field.type) {
        case "checkbox":
          displayValue = value ? "☑" : "☐";
          break;
        case "date":
          if (value) {
            try {
              displayValue = new Date(value).toLocaleDateString();
            } catch {
              displayValue = String(value);
            }
          }
          break;
        case "signature":
          if (value && typeof value === "string" && value.startsWith("data:image")) {
            displayValue = value;
          } else if (value) {
            displayValue = "✓ Signed";
          }
          break;
        default:
          displayValue = String(value);
      }

      if (!displayValue) return null;

      if (field.type === "signature" && typeof displayValue === "string" && displayValue.startsWith("data:image")) {
        return (
          <div
            key={field.id}
            className="absolute pointer-events-none overflow-hidden"
            style={{
              left: `${scaledX}px`,
              top: `${scaledY}px`,
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
            }}
            data-testid={`preview-field-${field.id}`}
          >
            <img
              src={displayValue}
              alt="Signature"
              className="w-full h-full object-contain"
            />
          </div>
        );
      }

      return (
        <div
          key={field.id}
          className="absolute pointer-events-none overflow-hidden"
          style={{
            left: `${scaledX}px`,
            top: `${scaledY}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            fontSize: `${scaledFontSize}px`,
            lineHeight: field.type === "textarea" ? "1.4" : `${scaledHeight}px`,
            fontFamily: "Inter, sans-serif",
            color: "#000000",
            whiteSpace: field.type === "textarea" ? "pre-wrap" : "nowrap",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: field.type === "textarea" ? "flex-start" : "center",
            paddingTop: field.type === "textarea" ? "4px" : "0",
            paddingLeft: "4px",
            paddingRight: "4px",
          }}
          data-testid={`preview-field-${field.id}`}
        >
          {displayValue}
        </div>
      );
    }).filter(Boolean);
  }, [fields, formData, pageWidth, pageHeight, zoom]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center space-y-2">
          <div className="p-4 bg-background rounded-full inline-block mb-2">
            <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Load a template to see preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-muted/30">
      <div className="flex items-center justify-center p-8">
        <div className="relative">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <Page
              pageNumber={1}
              scale={zoom}
              onLoadSuccess={onPageLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
              renderTextLayer={true}
              renderAnnotationLayer={false}
            />
          </Document>

          <div
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: `${pageWidth * zoom}px`,
              height: `${pageHeight * zoom}px`,
            }}
          >
            {fieldOverlays}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
