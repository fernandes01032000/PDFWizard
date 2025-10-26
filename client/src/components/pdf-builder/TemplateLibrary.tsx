import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Template } from "@shared/schema";
import { Search, FileText, Calendar, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface TemplateLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (templateId: string) => void;
}

export function TemplateLibrary({
  open,
  onOpenChange,
  templates,
  onSelectTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
}: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Template Library</DialogTitle>
          <DialogDescription>
            Load a saved template or create a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-template-search"
            />
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery
                  ? "No templates match your search. Try a different query."
                  : "Create your first template by uploading a PDF and mapping fields."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="grid grid-cols-2 gap-4 pr-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-4 hover-elevate cursor-pointer transition-all"
                    onClick={() => {
                      onSelectTemplate(template);
                      onOpenChange(false);
                    }}
                    data-testid={`template-card-${template.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{template.name}</h3>
                          {template.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateTemplate(template.id);
                            }}
                            data-testid={`button-duplicate-template-${template.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTemplate(template.id);
                            }}
                            data-testid={`button-delete-template-${template.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          {template.fields.length} fields
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {template.pdfFileName}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
