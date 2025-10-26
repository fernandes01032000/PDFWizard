import { Button } from "@/components/ui/button";
import { Save, Eye, Download, RotateCcw, Upload } from "lucide-react";

interface ActionBarProps {
  mode: "design" | "fill";
  canSave: boolean;
  canGenerate: boolean;
  onSave?: () => void;
  onPreview?: () => void;
  onGenerate?: () => void;
  onReset?: () => void;
  onUpload?: () => void;
}

export function ActionBar({
  mode,
  canSave,
  canGenerate,
  onSave,
  onPreview,
  onGenerate,
  onReset,
  onUpload,
}: ActionBarProps) {
  if (mode === "design") {
    return (
      <div className="h-20 border-t bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onUpload}
            data-testid="button-upload-pdf"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPreview}
            disabled={!canSave}
            data-testid="button-preview-form"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Form
          </Button>
          <Button
            onClick={onSave}
            disabled={!canSave}
            data-testid="button-save-template"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-20 border-t bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onReset}
          data-testid="button-reset-form"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          size="lg"
          data-testid="button-generate-pdf"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate PDF
        </Button>
      </div>
    </div>
  );
}
