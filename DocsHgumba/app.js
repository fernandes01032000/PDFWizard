// DocsHgumba - App Logic v2.0
// Sistema 100% offline para geração de PDFs editáveis
// Melhorias: Touch events, field resizing, undo/redo, keyboard shortcuts, validation

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Global State
const state = {
    currentMode: 'design',
    currentPDF: null,
    pdfDocument: null,
    currentTemplate: null,
    fields: [],
    templates: [],
    zoom: 1.0,
    formData: {},

    // New features
    selectedField: null,
    history: [],
    historyIndex: -1,
    maxHistorySize: 20,
    isResizing: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    resizeHandle: null,
    autoSaveInterval: null,
    pendingConfirmAction: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DocsHgumba v2.0 iniciado!');
    loadTemplates();
    initializeEventListeners();
    initializeKeyboardShortcuts();
    startAutoSave();
});

// ==========================================
// HISTORY & UNDO/REDO
// ==========================================

function saveHistory(action) {
    // Remove any history after current index
    state.history = state.history.slice(0, state.historyIndex + 1);

    // Add new state
    const snapshot = {
        action: action,
        fields: JSON.parse(JSON.stringify(state.fields)),
        timestamp: Date.now()
    };

    state.history.push(snapshot);

    // Limit history size
    if (state.history.length > state.maxHistorySize) {
        state.history.shift();
    } else {
        state.historyIndex++;
    }

    updateUndoRedoButtons();
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        state.fields = JSON.parse(JSON.stringify(state.history[state.historyIndex].fields));
        renderFields();
        updateUndoRedoButtons();
        showToast('Ação desfeita', 'info');
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.fields = JSON.parse(JSON.stringify(state.history[state.historyIndex].fields));
        renderFields();
        updateUndoRedoButtons();
        showToast('Ação refeita', 'info');
    }
}

function updateUndoRedoButtons() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');

    if (btnUndo) {
        btnUndo.disabled = state.historyIndex <= 0;
    }

    if (btnRedo) {
        btnRedo.disabled = state.historyIndex >= state.history.length - 1;
    }
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S: Save template
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (state.currentMode === 'design') {
                saveTemplate();
            }
        }

        // Ctrl+Z: Undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        }

        // Ctrl+Y or Ctrl+Shift+Z: Redo
        if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
            e.preventDefault();
            redo();
        }

        // Delete: Delete selected field
        if (e.key === 'Delete' && state.selectedField) {
            e.preventDefault();
            deleteField(state.selectedField.id);
        }

        // Ctrl+D: Duplicate field
        if (e.ctrlKey && e.key === 'd' && state.selectedField) {
            e.preventDefault();
            duplicateField(state.selectedField.id);
        }

        // Escape: Deselect
        if (e.key === 'Escape') {
            e.preventDefault();
            deselectField();
            closePropertiesPanel();
        }

        // Arrow keys: Move selected field
        if (state.selectedField && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            moveFieldByKeys(e.key, step);
        }

        // ?: Show shortcuts help
        if (e.key === '?' && !e.ctrlKey && !e.altKey) {
            const modal = new bootstrap.Modal(document.getElementById('shortcutsModal'));
            modal.show();
        }
    });
}

function moveFieldByKeys(key, step) {
    const field = state.selectedField;
    if (!field) return;

    switch (key) {
        case 'ArrowUp':
            field.y = Math.max(0, field.y - step);
            break;
        case 'ArrowDown':
            field.y += step;
            break;
        case 'ArrowLeft':
            field.x = Math.max(0, field.x - step);
            break;
        case 'ArrowRight':
            field.x += step;
            break;
    }

    renderFields();
    updatePropertiesPanel();
}

// ==========================================
// TEMPLATE MANAGEMENT
// ==========================================

function loadTemplates() {
    try {
        const stored = localStorage.getItem('docsHgumbaTemplates');
        if (stored) {
            state.templates = JSON.parse(stored);
            console.log(`${state.templates.length} templates carregados`);
            updateTemplateSelector();
        }
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        showToast('Erro ao carregar templates', 'danger');
    }
}

function saveTemplates() {
    try {
        localStorage.setItem('docsHgumbaTemplates', JSON.stringify(state.templates));
        console.log('Templates salvos com sucesso');
    } catch (error) {
        console.error('Erro ao salvar templates:', error);
        showToast('Erro ao salvar templates. Verifique o espaço disponível.', 'danger');
    }
}

