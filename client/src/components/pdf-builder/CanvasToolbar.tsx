import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  Ruler, 
  Maximize2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CanvasToolbarProps {
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  onZoomChange: (zoom: number) => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5];

export function CanvasToolbar({
  zoom,
  showGrid,
  showRulers,
  onZoomChange,
  onToggleGrid,
  onToggleRulers,
}: CanvasToolbarProps) {
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  return (
    <div className="h-12 border-b bg-card px-4 flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom === ZOOM_LEVELS[0]}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={handleZoomReset}
          className="min-w-20"
          data-testid="button-zoom-reset"
        >
          <Badge variant="secondary">{Math.round(zoom * 100)}%</Badge>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant={showGrid ? "secondary" : "ghost"}
          size="icon"
          onClick={onToggleGrid}
          data-testid="button-toggle-grid"
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={showRulers ? "secondary" : "ghost"}
          size="icon"
          onClick={onToggleRulers}
          data-testid="button-toggle-rulers"
        >
          <Ruler className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
