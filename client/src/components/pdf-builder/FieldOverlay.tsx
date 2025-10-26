import { Field } from "@shared/schema";
import { useState, useRef, useEffect, useCallback } from "react";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldOverlayProps {
  field: Field;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<Field>) => void;
}

export function FieldOverlay({ field, isSelected, zoom, onSelect, onUpdate }: FieldOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX / zoom - field.x,
      y: e.clientY / zoom - field.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newX = e.clientX / zoom - dragStart.x;
    const newY = e.clientY / zoom - dragStart.y;
    onUpdate({ x: Math.max(0, newX), y: Math.max(0, newY) });
  }, [zoom, dragStart.x, dragStart.y, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = field.width;
    const startHeight = field.height;
    const startPosX = field.x;
    const startPosY = field.y;

    const handleResizeMove = (moveE: MouseEvent) => {
      const deltaX = (moveE.clientX - startX) / zoom;
      const deltaY = (moveE.clientY - startY) / zoom;

      if (direction.includes('e')) {
        onUpdate({ width: Math.max(10, startWidth + deltaX) });
      }
      if (direction.includes('s')) {
        onUpdate({ height: Math.max(10, startHeight + deltaY) });
      }
      if (direction.includes('w')) {
        const newWidth = Math.max(10, startWidth - deltaX);
        const newX = startPosX + (startWidth - newWidth);
        onUpdate({ width: newWidth, x: Math.max(0, newX) });
      }
      if (direction.includes('n')) {
        const newHeight = Math.max(10, startHeight - deltaY);
        const newY = startPosY + (startHeight - newHeight);
        onUpdate({ height: newHeight, y: Math.max(0, newY) });
      }
    };

    const handleResizeUp = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={overlayRef}
      className={`absolute border-2 rounded transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-primary/40 bg-primary/5 hover:border-primary/60'
      }`}
      style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      data-testid={`field-overlay-${field.id}`}
    >
      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripVertical className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{field.name}</span>
        </div>
        <span className="text-xs opacity-70 flex-shrink-0">{field.type}</span>
      </div>

      {isSelected && (
        <>
          {/* Resize handles */}
          <div
            className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-primary-foreground rounded-full cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
        </>
      )}
    </div>
  );
}