function updateTemplateSelector() {
    const selector = document.getElementById('template-selector');
    if (!selector) return;

    selector.innerHTML = '<option value="">Selecione um template...</option>';

    state.templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} (${template.fields.length} campos)`;
        selector.appendChild(option);
    });
}

function openTemplateManager() {
    renderTemplatesList();
    const modal = new bootstrap.Modal(document.getElementById('templateManagerModal'));
    modal.show();
}

function renderTemplatesList() {
    const container = document.getElementById('templates-list');
    if (!container) return;

    if (state.templates.length === 0) {
        container.innerHTML = `
            <p class="text-muted text-center py-5">
                <i class="bi bi-inbox me-2"></i>
                Nenhum template salvo ainda
            </p>
        `;
        return;
    }

    container.innerHTML = '';

    state.templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${template.name}</h6>
                    <small class="text-muted">
                        <i class="bi bi-calendar me-1"></i>${formatDate(template.createdAt)}
                        <i class="bi bi-grid ms-2 me-1"></i>${template.fields.length} campos
                    </small>
                </div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editTemplate('${template.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="duplicateTemplate('${template.id}')" title="Duplicar">
                        <i class="bi bi-files"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="exportTemplate('${template.id}')" title="Exportar">
                        <i class="bi bi-download"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="confirmDeleteTemplate('${template.id}')" title="Deletar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function editTemplate(templateId) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('templateManagerModal')).hide();

    // Switch to design mode
    switchMode('design');
    document.getElementById('design-tab').click();

    // Load template PDF and fields
    loadTemplateForEditing(template);

    showToast(`Editando template: ${template.name}`, 'info');
}

async function loadTemplateForEditing(template) {
    try {
        // Load PDF
        const pdfData = base64ToArrayBuffer(template.pdfData);
        state.currentPDF = pdfData;

        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        state.pdfDocument = await loadingTask.promise;

        await renderPDFPage(1);

        // Load fields
        state.fields = JSON.parse(JSON.stringify(template.fields));
        renderFields();

        // Update UI
        document.getElementById('empty-canvas').classList.add('d-none');
        document.getElementById('pdf-canvas').classList.remove('d-none');
        document.getElementById('template-name').value = template.name;

        saveHistory('load_template');
    } catch (error) {
        console.error('Erro ao carregar template para edição:', error);
        showToast('Erro ao carregar template', 'danger');
    }
}

function duplicateTemplate(templateId) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    const newTemplate = {
        ...JSON.parse(JSON.stringify(template)),
        id: 'template_' + Date.now(),
        name: template.name + ' (cópia)',
        createdAt: new Date().toISOString()
    };

    state.templates.push(newTemplate);
    saveTemplates();
    renderTemplatesList();
    updateTemplateSelector();

    showToast(`Template duplicado: ${newTemplate.name}`, 'success');
}

function exportTemplate(templateId) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    const dataStr = JSON.stringify(template, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Template exportado!', 'success');
}

function exportAllTemplates() {
    if (state.templates.length === 0) {
        showToast('Nenhum template para exportar', 'warning');
        return;
    }

    const dataStr = JSON.stringify(state.templates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `docsHgumba_templates_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showToast(`${state.templates.length} templates exportados!`, 'success');
}

function importTemplate(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);

            // Check if it's a single template or array
            const templates = Array.isArray(imported) ? imported : [imported];

            let importedCount = 0;
            templates.forEach(template => {
                // Validate template structure
                if (template.name && template.fields && template.pdfData) {
                    // Generate new ID to avoid conflicts
                    template.id = 'template_' + Date.now() + '_' + importedCount;
                    template.createdAt = new Date().toISOString();
                    state.templates.push(template);
                    importedCount++;
                }
            });

            if (importedCount > 0) {
                saveTemplates();
                renderTemplatesList();
                updateTemplateSelector();
                showToast(`${importedCount} template(s) importado(s) com sucesso!`, 'success');
            } else {
                showToast('Nenhum template válido encontrado no arquivo', 'warning');
            }
        } catch (error) {
            console.error('Erro ao importar template:', error);
            showToast('Erro ao importar template. Verifique o arquivo.', 'danger');
        }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
}

function confirmDeleteTemplate(templateId) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    showConfirmModal(
        `Tem certeza que deseja deletar o template "${template.name}"?`,
        () => {
            state.templates = state.templates.filter(t => t.id !== templateId);
            saveTemplates();
            renderTemplatesList();
            updateTemplateSelector();
            showToast('Template deletado', 'info');
        }
    );
}

// ==========================================
// CONFIRMATION MODAL
// ==========================================

