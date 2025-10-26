import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, TemplateFormData } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface FormBuilderPanelProps {
  fields: Field[];
  formData: TemplateFormData;
  onFormDataChange: (data: TemplateFormData) => void;
}

export function FormBuilderPanel({ fields, formData, onFormDataChange }: FormBuilderPanelProps) {
  const requiredFields = fields.filter(f => f.required);
  const filledRequired = requiredFields.filter(f => formData[f.id]).length;
  const progress = requiredFields.length > 0 ? (filledRequired / requiredFields.length) * 100 : 100;

  const updateField = (fieldId: string, value: any) => {
    onFormDataChange({ ...formData, [fieldId]: value });
  };

  const renderField = (field: Field) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            data-testid={`form-field-${field.id}`}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            data-testid={`form-field-${field.id}`}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => updateField(field.id, checked)}
              data-testid={`form-field-${field.id}`}
            />
            <label htmlFor={field.id} className="text-sm cursor-pointer">
              {field.placeholder || "Check this box"}
            </label>
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-testid={`form-field-${field.id}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => updateField(field.id, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "signature":
        return (
          <div className="border-2 border-dashed rounded-md h-32 flex items-center justify-center bg-muted/30">
            <p className="text-sm text-muted-foreground">Signature field (implementation pending)</p>
          </div>
        );

      default:
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            data-testid={`form-field-${field.id}`}
          />
        );
    }
  };

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          No fields mapped yet. Switch to Design Mode to add fields.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <h2 className="text-lg font-medium">Form Fields</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <Badge variant="secondary">
              {filledRequired} / {requiredFields.length} required
            </Badge>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-form-completion" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {fields.map((field) => (
            <Card key={field.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.id} className="text-sm font-medium flex items-center gap-2">
                    {field.name}
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </Label>
                  <Badge variant="outline" className="text-xs">{field.type}</Badge>
                </div>
                {renderField(field)}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
