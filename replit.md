# PDF Form Builder

## Project Overview
A professional web application for creating editable PDF templates with visual field mapping. Users can upload PDF files, visually position and configure form fields, save templates, and generate filled PDFs with data in precise positions.

## Recent Changes
- **October 26, 2025**: Complete MVP implementation with full frontend/backend integration
  - ✅ Created comprehensive data schemas for templates and fields
  - ✅ Built dual-mode interface (Design Mode and Fill Mode)
  - ✅ Implemented visual PDF canvas with zoom, grid, and rulers
  - ✅ Created drag-and-drop field library with 7 field types
  - ✅ Built field properties panel with position, size, and validation controls
  - ✅ Implemented form builder with progress tracking
  - ✅ Added template library for saving and loading templates
  - ✅ Backend API with PDF upload, template CRUD, and PDF generation
  - ✅ Frontend-backend integration with TanStack Query
  - ✅ Undo/Redo system with 20-step history
  - ✅ Fixed critical drag/resize closure bug with useCallback
  - ✅ End-to-end testing completed successfully
  - ✅ Configured design system with Inter and JetBrains Mono fonts

## Tech Stack
**Frontend:**
- React with TypeScript
- Tailwind CSS + Shadcn UI components
- React-PDF for PDF visualization
- Wouter for routing
- TanStack Query for data fetching
- Zod for validation

**Backend:**
- Express.js
- PDF-lib for PDF manipulation
- Multer for file uploads
- In-memory storage (MemStorage)

## Project Architecture

### Data Model
- **Template**: Contains PDF metadata, field configurations, and timestamps
  - id: string (nanoid)
  - name: string (required)
  - pdfUrl: string (required)
  - fields: Field[] (default empty)

- **Field**: Individual form field with position, dimensions, type, and validation rules
  - id: string (nanoid)
  - name: string (required)
  - type: enum (7 types)
  - x, y: number (position in pixels)
  - width, height: number (dimensions in pixels)
  - fontSize: number (8-72, default 12)
  - required: boolean
  - placeholder, defaultValue: optional strings
  - options: string[] (for dropdown/radio)
  - validation: optional rules (pattern, min/max length/value)

- **Field Types**: text, textarea, checkbox, radio, dropdown, date, signature

### Application Modes
1. **Design Mode**: Upload PDF, map fields visually, configure properties, save templates
   - FieldLibraryPanel with 7 draggable field types
   - PDFCanvas with drag/resize functionality
   - FieldPropertiesPanel for detailed configuration
   - CanvasToolbar with zoom (50%-150%), grid, rulers
   - ActionBar with save, undo/redo, delete actions

2. **Fill Mode**: Load template, fill form fields, generate completed PDF
   - Template selector
   - Dynamic FormBuilderPanel with progress indicator
   - Generate PDF button with download

### Key Features
- Visual drag-and-drop field positioning on PDF canvas
- Resize handles on selected fields (8 directions)
- Precise field configuration (position, size, font, validation)
- Template library for reusable forms
- Real-time progress tracking in fill mode
- Zoom controls (50% - 150%)
- Grid overlay and rulers for precise alignment
- Undo/Redo: 20-step history with Ctrl+Z/Ctrl+Y
- Keyboard shortcuts: Delete key removes selected field
- Auto-save with toast notifications
- Dark/light theme support
- Error handling with toast feedback

## API Endpoints
- POST /api/upload-pdf - Upload PDF file with multer
- POST /api/templates - Create new template
- GET /api/templates - List all templates
- GET /api/templates/:id - Get single template
- PUT /api/templates/:id - Update template
- DELETE /api/templates/:id - Delete template
- POST /api/templates/:id/fields - Add field to template
- PUT /api/templates/:id/fields/:fieldId - Update field
- DELETE /api/templates/:id/fields/:fieldId - Delete field
- POST /api/generate-pdf - Generate filled PDF with pdf-lib

## File Structure
```
client/src/
├── pages/
│   └── pdf-builder.tsx          # Main application page with dual-mode logic
├── components/
│   ├── pdf-builder/
│   │   ├── TopNavigation.tsx    # Header with mode switcher and theme toggle
│   │   ├── FieldLibraryPanel.tsx # Draggable field types with search
│   │   ├── FieldPropertiesPanel.tsx # Field configuration form
│   │   ├── PDFCanvas.tsx        # PDF viewer with field overlays
│   │   ├── FieldOverlay.tsx     # Individual draggable/resizable field
│   │   ├── CanvasToolbar.tsx    # Zoom and view controls
│   │   ├── FormBuilderPanel.tsx # Form filling interface
│   │   ├── UploadPDFDialog.tsx  # PDF upload modal with drag-drop
│   │   ├── TemplateLibrary.tsx  # Template management modal
│   │   └── ActionBar.tsx        # Bottom action buttons
│   └── ui/                      # Shadcn components
shared/
└── schema.ts                    # Data models and Zod validation
server/
├── routes.ts                    # API endpoints with validation
├── storage.ts                   # In-memory storage interface
└── index.ts                     # Express server setup
```

## Development Status
- ✅ Frontend: Complete with all UI components
- ✅ Backend: Complete with all API routes
- ✅ Integration: Complete with TanStack Query
- ✅ Testing: E2E tests passed successfully

## Known Limitations
- Uses in-memory storage (data resets on server restart)
- PDF upload requires actual PDF files (cannot generate sample PDFs)
- Field icons may load slowly initially
- Drag/drop interactions require PDF loaded on canvas

## Design Guidelines
Following Material Design + Linear-inspired productivity aesthetics with emphasis on:
- Clarity and visual feedback
- Consistent spacing (8px, 16px, 24px, 32px)
- Professional typography (Inter, JetBrains Mono)
- Accessible interactions with keyboard support
- Three-level text color hierarchy (default, secondary, tertiary)
- Subtle hover elevations with hover-elevate class
- Primary color: Blue (#2563eb / hsl(217, 91%, 60%))
- Responsive layout for desktop, tablet, and mobile

## User Preferences
- Language: Portuguese (original request)
- Storage: In-memory (MemStorage) preferred over database
- Design: Material Design + Linear aesthetics
- Focus: Exceptional visual quality and professional productivity UX