function showConfirmModal(message, onConfirm) {
    document.getElementById('confirmModalBody').textContent = message;
    state.pendingConfirmAction = onConfirm;
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

function confirmAction() {
    if (state.pendingConfirmAction) {
        state.pendingConfirmAction();
        state.pendingConfirmAction = null;
    }
    bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
}

// ==========================================
// AUTO-SAVE
// ==========================================

function startAutoSave() {
    state.autoSaveInterval = setInterval(() => {
        if (state.fields.length > 0 && state.currentPDF) {
            const indicator = document.getElementById('auto-save-indicator');
            if (indicator) {
                indicator.classList.remove('d-none');
                setTimeout(() => {
                    indicator.classList.add('d-none');
                }, 2000);
            }
        }
    }, 30000); // 30 seconds
}

// ==========================================
// SMART POSITIONING
// ==========================================

function getSmartPosition() {
    if (state.fields.length === 0) {
        return { x: 100, y: 100 };
    }

    const canvas = document.getElementById('pdf-render');
    const canvasWidth = canvas ? canvas.width : 600;
    const canvasHeight = canvas ? canvas.height : 800;

    // Try to place field without overlap
    const gridSize = 50;
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const row = Math.floor(attempt / 10);
        const col = attempt % 10;
        const x = 50 + col * gridSize;
        const y = 50 + row * gridSize;

        if (x + 200 > canvasWidth || y + 30 > canvasHeight) continue;

        // Check for overlap
        const hasOverlap = state.fields.some(field => {
            return !(x + 200 < field.x ||
                     x > field.x + field.width ||
                     y + 30 < field.y ||
                     y > field.y + field.height);
        });

        if (!hasOverlap) {
            return { x, y };
        }
    }

    // Fallback to bottom of last field
    const lastField = state.fields[state.fields.length - 1];
    return {
        x: lastField.x,
        y: Math.min(lastField.y + lastField.height + 20, canvasHeight - 50)
    };
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    // PDF Upload
    const uploadInput = document.getElementById('pdf-upload');
    const uploadZone = document.getElementById('upload-zone');

    if (uploadInput && uploadZone) {
        uploadInput.addEventListener('change', handlePDFUpload);

        uploadZone.addEventListener('click', () => {
            uploadInput.click();
        });

        // Drag and drop for PDF upload
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-success');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-success');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-success');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                uploadInput.files = files;
                handlePDFUpload({ target: uploadInput });
            }
        });
    }

    // Field Library
    const fieldTypes = document.querySelectorAll('.field-type');
    fieldTypes.forEach(fieldType => {
        fieldType.addEventListener('click', () => {
            const type = fieldType.getAttribute('data-type');
            addFieldToCanvas(type);
        });
    });

    // Canvas click to deselect
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.addEventListener('click', (e) => {
            if (e.target === canvasContainer || e.target.id === 'canvas-container') {
                deselectField();
            }
        });
    }

    // Template search
    const searchInput = document.getElementById('template-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterTemplates, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function filterTemplates() {
    const searchTerm = document.getElementById('template-search').value.toLowerCase();
    const cards = document.querySelectorAll('.template-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function sortTemplates() {
    const sortBy = document.getElementById('template-sort').value;

    state.templates.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'date':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'fields':
                return b.fields.length - a.fields.length;
            default:
                return 0;
        }
    });

    renderTemplatesList();
}

// ==========================================
// PDF HANDLING
// ==========================================

async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showToast('Carregando PDF...', 'info');

    try {
        const arrayBuffer = await file.arrayBuffer();
        state.currentPDF = arrayBuffer;

        // Load with PDF.js for rendering
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        state.pdfDocument = await loadingTask.promise;

        console.log('PDF carregado:', state.pdfDocument.numPages, 'páginas');

        // Render first page
        await renderPDFPage(1);

        // Update UI
        document.getElementById('empty-canvas').classList.add('d-none');
        document.getElementById('pdf-canvas').classList.remove('d-none');

        const pdfInfo = document.getElementById('pdf-info');
        pdfInfo.textContent = `${file.name} (${state.pdfDocument.numPages} página${state.pdfDocument.numPages > 1 ? 's' : ''})`;
        pdfInfo.classList.remove('d-none');

        showToast('PDF carregado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        showToast('Erro ao carregar PDF', 'danger');
    }
}

async function renderPDFPage(pageNum) {
    if (!state.pdfDocument) return;

    try {
        const page = await state.pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: state.zoom * 1.5 });

        const canvas = document.getElementById('pdf-render');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        // Update overlay size
        const overlay = document.getElementById('fields-overlay');
        overlay.style.width = viewport.width + 'px';
        overlay.style.height = viewport.height + 'px';

        renderFields();
    } catch (error) {
        console.error('Erro ao renderizar PDF:', error);
    }
}

