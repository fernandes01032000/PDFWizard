import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopNavigation } from "@/components/pdf-builder/TopNavigation";
import { FieldLibraryPanel } from "@/components/pdf-builder/FieldLibraryPanel";
import { FieldPropertiesPanel } from "@/components/pdf-builder/FieldPropertiesPanel";
import { PDFCanvas } from "@/components/pdf-builder/PDFCanvas";
import { CanvasToolbar } from "@/components/pdf-builder/CanvasToolbar";
import { FormBuilderPanel } from "@/components/pdf-builder/FormBuilderPanel";
import { UploadPDFDialog } from "@/components/pdf-builder/UploadPDFDialog";
import { TemplateLibrary } from "@/components/pdf-builder/TemplateLibrary";
import { ActionBar } from "@/components/pdf-builder/ActionBar";
import { Field, FieldType, Template, TemplateFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { saveAs } from "file-saver";

type Mode = "design" | "fill";

interface UndoState {
  fields: Field[];
  selectedFieldId: string | null;
}

export default function PDFBuilder() {
  const { toast } = useToast();
  
  // UI State
  const [currentMode, setCurrentMode] = useState<Mode>("design");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  
  // Canvas State
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  
  // Data State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({});

  // Undo/Redo State
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoState[]>([]);

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  // Upload PDF mutation
  const uploadPDFMutation = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('name', name);
      formData.append('description', '');

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      return response.json();
    },
    onSuccess: (template: Template) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setCurrentTemplate(template);
      setPdfUrl(`/api/templates/${template.id}/pdf`);
      
      toast({
        title: "PDF Uploaded",
        description: `${template.name} is ready for field mapping`,
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload PDF file",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Field[] }) => {
      const template = await apiRequest<Template>(
        'GET',
        `/api/templates/${id}`
      );

      const updatedTemplate = { ...template, fields };
      
      return apiRequest<Template>(
        'PUT',
        `/api/templates/${id}`,
        updatedTemplate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      toast({
        title: "Template Saved",
        description: "Your template has been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save template",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      toast({
        title: "Template Deleted",
        description: "Template has been removed",
      });
    },
  });

  // Generate PDF mutation
  const generatePDFMutation = useMutation({
    mutationFn: async ({ templateId, formData }: { templateId: string; formData: TemplateFormData }) => {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId, formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      return response.blob();
    },
    onSuccess: (blob, variables) => {
      const template = templates.find(t => t.id === variables.templateId);
      const filename = template ? `filled_${template.pdfFileName}` : 'filled_form.pdf';
      saveAs(blob, filename);
      
      toast({
        title: "PDF Generated",
        description: "Your filled PDF is ready for download",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    },
  });

  // Save current state to undo stack
  const saveToUndoStack = () => {
    const state: UndoState = {
      fields: JSON.parse(JSON.stringify(fields)),
      selectedFieldId,
    };
    
    setUndoStack(prev => [...prev.slice(-19), state]);
    setRedoStack([]);
  };

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' && selectedFieldId) {
        e.preventDefault();
        handleFieldDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fields, selectedFieldId, undoStack, redoStack]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    const currentState: UndoState = {
      fields: JSON.parse(JSON.stringify(fields)),
      selectedFieldId,
    };

    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    setFields(previousState.fields);
    setSelectedFieldId(previousState.selectedFieldId);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const currentState: UndoState = {
      fields: JSON.parse(JSON.stringify(fields)),
      selectedFieldId,
    };

    setUndoStack(prev => [...prev, currentState]);
    setRedoStack(prev => prev.slice(0, -1));
    setFields(nextState.fields);
    setSelectedFieldId(nextState.selectedFieldId);
  };

  const handleFileSelected = async (file: File) => {
    const name = file.name.replace('.pdf', '');
    setPdfFile(file);
    
    uploadPDFMutation.mutate({ file, name });
  };

  const handleFieldDragStart = (type: FieldType) => {
    window.dispatchEvent(new CustomEvent('field-drag-start', { detail: { type } }));
  };

  const handleFieldDrop = (type: FieldType, x: number, y: number) => {
    saveToUndoStack();

    const newField: Field = {
      id: nanoid(),
      name: `${type}_field_${fields.length + 1}`,
      type,
      x: Math.round(x),
      y: Math.round(y),
      width: type === "checkbox" ? 20 : 150,
      height: type === "textarea" ? 80 : type === "checkbox" ? 20 : 30,
      fontSize: 12,
      required: false,
    };

    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);

    toast({
      title: "Field Added",
      description: `${type} field added to canvas`,
    });
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<Field>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const handleFieldDelete = () => {
    if (!selectedFieldId) return;
    
    saveToUndoStack();
    setFields(fields.filter(f => f.id !== selectedFieldId));
    setSelectedFieldId(null);

    toast({
      title: "Field Deleted",
      description: "Field removed from canvas",
    });
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate) {
      toast({
        title: "Cannot Save",
        description: "Please upload a PDF first",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Cannot Save",
        description: "Please add at least one field",
        variant: "destructive",
      });
      return;
    }

    updateTemplateMutation.mutate({ id: currentTemplate.id, fields });
  };

  const handleLoadTemplate = async (template: Template) => {
    setCurrentTemplate(template);
    setFields(template.fields);
    setFormData({});
    setSelectedFieldId(null);
    setPdfUrl(`/api/templates/${template.id}/pdf`);
    setUndoStack([]);
    setRedoStack([]);

    toast({
      title: "Template Loaded",
      description: `"${template.name}" is ready to use`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (currentTemplate?.id === templateId) {
      setCurrentTemplate(null);
      setPdfUrl(null);
      setFields([]);
      setFormData({});
    }
    
    deleteTemplateMutation.mutate(templateId);
  };

  const handlePreviewForm = () => {
    if (fields.length === 0) {
      toast({
        title: "No Fields",
        description: "Add fields to the template before previewing",
        variant: "destructive",
      });
      return;
    }

    setCurrentMode("fill");
    setFormData({});
  };

  const handleResetForm = () => {
    setFormData({});
    toast({
      title: "Form Reset",
      description: "All form data has been cleared",
    });
  };

  const handleGeneratePDF = async () => {
    if (!currentTemplate) {
      toast({
        title: "No Template",
        description: "Please load a template first",
        variant: "destructive",
      });
      return;
    }

    generatePDFMutation.mutate({
      templateId: currentTemplate.id,
      formData,
    });
  };

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;
  const requiredFieldsFilled = fields
    .filter(f => f.required)
    .every(f => formData[f.id]);

  return (
    <div className="h-screen flex flex-col">
      <TopNavigation
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onOpenTemplates={() => setShowTemplateLibrary(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 border-r bg-card flex flex-col">
          {currentMode === "design" ? (
            selectedFieldId ? (
              <FieldPropertiesPanel
                field={selectedField}
                onFieldUpdate={(updates) => handleFieldUpdate(selectedFieldId, updates)}
                onFieldDelete={handleFieldDelete}
              />
            ) : (
              <FieldLibraryPanel onFieldDragStart={handleFieldDragStart} />
            )
          ) : (
            <FormBuilderPanel
              fields={fields}
              formData={formData}
              onFormDataChange={setFormData}
            />
          )}
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col">
          <CanvasToolbar
            zoom={zoom}
            showGrid={showGrid}
            showRulers={showRulers}
            onZoomChange={setZoom}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleRulers={() => setShowRulers(!showRulers)}
          />
          
          <div className="flex-1 overflow-hidden">
            <PDFCanvas
              pdfUrl={pdfUrl}
              fields={fields}
              selectedFieldId={selectedFieldId}
              showGrid={showGrid}
              showRulers={showRulers}
              zoom={zoom}
              onFieldSelect={setSelectedFieldId}
              onFieldUpdate={handleFieldUpdate}
              onFieldDrop={handleFieldDrop}
            />
          </div>
        </main>
      </div>

      <ActionBar
        mode={currentMode}
        canSave={!!currentTemplate && fields.length > 0}
        canGenerate={fields.length > 0 && requiredFieldsFilled && !generatePDFMutation.isPending}
        onSave={handleSaveTemplate}
        onPreview={handlePreviewForm}
        onGenerate={handleGeneratePDF}
        onReset={handleResetForm}
        onUpload={() => setShowUploadDialog(true)}
      />

      <UploadPDFDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onFileSelected={handleFileSelected}
      />

      <TemplateLibrary
        open={showTemplateLibrary}
        onOpenChange={setShowTemplateLibrary}
        templates={templates}
        onSelectTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </div>
  );
}
