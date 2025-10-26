import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  Ruler, 
  Maximize2 
} from "lucide-react";
import { Field, FieldType } from "@shared/schema";
import { FieldOverlay } from "./FieldOverlay";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFCanvasProps {
  pdfUrl: string | null;
  fields: Field[];
  selectedFieldId: string | null;
  showGrid: boolean;
  showRulers: boolean;
  zoom: number;
  onFieldSelect: (fieldId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onFieldDrop: (type: FieldType, x: number, y: number) => void;
}

export function PDFCanvas({
  pdfUrl,
  fields,
  selectedFieldId,
  showGrid,
  showRulers,
  zoom,
  onFieldSelect,
  onFieldUpdate,
  onFieldDrop,
}: PDFCanvasProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedFieldType, setDraggedFieldType] = useState<FieldType | null>(null);

  useEffect(() => {
    const handleFieldDragStart = (e: CustomEvent) => {
      setDraggedFieldType(e.detail.type);
    };

    window.addEventListener('field-drag-start', handleFieldDragStart as EventListener);
    return () => {
      window.removeEventListener('field-drag-start', handleFieldDragStart as EventListener);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedFieldType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    onFieldDrop(draggedFieldType, x, y);
    setDraggedFieldType(null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/30">
        <div className="text-center max-w-md p-8">
          <div className="mb-6 inline-flex p-6 bg-muted rounded-2xl">
            <svg className="h-24 w-24 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No PDF Loaded</h3>
          <p className="text-muted-foreground">
            Upload a PDF to start mapping fields
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto bg-muted/30 relative">
        {showRulers && (
          <>
            <div className="absolute top-0 left-0 right-0 h-6 bg-background border-b flex items-center px-2 text-xs text-muted-foreground font-mono">
              {Array.from({ length: Math.ceil(pageWidth / 50) }, (_, i) => (
                <div key={i} className="absolute" style={{ left: `${i * 50 * zoom}px` }}>
                  {i * 50}
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-6 bg-background border-r flex flex-col items-center py-2 text-xs text-muted-foreground font-mono">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="absolute" style={{ top: `${i * 50 * zoom}px` }}>
                  {i * 50}
                </div>
              ))}
            </div>
          </>
        )}

        <div
          ref={canvasRef}
          className="relative inline-block"
          style={{
            marginLeft: showRulers ? '24px' : '0',
            marginTop: showRulers ? '24px' : '0',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-testid="pdf-canvas"
        >
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, hsl(var(--border)) 0px, hsl(var(--border)) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, hsl(var(--border)) 0px, hsl(var(--border)) 1px, transparent 1px, transparent 8px)',
                backgroundSize: '8px 8px',
              }}
            />
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96 w-96 bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }
          >
            <Page
              pageNumber={1}
              width={pageWidth}
              onLoadSuccess={(page) => setPageWidth(page.width)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {fields.map((field) => (
            <FieldOverlay
              key={field.id}
              field={field}
              isSelected={field.id === selectedFieldId}
              zoom={zoom}
              onSelect={() => onFieldSelect(field.id)}
              onUpdate={(updates) => onFieldUpdate(field.id, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