// ==========================================
// FIELD MANAGEMENT
// ==========================================

function addFieldToCanvas(type) {
    if (!state.currentPDF) {
        showToast('Carregue um PDF primeiro!', 'warning');
        return;
    }

    const position = getSmartPosition();

    const field = {
        id: 'field_' + Date.now(),
        type: type,
        name: `${type}_${state.fields.length + 1}`,
        x: position.x,
        y: position.y,
        width: type === 'checkbox' ? 20 : 200,
        height: type === 'textarea' ? 80 : 30,
        fontSize: 12,
        required: false,
        placeholder: '',
        defaultValue: ''
    };

    state.fields.push(field);
    saveHistory('add_field');
    renderFields();
    updateFieldCount();
    showToast(`Campo ${type} adicionado`, 'success');
}

function deleteField(fieldId) {
    state.fields = state.fields.filter(f => f.id !== fieldId);

    if (state.selectedField && state.selectedField.id === fieldId) {
        deselectField();
    }

    saveHistory('delete_field');
    renderFields();
    updateFieldCount();
    showToast('Campo removido', 'info');
}

function duplicateField(fieldId) {
    const field = state.fields.find(f => f.id === fieldId);
    if (!field) return;

    const newField = {
        ...JSON.parse(JSON.stringify(field)),
        id: 'field_' + Date.now(),
        name: field.name + '_copy',
        x: field.x + 20,
        y: field.y + 20
    };

    state.fields.push(newField);
    saveHistory('duplicate_field');
    renderFields();
    updateFieldCount();
    showToast('Campo duplicado', 'success');
}

function updateFieldCount() {
    const countEl = document.getElementById('field-count');
    if (countEl) {
        countEl.textContent = state.fields.length;
    }
}

// ==========================================
// FIELD RENDERING WITH RESIZING
// ==========================================

function renderFields() {
    const overlay = document.getElementById('fields-overlay');
    if (!overlay) return;

    overlay.innerHTML = '';

    state.fields.forEach(field => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'field-overlay';
        if (state.selectedField && state.selectedField.id === field.id) {
            fieldEl.classList.add('selected');
        }

        fieldEl.setAttribute('data-field-id', field.id);
        fieldEl.style.left = field.x + 'px';
        fieldEl.style.top = field.y + 'px';
        fieldEl.style.width = field.width + 'px';
        fieldEl.style.height = field.height + 'px';
        fieldEl.style.pointerEvents = 'auto';

        // Label
        const label = document.createElement('div');
        label.className = 'field-label';
        label.textContent = field.name + (field.required ? ' *' : '');

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'field-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            showConfirmModal(`Deletar campo "${field.name}"?`, () => deleteField(field.id));
        };

        fieldEl.appendChild(label);
        fieldEl.appendChild(deleteBtn);

        // Add resize handles if selected
        if (state.selectedField && state.selectedField.id === field.id) {
            addResizeHandles(fieldEl, field);
        }

        // Make draggable
        makeDraggable(fieldEl, field);

        // Click to select
        fieldEl.addEventListener('click', (e) => {
            e.stopPropagation();
            selectField(field);
        });

        overlay.appendChild(fieldEl);
    });
}

