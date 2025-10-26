# PDF Form Builder

## Project Overview
A professional web application for creating editable PDF templates with visual field mapping. Users can upload PDF files, visually position and configure form fields, save templates, and generate filled PDFs with data in precise positions.

## Recent Changes
- **October 26, 2025**: Major enhancements - PostgreSQL migration, template duplication, real-time preview
  - ✅ **PostgreSQL Migration**: Migrated from in-memory to persistent PostgreSQL storage with Drizzle ORM
    - Configured Neon database with proper schemas for templates and fields
    - Implemented secure scoped queries preventing cross-template mutations
    - Added cascade deletes for referential integrity
    - All CRUD operations working with persistent storage
  - ✅ **Template Duplication**: Deep copy feature for templates
    - Added "Duplicate" button in TemplateLibrary
    - POST /api/templates/:id/duplicate endpoint
    - Copies template with new ID, all fields with new IDs, and PDF file
    - Appends "(Copy)" to duplicated template name
  - ✅ **Real-time PDF Preview in Fill Mode**: Live preview as users type
    - Created PDFPreview component with react-pdf rendering
    - Shows form data overlaid on PDF in real-time (no debounce)
    - Supports all field types: text, textarea, checkbox, date, signature (data URLs)
    - Proper positioning and scaling with zoom support
    - Clean dual-panel layout: FormBuilderPanel (left) + PDFPreview (right)
  - ✅ **Image Field Type**: Added 8th field type with upload endpoint (UI pending)
  - ✅ End-to-end testing passed for all new features

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
- PostgreSQL (Neon) with Drizzle ORM
- PDF-lib for PDF manipulation
- Multer for file uploads
- Dual storage: DBStorage (PostgreSQL) + MemStorage (fallback)

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

- **Field Types**: text, textarea, checkbox, radio, dropdown, date, signature, image (8 types total)

### Application Modes
1. **Design Mode**: Upload PDF, map fields visually, configure properties, save templates
   - FieldLibraryPanel with 7 draggable field types
   - PDFCanvas with drag/resize functionality
   - FieldPropertiesPanel for detailed configuration
   - CanvasToolbar with zoom (50%-150%), grid, rulers
   - ActionBar with save, undo/redo, delete actions

2. **Fill Mode**: Load template, fill form fields, see live preview, generate completed PDF
   - Template selector with duplicate functionality
   - Dynamic FormBuilderPanel with progress indicator (left panel)
   - Real-time PDFPreview showing filled data overlaid on PDF (right panel)
   - Instant visual feedback as user types
   - Generate PDF button with download

### Key Features
- Visual drag-and-drop field positioning on PDF canvas
- Resize handles on selected fields (8 directions)
- Precise field configuration (position, size, font, validation)
- Template library with search, duplicate, and delete functions
- **Real-time PDF preview in Fill Mode** - see data overlaid as you type
- Real-time progress tracking in fill mode
- Zoom controls (50% - 150%)
- Grid overlay and rulers for precise alignment
- Undo/Redo: 20-step history with Ctrl+Z/Ctrl+Y
- Keyboard shortcuts: Delete key removes selected field
- **PostgreSQL persistent storage** - data survives server restarts
- Auto-save with toast notifications
- Dark/light theme support
- Error handling with toast feedback

## API Endpoints
- POST /api/upload-pdf - Upload PDF file with multer
- POST /api/upload-image - Upload image file for image fields
- POST /api/templates - Create new template
- GET /api/templates - List all templates
- GET /api/templates/:id - Get single template
- GET /api/templates/:id/pdf - Get PDF file for preview
- PUT /api/templates/:id - Update template
- DELETE /api/templates/:id - Delete template
- **POST /api/templates/:id/duplicate** - Duplicate template with all fields
- POST /api/templates/:id/fields - Add field to template
- PUT /api/templates/:id/fields/:fieldId - Update field (scoped by templateId)
- DELETE /api/templates/:id/fields/:fieldId - Delete field (scoped by templateId)
- POST /api/generate-pdf - Generate filled PDF with pdf-lib

## File Structure
```
client/src/
├── pages/
│   └── pdf-builder.tsx          # Main application page with dual-mode logic
├── components/
│   ├── pdf-builder/
│   │   ├── TopNavigation.tsx    # Header with mode switcher and theme toggle
│   │   ├── FieldLibraryPanel.tsx # Draggable field types with search (8 types)
│   │   ├── FieldPropertiesPanel.tsx # Field configuration form
│   │   ├── PDFCanvas.tsx        # PDF viewer with field overlays (Design Mode)
│   │   ├── **PDFPreview.tsx**   # Real-time preview with data overlays (Fill Mode)
│   │   ├── FieldOverlay.tsx     # Individual draggable/resizable field
│   │   ├── CanvasToolbar.tsx    # Zoom and view controls
│   │   ├── FormBuilderPanel.tsx # Form filling interface
│   │   ├── UploadPDFDialog.tsx  # PDF upload modal with drag-drop
│   │   ├── TemplateLibrary.tsx  # Template management with duplicate/delete
│   │   └── ActionBar.tsx        # Bottom action buttons
│   └── ui/                      # Shadcn components
shared/
└── schema.ts                    # Data models and Zod validation
server/
├── db.ts                        # Drizzle database connection (Neon PostgreSQL)
├── routes.ts                    # API endpoints with validation
├── storage.ts                   # DBStorage (PostgreSQL) + MemStorage (fallback)
└── index.ts                     # Express server setup
drizzle.config.ts                # Drizzle ORM configuration
```

## Development Status
- ✅ Frontend: Complete with all UI components
- ✅ Backend: Complete with all API routes
- ✅ Integration: Complete with TanStack Query
- ✅ Testing: E2E tests passed successfully

## Known Limitations
- PDF upload requires actual PDF files (cannot generate sample PDFs)
- Field icons may load slowly initially
- Drag/drop interactions require PDF loaded on canvas
- Signature capture UI pending (infrastructure ready for data URLs)
- Image field upload UI pending (backend endpoint ready)
- Preview only shows first page of multi-page PDFs

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
- Storage: **PostgreSQL (persistent storage)** - migrated from in-memory
- Design: Material Design + Linear aesthetics
- Focus: Exceptional visual quality and professional productivity UX

## Future Enhancements (Not Currently Implemented)
- Signature capture UI with canvas drawing
- Image field upload interface in FieldPropertiesPanel
- Multi-page PDF preview and field mapping
- Export/import template definitions (JSON)
- Collaborative editing with real-time sync
- Advanced validation rules (regex, custom functions)
- Field dependencies and conditional visibility
- PDF form field auto-detection (OCR)
