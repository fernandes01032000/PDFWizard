# PDF Form Builder

## Project Overview
A professional web application for creating editable PDF templates with visual field mapping. Users can upload PDF files, visually position and configure form fields, save templates, and generate filled PDFs with data in precise positions.

## Recent Changes
- **October 26, 2025**: Initial project setup with complete frontend implementation
  - Created comprehensive data schemas for templates and fields
  - Built dual-mode interface (Design Mode and Fill Mode)
  - Implemented visual PDF canvas with zoom, grid, and rulers
  - Created drag-and-drop field library with 7 field types
  - Built field properties panel with position, size, and validation controls
  - Implemented form builder with progress tracking
  - Added template library for saving and loading templates
  - Configured design system with Inter and JetBrains Mono fonts

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
- **Field**: Individual form field with position, dimensions, type, and validation rules
- **Field Types**: text, textarea, checkbox, radio, dropdown, date, signature

### Application Modes
1. **Design Mode**: Upload PDF, map fields visually, configure properties, save templates
2. **Fill Mode**: Load template, fill form fields, generate completed PDF

### Key Features
- Visual drag-and-drop field positioning on PDF canvas
- Precise field configuration (position, size, font, validation)
- Template library for reusable forms
- Real-time progress tracking in fill mode
- Zoom controls (50% - 150%)
- Grid overlay and rulers for precise alignment
- Dark/light theme support

## File Structure
```
client/src/
├── pages/
│   └── pdf-builder.tsx          # Main application page
├── components/
│   ├── pdf-builder/
│   │   ├── TopNavigation.tsx    # Header with mode switcher
│   │   ├── FieldLibraryPanel.tsx # Draggable field types
│   │   ├── FieldPropertiesPanel.tsx # Field configuration
│   │   ├── PDFCanvas.tsx        # PDF viewer with overlays
│   │   ├── FieldOverlay.tsx     # Individual field on canvas
│   │   ├── CanvasToolbar.tsx    # Zoom and view controls
│   │   ├── FormBuilderPanel.tsx # Form filling interface
│   │   ├── UploadPDFDialog.tsx  # PDF upload modal
│   │   ├── TemplateLibrary.tsx  # Template management
│   │   └── ActionBar.tsx        # Bottom action buttons
│   └── ui/                      # Shadcn components
shared/
└── schema.ts                    # Data models and validation
server/
├── routes.ts                    # API endpoints
└── storage.ts                   # Data persistence
```

## Development Status
- ✅ Frontend: Complete with all UI components
- ⏳ Backend: In progress
- ⏳ Integration: Pending

## Next Steps
1. Implement backend API routes for templates and PDF generation
2. Connect frontend to backend with TanStack Query
3. Implement PDF generation with pdf-lib
4. Add end-to-end testing

## Design Guidelines
Following Material Design + Linear-inspired productivity aesthetics with emphasis on:
- Clarity and visual feedback
- Consistent spacing (8px, 16px, 24px, 32px)
- Professional typography (Inter, JetBrains Mono)
- Accessible interactions with keyboard support
- Responsive layout for desktop, tablet, and mobile