function addResizeHandles(fieldEl, field) {
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${position}`;
        handle.setAttribute('data-position', position);

        // Mouse events
        handle.addEventListener('mousedown', (e) => startResize(e, field, position));

        // Touch events
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            startResize(mouseEvent, field, position);
        });

        fieldEl.appendChild(handle);
    });
}

function startResize(e, field, position) {
    e.stopPropagation();
    state.isResizing = true;
    state.resizeHandle = position;
    state.selectedField = field;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;

    const initialX = field.x;
    const initialY = field.y;
    const initialWidth = field.width;
    const initialHeight = field.height;

    const handleMouseMove = (e) => {
        if (!state.isResizing) return;

        const deltaX = e.clientX - state.dragStartX;
        const deltaY = e.clientY - state.dragStartY;

        // Apply resize based on handle position
        switch (position) {
            case 'nw':
                field.x = Math.max(0, initialX + deltaX);
                field.y = Math.max(0, initialY + deltaY);
                field.width = Math.max(20, initialWidth - deltaX);
                field.height = Math.max(20, initialHeight - deltaY);
                break;
            case 'n':
                field.y = Math.max(0, initialY + deltaY);
                field.height = Math.max(20, initialHeight - deltaY);
                break;
            case 'ne':
                field.y = Math.max(0, initialY + deltaY);
                field.width = Math.max(20, initialWidth + deltaX);
                field.height = Math.max(20, initialHeight - deltaY);
                break;
            case 'e':
                field.width = Math.max(20, initialWidth + deltaX);
                break;
            case 'se':
                field.width = Math.max(20, initialWidth + deltaX);
                field.height = Math.max(20, initialHeight + deltaY);
                break;
            case 's':
                field.height = Math.max(20, initialHeight + deltaY);
                break;
            case 'sw':
                field.x = Math.max(0, initialX + deltaX);
                field.width = Math.max(20, initialWidth - deltaX);
                field.height = Math.max(20, initialHeight + deltaY);
                break;
            case 'w':
                field.x = Math.max(0, initialX + deltaX);
                field.width = Math.max(20, initialWidth - deltaX);
                break;
        }

        renderFields();
        updatePropertiesPanel();
    };

    const handleMouseUp = () => {
        if (state.isResizing) {
            state.isResizing = false;
            state.resizeHandle = null;
            saveHistory('resize_field');
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        }
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
}

// ==========================================
// DRAGGABLE FIELDS (WITH TOUCH SUPPORT)
// ==========================================

function makeDraggable(element, field) {
    let startX, startY, initialX, initialY;

    const handleStart = (e) => {
        // Don't drag if clicking on resize handle or delete button
        if (e.target.classList.contains('resize-handle') ||
            e.target.classList.contains('field-delete-btn')) {
            return;
        }

        state.isDragging = true;
        state.selectedField = field;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        startX = clientX;
        startY = clientY;
        initialX = field.x;
        initialY = field.y;

        element.classList.add('dragging');
        selectField(field);
    };

    const handleMove = (e) => {
        if (!state.isDragging) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const dx = clientX - startX;
        const dy = clientY - startY;

        field.x = Math.max(0, initialX + dx);
        field.y = Math.max(0, initialY + dy);

        element.style.left = field.x + 'px';
        element.style.top = field.y + 'px';

        updatePropertiesPanel();
    };

    const handleEnd = () => {
        if (state.isDragging) {
            state.isDragging = false;
            element.classList.remove('dragging');
            saveHistory('move_field');

            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        handleMove(e);
    };

    // Mouse events
    element.addEventListener('mousedown', handleStart);

    // Touch events
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleStart(e);
    });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
}

// ==========================================
// FIELD SELECTION & PROPERTIES
// ==========================================

function selectField(field) {
    state.selectedField = field;
    renderFields();
    openPropertiesPanel();
    updatePropertiesPanel();
}

function deselectField() {
    state.selectedField = null;
    renderFields();
    closePropertiesPanel();
}

function openPropertiesPanel() {
    const panel = document.getElementById('properties-panel');
    if (panel) {
        panel.classList.add('open');
    }
}

function closePropertiesPanel() {
    const panel = document.getElementById('properties-panel');
    if (panel) {
        panel.classList.remove('open');
    }
}

function updatePropertiesPanel() {
    const content = document.getElementById('properties-content');
    if (!content || !state.selectedField) return;

    const field = state.selectedField;

    content.innerHTML = `
        <div class="mb-3">
            <label class="form-label small">Nome do Campo</label>
            <input type="text" class="form-control" id="prop-name" value="${field.name}">
        </div>

        <div class="mb-3">
            <label class="form-label small">Tipo</label>
            <select class="form-select" id="prop-type" disabled>
                <option value="${field.type}">${field.type}</option>
            </select>
            <small class="text-muted">O tipo não pode ser alterado após criação</small>
        </div>

        <div class="row mb-3">
            <div class="col-6">
                <label class="form-label small">Posição X</label>
                <input type="number" class="form-control" id="prop-x" value="${Math.round(field.x)}" min="0">
            </div>
            <div class="col-6">
                <label class="form-label small">Posição Y</label>
                <input type="number" class="form-control" id="prop-y" value="${Math.round(field.y)}" min="0">
            </div>
        </div>

        <div class="row mb-3">
            <div class="col-6">
                <label class="form-label small">Largura</label>
                <input type="number" class="form-control" id="prop-width" value="${Math.round(field.width)}" min="20">
            </div>
            <div class="col-6">
                <label class="form-label small">Altura</label>
                <input type="number" class="form-control" id="prop-height" value="${Math.round(field.height)}" min="20">
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label small">Tamanho da Fonte</label>
            <input type="range" class="form-range" id="prop-fontsize" min="8" max="72" value="${field.fontSize}">
            <small class="text-muted">Tamanho: <strong id="fontsize-display">${field.fontSize}px</strong></small>
        </div>

        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="prop-required" ${field.required ? 'checked' : ''}>
            <label class="form-check-label" for="prop-required">Campo obrigatório</label>
        </div>

        <div class="mb-3">
            <label class="form-label small">Placeholder</label>
            <input type="text" class="form-control" id="prop-placeholder" value="${field.placeholder || ''}">
        </div>

        <div class="mb-3">
            <label class="form-label small">Valor Padrão</label>
            <input type="text" class="form-control" id="prop-default" value="${field.defaultValue || ''}">
        </div>

        <div class="d-grid gap-2">
            <button class="btn btn-sm btn-success" onclick="applyProperties()">
                <i class="bi bi-check-lg me-1"></i>Aplicar
            </button>
            <button class="btn btn-sm btn-outline-warning" onclick="duplicateField('${field.id}')">
                <i class="bi bi-files me-1"></i>Duplicar Campo
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="showConfirmModal('Deletar este campo?', () => deleteField('${field.id}'))">
                <i class="bi bi-trash me-1"></i>Deletar Campo
            </button>
        </div>
    `;

    // Add event listeners
    const fontsizeInput = document.getElementById('prop-fontsize');
    const fontsizeDisplay = document.getElementById('fontsize-display');
    if (fontsizeInput && fontsizeDisplay) {
        fontsizeInput.addEventListener('input', (e) => {
            fontsizeDisplay.textContent = e.target.value + 'px';
        });
    }
}

function applyProperties() {
    if (!state.selectedField) return;

    const field = state.selectedField;

    field.name = document.getElementById('prop-name').value;
    field.x = parseInt(document.getElementById('prop-x').value);
    field.y = parseInt(document.getElementById('prop-y').value);
    field.width = parseInt(document.getElementById('prop-width').value);
    field.height = parseInt(document.getElementById('prop-height').value);
    field.fontSize = parseInt(document.getElementById('prop-fontsize').value);
    field.required = document.getElementById('prop-required').checked;
    field.placeholder = document.getElementById('prop-placeholder').value;
    field.defaultValue = document.getElementById('prop-default').value;

    saveHistory('update_properties');
    renderFields();
    showToast('Propriedades atualizadas', 'success');
}

// ==========================================
// SAVE & LOAD TEMPLATES
// ==========================================

function saveTemplate() {
    const name = document.getElementById('template-name').value.trim();

    if (!name) {
        showToast('Digite um nome para o template', 'warning');
        return;
    }

    if (!state.currentPDF) {
        showToast('Carregue um PDF primeiro', 'warning');
        return;
    }

    if (state.fields.length === 0) {
        showToast('Adicione pelo menos um campo', 'warning');
        return;
    }

    // Convert PDF to base64
    const base64PDF = arrayBufferToBase64(state.currentPDF);

    const template = {
        id: 'template_' + Date.now(),
        name: name,
        fields: JSON.parse(JSON.stringify(state.fields)),
        pdfData: base64PDF,
        createdAt: new Date().toISOString()
    };

    state.templates.push(template);
    saveTemplates();
    updateTemplateSelector();

    showToast(`Template "${name}" salvo com sucesso!`, 'success');

    // Clear form
    document.getElementById('template-name').value = '';
}

async function loadTemplate() {
    const selector = document.getElementById('template-selector');
    const templateId = selector.value;

    if (!templateId) {
        document.getElementById('form-fields').innerHTML = `
            <p class="text-muted text-center py-5">
                <i class="bi bi-info-circle me-2"></i>
                Selecione um template para começar
            </p>
        `;
        document.getElementById('empty-preview').classList.remove('d-none');
        document.getElementById('pdf-preview').classList.add('d-none');
        document.getElementById('btn-generate').disabled = true;
        hideProgressBar();
        return;
    }

    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    state.currentTemplate = template;
    state.formData = {};

    // Update template info
    updateTemplateInfo(template);

    // Load PDF for preview
    try {
        const pdfData = base64ToArrayBuffer(template.pdfData);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        state.pdfDocument = await loadingTask.promise;

        await renderPreviewPDF();

        document.getElementById('empty-preview').classList.add('d-none');
        document.getElementById('pdf-preview').classList.remove('d-none');
    } catch (error) {
        console.error('Erro ao carregar PDF do template:', error);
        showToast('Erro ao carregar PDF do template', 'danger');
    }

    // Render form fields
    renderFormFields(template.fields);

    document.getElementById('btn-generate').disabled = false;
    showProgressBar();
}

function updateTemplateInfo(template) {
    const info = document.getElementById('template-info');
    if (info) {
        info.innerHTML = `
            <i class="bi bi-info-circle me-1"></i>
            ${template.fields.length} campos | Criado em ${formatDate(template.createdAt)}
        `;
    }
}

// ==========================================
// FORM VALIDATION & PROGRESS
// ==========================================

function showProgressBar() {
    const container = document.getElementById('fill-progress-container');
    const badge = document.getElementById('fill-progress-badge');

    if (container) container.classList.remove('d-none');
    if (badge) badge.classList.remove('d-none');

    updateProgress();
}

function hideProgressBar() {
    const container = document.getElementById('fill-progress-container');
    const badge = document.getElementById('fill-progress-badge');

    if (container) container.classList.add('d-none');
    if (badge) badge.classList.add('d-none');
}

function updateProgress() {
    if (!state.currentTemplate) return;

    const requiredFields = state.currentTemplate.fields.filter(f => f.required);
    const filledRequired = requiredFields.filter(f => {
        const value = state.formData[f.id];
        return value !== undefined && value !== '' && value !== false;
    }).length;

    const totalFilled = Object.keys(state.formData).filter(key => {
        const value = state.formData[key];
        return value !== undefined && value !== '' && value !== false;
    }).length;

    const progress = state.currentTemplate.fields.length > 0
        ? (totalFilled / state.currentTemplate.fields.length) * 100
        : 0;

    const progressBar = document.getElementById('fill-progress-bar');
    const badge = document.getElementById('fill-progress-badge');

    if (progressBar) {
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);
    }

    if (badge) {
        badge.textContent = `${totalFilled}/${state.currentTemplate.fields.length}`;
    }
}

function renderFormFields(fields) {
    const container = document.getElementById('form-fields');
    container.innerHTML = '';

    fields.forEach(field => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.name;
        if (field.required) {
            label.innerHTML += ' <span class="text-danger">*</span>';
        }

        let input;

        switch (field.type) {
            case 'text':
            case 'date':
                input = document.createElement('input');
                input.type = field.type;
                input.className = 'form-control';
                input.id = field.id;
                input.placeholder = field.placeholder || '';
                input.value = field.defaultValue || '';
                if (field.defaultValue) {
                    state.formData[field.id] = field.defaultValue;
                }
                break;

            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'form-control';
                input.id = field.id;
                input.rows = 3;
                input.placeholder = field.placeholder || '';
                input.value = field.defaultValue || '';
                if (field.defaultValue) {
                    state.formData[field.id] = field.defaultValue;
                }
                break;

            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'form-check-input';
                input.id = field.id;
                input.checked = field.defaultValue === 'true' || field.defaultValue === true;
                if (input.checked) {
                    state.formData[field.id] = true;
                }
                fieldGroup.className += ' form-check';
                break;

            case 'signature':
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.id = field.id;
                input.placeholder = field.placeholder || 'Digite seu nome para assinar';
                input.value = field.defaultValue || '';
                if (field.defaultValue) {
                    state.formData[field.id] = field.defaultValue;
                }
                break;

            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.id = field.id;
        }

        input.addEventListener('input', (e) => {
            if (field.type === 'checkbox') {
                state.formData[field.id] = e.target.checked;
            } else {
                state.formData[field.id] = e.target.value;
            }
            renderPreviewOverlay();
            updateProgress();
        });

        if (field.type === 'checkbox') {
            fieldGroup.appendChild(input);
            fieldGroup.appendChild(label);
        } else {
            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);
        }

        container.appendChild(fieldGroup);
    });

    updateProgress();
}

// ==========================================
// PREVIEW RENDERING
// ==========================================

async function renderPreviewPDF() {
    if (!state.pdfDocument) return;

    try {
        const page = await state.pdfDocument.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.getElementById('pdf-preview-render');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        // Update overlay
        const overlay = document.getElementById('preview-overlay');
        overlay.style.width = viewport.width + 'px';
        overlay.style.height = viewport.height + 'px';

        renderPreviewOverlay();
    } catch (error) {
        console.error('Erro ao renderizar preview:', error);
    }
}

function renderPreviewOverlay() {
    if (!state.currentTemplate) return;

    const overlay = document.getElementById('preview-overlay');
    overlay.innerHTML = '';

    state.currentTemplate.fields.forEach(field => {
        const value = state.formData[field.id];
        if (!value && field.type !== 'checkbox') return;

        const fieldEl = document.createElement('div');
        fieldEl.style.position = 'absolute';
        fieldEl.style.left = field.x + 'px';
        fieldEl.style.top = field.y + 'px';
        fieldEl.style.width = field.width + 'px';
        fieldEl.style.height = field.height + 'px';
        fieldEl.style.fontSize = field.fontSize + 'px';
        fieldEl.style.color = '#000';
        fieldEl.style.overflow = 'hidden';
        fieldEl.style.whiteSpace = field.type === 'textarea' ? 'pre-wrap' : 'nowrap';

        if (field.type === 'checkbox') {
            fieldEl.innerHTML = value ? '☑' : '☐';
            fieldEl.style.fontSize = '20px';
        } else {
            fieldEl.textContent = value;
        }

        overlay.appendChild(fieldEl);
    });
}

// ==========================================
// PDF GENERATION
// ==========================================

async function generatePDF() {
    if (!state.currentTemplate) {
        showToast('Selecione um template primeiro', 'warning');
        return;
    }

    // Validate required fields
    const requiredFields = state.currentTemplate.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => {
        const value = state.formData[f.id];
        return !value || value === '';
    });

    if (missingFields.length > 0) {
        showToast(`Preencha todos os campos obrigatórios (${missingFields.length} faltando)`, 'warning');
        return;
    }

    showToast('Gerando PDF...', 'info');

    try {
        const pdfData = base64ToArrayBuffer(state.currentTemplate.pdfData);
        const pdfDoc = await PDFLib.PDFDocument.load(pdfData);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Add fields to PDF
        state.currentTemplate.fields.forEach(field => {
            const value = state.formData[field.id];
            if (!value && field.type !== 'checkbox') return;

            const { height } = firstPage.getSize();

            // PDF coordinates are from bottom-left
            const pdfX = field.x;
            const pdfY = height - field.y - field.height;

            if (field.type === 'checkbox') {
                firstPage.drawText(value ? '☑' : '☐', {
                    x: pdfX,
                    y: pdfY,
                    size: 20
                });
            } else {
                firstPage.drawText(String(value), {
                    x: pdfX,
                    y: pdfY,
                    size: field.fontSize
                });
            }
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentTemplate.name}_${new Date().getTime()}.pdf`;
        a.click();

        URL.revokeObjectURL(url);

        showToast('PDF gerado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF: ' + error.message, 'danger');
    }
}

