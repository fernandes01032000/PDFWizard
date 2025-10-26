import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Type, 
  AlignLeft, 
  CheckSquare, 
  Circle, 
  ChevronDown, 
  Calendar, 
  PenTool,
  Image,
  Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FieldType } from "@shared/schema";
import { useState } from "react";

interface FieldTypeInfo {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const fieldTypes: FieldTypeInfo[] = [
  { 
    type: "text", 
    label: "Text Input", 
    icon: <Type className="h-5 w-5" />,
    description: "Single line text field"
  },
  { 
    type: "textarea", 
    label: "Text Area", 
    icon: <AlignLeft className="h-5 w-5" />,
    description: "Multi-line text area"
  },
  { 
    type: "checkbox", 
    label: "Checkbox", 
    icon: <CheckSquare className="h-5 w-5" />,
    description: "Boolean checkbox field"
  },
  { 
    type: "radio", 
    label: "Radio Group", 
    icon: <Circle className="h-5 w-5" />,
    description: "Single choice options"
  },
  { 
    type: "dropdown", 
    label: "Dropdown", 
    icon: <ChevronDown className="h-5 w-5" />,
    description: "Dropdown select menu"
  },
  { 
    type: "date", 
    label: "Date Picker", 
    icon: <Calendar className="h-5 w-5" />,
    description: "Date selection field"
  },
  { 
    type: "signature", 
    label: "Signature", 
    icon: <PenTool className="h-5 w-5" />,
    description: "Digital signature pad"
  },
  { 
    type: "image", 
    label: "Image", 
    icon: <Image className="h-5 w-5" />,
    description: "Upload and display image"
  },
];

interface FieldLibraryPanelProps {
  onFieldDragStart: (type: FieldType) => void;
}

export function FieldLibraryPanel({ onFieldDragStart }: FieldLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFields = fieldTypes.filter(field => 
    field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium mb-4">Field Library</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search field types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
            data-testid="input-field-search"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredFields.map((field) => (
            <Card
              key={field.type}
              draggable
              onDragStart={() => onFieldDragStart(field.type)}
              className="p-4 cursor-move hover-elevate active-elevate-2 transition-all"
              data-testid={`field-type-${field.type}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                  {field.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium">{field.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {field.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
