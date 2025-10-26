import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field } from "@shared/schema";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FieldPropertiesPanelProps {
  field: Field | null;
  onFieldUpdate: (updates: Partial<Field>) => void;
  onFieldDelete: () => void;
}

export function FieldPropertiesPanel({ 
  field, 
  onFieldUpdate, 
  onFieldDelete 
}: FieldPropertiesPanelProps) {
  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a field to view and edit its properties
        </p>
      </div>
    );
  }

  const incrementValue = (key: keyof Field, amount: number) => {
    const currentValue = field[key] as number;
    onFieldUpdate({ [key]: Math.max(0, currentValue + amount) });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Field Properties</h2>
          <Badge variant="outline" className="mt-1">
            {field.type}
          </Badge>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={onFieldDelete}
          data-testid="button-delete-field"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Identity</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="field-name" className="text-sm font-medium">
                  Field Name
                </Label>
                <Input
                  id="field-name"
                  value={field.name}
                  onChange={(e) => onFieldUpdate({ name: e.target.value })}
                  placeholder="Enter field name"
                  className="mt-1.5"
                  data-testid="input-field-name"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Field ID</Label>
                <Input
                  value={field.id}
                  disabled
                  className="mt-1.5 font-mono text-xs"
                  data-testid="input-field-id"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Position Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Position & Size</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="field-x" className="text-sm font-medium">X Position</Label>
                <div className="flex items-center gap-1 mt-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("x", -1)}
                    data-testid="button-x-decrease"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="field-x"
                    type="number"
                    value={field.x}
                    onChange={(e) => onFieldUpdate({ x: parseFloat(e.target.value) || 0 })}
                    className="text-center"
                    data-testid="input-field-x"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("x", 1)}
                    data-testid="button-x-increase"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="field-y" className="text-sm font-medium">Y Position</Label>
                <div className="flex items-center gap-1 mt-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("y", -1)}
                    data-testid="button-y-decrease"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="field-y"
                    type="number"
                    value={field.y}
                    onChange={(e) => onFieldUpdate({ y: parseFloat(e.target.value) || 0 })}
                    className="text-center"
                    data-testid="input-field-y"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("y", 1)}
                    data-testid="button-y-increase"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="field-width" className="text-sm font-medium">Width</Label>
                <div className="flex items-center gap-1 mt-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("width", -5)}
                    data-testid="button-width-decrease"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="field-width"
                    type="number"
                    value={field.width}
                    onChange={(e) => onFieldUpdate({ width: parseFloat(e.target.value) || 10 })}
                    className="text-center"
                    data-testid="input-field-width"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("width", 5)}
                    data-testid="button-width-increase"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="field-height" className="text-sm font-medium">Height</Label>
                <div className="flex items-center gap-1 mt-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("height", -5)}
                    data-testid="button-height-decrease"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    id="field-height"
                    type="number"
                    value={field.height}
                    onChange={(e) => onFieldUpdate({ height: parseFloat(e.target.value) || 10 })}
                    className="text-center"
                    data-testid="input-field-height"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => incrementValue("height", 5)}
                    data-testid="button-height-increase"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Styling Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Styling</h3>
            <div>
              <Label htmlFor="field-font-size" className="text-sm font-medium">Font Size</Label>
              <div className="flex items-center gap-1 mt-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => incrementValue("fontSize", -1)}
                  data-testid="button-fontsize-decrease"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  id="field-font-size"
                  type="number"
                  value={field.fontSize}
                  onChange={(e) => onFieldUpdate({ fontSize: parseFloat(e.target.value) || 12 })}
                  className="text-center"
                  data-testid="input-field-fontsize"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => incrementValue("fontSize", 1)}
                  data-testid="button-fontsize-increase"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Validation Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Validation</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="field-required" className="text-sm font-medium">
                Required Field
              </Label>
              <Switch
                id="field-required"
                checked={field.required}
                onCheckedChange={(checked) => onFieldUpdate({ required: checked })}
                data-testid="switch-field-required"
              />
            </div>
            <div>
              <Label htmlFor="field-placeholder" className="text-sm font-medium">
                Placeholder
              </Label>
              <Input
                id="field-placeholder"
                value={field.placeholder || ""}
                onChange={(e) => onFieldUpdate({ placeholder: e.target.value })}
                placeholder="Enter placeholder text"
                className="mt-1.5"
                data-testid="input-field-placeholder"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