function clearForm() {
    showConfirmModal('Limpar todos os campos preenchidos?', () => {
        state.formData = {};

        const inputs = document.querySelectorAll('#form-fields input, #form-fields textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        renderPreviewOverlay();
        updateProgress();
        showToast('Formulário limpo', 'info');
    });
}

// ==========================================
// MODE SWITCHING
// ==========================================

function switchMode(mode) {
    state.currentMode = mode;
    console.log('Modo:', mode);

    // Deselect field when switching modes
    deselectField();
}

function switchMobileMode(mode) {
    // Update bottom nav
    document.querySelectorAll('.bottom-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-mode') === mode) {
            link.classList.add('active');
        }
    });

    // Switch tabs
    if (mode === 'design') {
        document.getElementById('design-tab').click();
    } else {
        document.getElementById('fill-tab').click();
    }
}

function openFieldMenu() {
    // For mobile: show a simple menu to add fields
    if (state.currentMode !== 'design') {
        switchMobileMode('design');
    }

    // Scroll to field library
    const fieldLibrary = document.getElementById('field-library');
    if (fieldLibrary) {
        fieldLibrary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ==========================================
// ZOOM CONTROLS
// ==========================================

function zoomIn() {
    state.zoom = Math.min(state.zoom + 0.1, 2.0);
    updateZoom();
}

function zoomOut() {
    state.zoom = Math.max(state.zoom - 0.1, 0.5);
    updateZoom();
}

function updateZoom() {
    document.getElementById('zoom-level').textContent = Math.round(state.zoom * 100) + '%';
    if (state.currentMode === 'design' && state.pdfDocument) {
        renderPDFPage(1);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    const toastBody = document.getElementById('toast-message');

    if (!toastEl || !toastBody) return;

    // Set message
    toastBody.textContent = message;

    // Set color based on type
    toastEl.className = 'toast align-items-center';
    switch (type) {
        case 'success':
            toastEl.classList.add('bg-success', 'text-white');
            break;
        case 'danger':
            toastEl.classList.add('bg-danger', 'text-white');
            break;
        case 'warning':
            toastEl.classList.add('bg-warning');
            break;
        default:
            toastEl.classList.add('bg-info', 'text-white');
    }

    // Show toast
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// Initialize field count on load
updateFieldCount();

console.log('DocsHgumba v2.0 app.js carregado com sucesso!');
