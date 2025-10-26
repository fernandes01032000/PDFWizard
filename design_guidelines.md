# Design Guidelines: Sistema de Geração de PDFs Editáveis

## Design Approach

**Selected Approach:** Design System (Material Design + Linear-inspired productivity aesthetics)

**Justification:** This is a utility-focused productivity tool requiring clarity, efficiency, and learnable interactions. The dual-phase workflow (Design/Use) demands consistent, professional UI patterns optimized for complex document manipulation.

**Key Design Principles:**
- **Clarity First:** Every interaction must be immediately understandable
- **Progressive Disclosure:** Reveal complexity only when needed
- **Visual Feedback:** Constant confirmation of user actions
- **Spatial Organization:** Clear separation between workflow phases

---

## Typography System

**Primary Font:** Inter (Google Fonts) - exceptional legibility for UI text
**Monospace Font:** JetBrains Mono - for field names and technical identifiers

**Hierarchy:**
- **Page Titles:** text-3xl font-semibold (30px)
- **Section Headers:** text-xl font-semibold (20px)
- **Panel Titles:** text-lg font-medium (18px)
- **Body Text:** text-base font-normal (16px)
- **Labels:** text-sm font-medium (14px)
- **Helper Text:** text-xs font-normal (12px)
- **Field Identifiers:** text-sm font-mono (14px monospace)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (8px, 16px, 24px, 32px)

**Application Structure:**
- **Top Navigation Bar:** h-16 with logo, phase indicator, action buttons
- **Dual Panel Layout:** Split-screen approach with 40/60 or 50/50 ratio
- **Left Panel (Controls):** Toolbars, field libraries, form builders
- **Right Panel (Canvas):** PDF preview, field positioning, live preview
- **Bottom Action Bar:** h-20 for primary workflow actions

**Container Constraints:**
- Main workspace: max-w-full with internal padding p-6
- Side panels: min-w-80 max-w-96 with p-4
- Modal dialogs: max-w-2xl with p-6
- Form sections: space-y-6 for vertical rhythm

---

## Component Library

### Core Components

**1. Phase Switcher (Top Navigation)**
- Horizontal stepper showing "Design Mode" / "Fill Mode"
- Active phase emphasized with underline indicator
- Click to switch between modes with confirmation dialog

**2. PDF Canvas (Right Panel)**
- Full-height scrollable viewport
- PDF rendered at actual size with zoom controls (50%, 75%, 100%, 125%, 150%)
- Grid overlay toggle (shows 8px grid for precise alignment)
- Rulers on top and left edges showing measurements
- Field overlays rendered as semi-transparent boxes with labels

**3. Field Library Panel (Left - Design Mode)**
- Categorized field types in expandable sections:
  - Text Input (single line)
  - Text Area (multi-line)
  - Checkbox
  - Radio Group
  - Dropdown Select
  - Date Picker
  - Signature
- Each field type shown as drag-and-drop card with icon + label
- Search/filter bar at top (h-10)

**4. Field Properties Panel (Left - After Selection)**
- Stacked form layout with sections:
  - **Field Identity:** Name (required), ID (auto-generated, editable)
  - **Position:** X, Y coordinates with unit selector (px/mm)
  - **Dimensions:** Width, Height with unit selector
  - **Validation:** Required toggle, format constraints, character limits
  - **Styling:** Font size, alignment options
- Each section separated by space-y-4
- Numeric inputs with increment/decrement buttons

**5. Form Builder Panel (Left - Fill Mode)**
- Vertical list of all mapped fields grouped by category
- Each field rendered with appropriate input component
- Real-time validation indicators
- Progress indicator showing completion percentage
- Sticky action buttons at bottom

**6. Field Overlay Cards (On Canvas)**
- Semi-transparent boxes positioned on PDF
- Header showing field name + type icon
- Resize handles on corners and edges
- Drag handle on header for repositioning
- Selected state with emphasized border
- Delete button (small × in corner)

**7. Toolbar (Top of Canvas)**
- Horizontal icon buttons with tooltips:
  - Zoom controls (-, reset, +)
  - Grid toggle
  - Ruler toggle
  - Snap to grid toggle
  - Alignment tools (left, center, right, top, middle, bottom)
  - Distribution tools (horizontal, vertical)
- Button size: h-10 w-10

**8. Action Buttons (Bottom Bar)**
- **Design Mode:**
  - "Save Template" (primary)
  - "Preview Form" (secondary)
  - "Export Configuration" (tertiary)
- **Fill Mode:**
  - "Generate PDF" (primary, disabled until form valid)
  - "Reset Form" (secondary)
  - "Load Template" (tertiary)

**9. Modal Dialogs**
- **Upload PDF:** Drag-and-drop zone + file browser button
- **Field Type Selector:** Grid of field type cards with descriptions
- **Template Library:** Searchable grid of saved templates with previews
- **Export Options:** Format selection, filename input, quality settings
- Dialog header: h-14 with title + close button
- Dialog content: p-6 with max-h-screen overflow-y-auto

---

## Interaction Patterns

**Drag-and-Drop Workflow:**
1. Drag field type from library → canvas
2. Drop creates field at cursor position with default size
3. Immediate selection state with properties panel visible
4. Auto-save on every change with subtle confirmation toast

**Field Manipulation:**
- Click to select (single click)
- Shift+click for multi-select
- Arrow keys for 1px nudging (Shift+arrow for 10px)
- Delete key to remove selected fields
- Ctrl/Cmd+Z for undo (maintain 20-step history)

**Keyboard Shortcuts Panel:**
- Accessible via "?" key or help icon
- Modal overlay with categorized shortcuts table
- Two-column layout: Command | Shortcut

---

## Data Visualization

**Field List View (Alternative to Canvas):**
- Tabular layout with columns: Preview, Name, Type, Position, Size, Required
- Sortable by any column
- Click row to select field on canvas
- Batch actions toolbar when multiple rows selected

**Template Statistics (Dashboard):**
- Card layout showing: Total Fields, Required Fields, Field Types Distribution
- Compact metrics in grid-cols-3 layout
- Icons for each metric type

---

## Images

**No hero images** - this is a productivity application focused on functionality.

**Illustrations for Empty States:**
1. **No PDF Loaded:** Center-aligned illustration of document upload, description "Upload a PDF to start mapping fields", dimensions 300x200px
2. **No Fields Mapped:** Illustration of drag-and-drop gesture, description "Drag field types onto your PDF", dimensions 300x200px
3. **No Templates Saved:** Illustration of folder with plus icon, description "Create your first template", dimensions 300x200px

**Icons:** Use Heroicons (outline style) via CDN for all UI icons - consistent 20x20px or 24x24px sizing

---

## Responsive Behavior

**Desktop (lg and above):** Full dual-panel layout as described
**Tablet (md):** Stack panels vertically, canvas on top with h-96, controls below
**Mobile (base):** Tab-based navigation between Canvas and Controls, single column forms

---

## Accessibility

- All interactive elements keyboard navigable with visible focus states
- ARIA labels for drag-and-drop regions
- High contrast mode support for field overlays
- Screen reader announcements for drag-and-drop actions
- Form validation errors announced immediately
- All color-coded information also conveyed through icons/text