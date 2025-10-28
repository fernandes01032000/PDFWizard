// DocsHgumba - App Logic (Enhanced Mobile & Features)
// Sistema 100% offline para geração de PDFs editáveis

// Configure PDF.js worker (Local)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.min.js';

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
    isDragging: false,
    draggedField: null,
    selectedFieldId: null,
    pdfHistory: [],
    darkTheme: false,
    showGrid: false,
    signatureCanvas: null,
    signatureContext: null,
    currentSignatureFieldId: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DocsHgumba iniciado - Versão Mobile Otimizada!');
    initializeApp();
});

// Initialize Application
function initializeApp() {
    loadTemplates();
    loadPDFHistory();
    loadThemePreference();
    initializeEventListeners();
    initializeSignatureCanvas();
    initializeMobileMenu();
    loadSampleTemplates();
}

// Load templates from localStorage and templates.json
async function loadTemplates() {
    try {
        // Try localStorage first
        const stored = localStorage.getItem('docsHgumbaTemplates');
        if (stored) {
            state.templates = JSON.parse(stored);
        }

        // Sync with templates.json if available
        try {
            const response = await fetch('data/templates.json');
            if (response.ok) {
                const jsonTemplates = await response.json();
                // Merge templates (localStorage takes precedence)
                jsonTemplates.forEach(jsonTemplate => {
                    if (!state.templates.find(t => t.id === jsonTemplate.id)) {
                        state.templates.push(jsonTemplate);
                    }
                });
            }
        } catch (error) {
            console.log('templates.json não encontrado (normal em primeira execução)');
        }

        console.log(`${state.templates.length} templates carregados`);
        updateTemplateSelector();
        saveTemplates();
    } catch (error) {
        console.error('Erro ao carregar templates:', error);
        showToast('Erro ao carregar templates', 'danger');
    }
}

// Save templates to localStorage
function saveTemplates() {
    try {
        const templatesJSON = JSON.stringify(state.templates, null, 2);
        localStorage.setItem('docsHgumbaTemplates', templatesJSON);
        
        // Save last export date
        const lastExport = localStorage.getItem('docsHgumbaLastExport');
        const daysSinceExport = lastExport 
            ? Math.floor((Date.now() - new Date(lastExport).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
        
        // Show reminder to export if it's been more than 7 days
        if (daysSinceExport > 7 && state.templates.length > 0) {
            console.log(`⚠️ Templates não exportados há ${daysSinceExport} dias - clique em "Exportar Todos" para backup`);
            
            // Update export reminder indicator
            const exportBtn = document.querySelector('[onclick="exportTemplates()"]');
            if (exportBtn && !exportBtn.classList.contains('btn-warning')) {
                exportBtn.classList.remove('btn-outline-secondary');
                exportBtn.classList.add('btn-warning');
                exportBtn.title = `Backup recomendado! Último export: ${daysSinceExport} dias atrás`;
            }
        }
        
        console.log('Templates salvos em localStorage');
        
        // Note: Para compartilhar templates entre dispositivos, use o botão "Exportar Todos"
        // e salve manualmente o arquivo templates.json em pasta compartilhada de rede
    } catch (error) {
        console.error('Erro ao salvar templates:', error);
        showToast('Erro ao salvar templates', 'danger');
    }
}

// Export templates
function exportTemplates() {
    try {
        const templatesData = {
            version: "2.0",
            exportDate: new Date().toISOString(),
            templates: state.templates
        };
        
        const blob = new Blob([JSON.stringify(templatesData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `templates.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Save export date
        localStorage.setItem('docsHgumbaLastExport', new Date().toISOString());
        
        // Reset button style
        const exportBtn = document.querySelector('[onclick="exportTemplates()"]');
        if (exportBtn) {
            exportBtn.classList.remove('btn-warning');
            exportBtn.classList.add('btn-outline-secondary');
            exportBtn.title = 'Exportar todos os templates';
        }
        
        showToast('Templates exportados! Salve em pasta compartilhada.', 'success');
        
        // Show instructions
        setTimeout(() => {
            showToast('Salve templates.json em pasta de rede para compartilhar', 'info');
        }, 3500);
    } catch (error) {
        console.error('Erro ao exportar templates:', error);
        showToast('Erro ao exportar templates', 'danger');
    }
}

// Import templates
function importTemplates(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let imported = JSON.parse(e.target.result);
            
            // Support both old format (array) and new format (object with templates array)
            if (imported.templates && Array.isArray(imported.templates)) {
                imported = imported.templates;
            } else if (!Array.isArray(imported)) {
                throw new Error('Formato inválido');
            }
            
            let newCount = 0;
            let updatedCount = 0;
            
            imported.forEach(template => {
                const exists = state.templates.find(t => t.id === template.id);
                if (!exists) {
                    state.templates.push(template);
                    newCount++;
                } else {
                    // Update existing
                    const index = state.templates.findIndex(t => t.id === template.id);
                    state.templates[index] = template;
                    updatedCount++;
                }
            });
            
            saveTemplates();
            updateTemplateSelector();
            showToast(`${newCount} novos, ${updatedCount} atualizados!`, 'success');
        } catch (error) {
            console.error('Erro ao importar:', error);
            showToast('Arquivo inválido ou corrompido', 'danger');
        }
    };
    reader.readAsText(file);
    
    // Reset input for re-import
    event.target.value = '';
}

// Load PDF history
function loadPDFHistory() {
    try {
        const stored = localStorage.getItem('docsHgumbaPDFHistory');
        if (stored) {
            state.pdfHistory = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Save PDF to history
function savePDFToHistory(templateName, pdfBlob) {
    try {
        const reader = new FileReader();
        reader.onload = () => {
            const historyItem = {
                id: 'pdf_' + Date.now(),
                templateName: templateName,
                timestamp: new Date().toISOString(),
                size: pdfBlob.size
            };

            state.pdfHistory.unshift(historyItem);
            state.pdfHistory = state.pdfHistory.slice(0, 10); // Keep last 10
            
            localStorage.setItem('docsHgumbaPDFHistory', JSON.stringify(state.pdfHistory));
        };
        reader.readAsDataURL(pdfBlob);
    } catch (error) {
        console.error('Erro ao salvar no histórico:', error);
    }
}

// Load theme preference
function loadThemePreference() {
    const darkTheme = localStorage.getItem('docsHgumbaDarkTheme') === 'true';
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        state.darkTheme = true;
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = 'bi bi-sun';
        }
    }
}

// Toggle theme
function toggleTheme() {
    state.darkTheme = !state.darkTheme;
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('docsHgumbaDarkTheme', state.darkTheme);
    
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = state.darkTheme ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
    
    showToast(`Tema ${state.darkTheme ? 'escuro' : 'claro'} ativado`, 'info');
}

// Toggle grid
function toggleGrid() {
    state.showGrid = !state.showGrid;
    const container = document.getElementById('canvas-container');
    const btn = document.getElementById('grid-btn');
    
    if (state.showGrid) {
        container.classList.add('show-grid');
        btn.classList.add('active');
    } else {
        container.classList.remove('show-grid');
        btn.classList.remove('active');
    }
}

// Initialize Mobile Menu
function initializeMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
}

function toggleMobileMenu() {
    const panel = state.currentMode === 'design' 
        ? document.getElementById('design-panel')
        : document.getElementById('fill-panel');
    const overlay = document.getElementById('mobile-overlay');
    
    if (panel && overlay) {
        panel.classList.toggle('show');
        overlay.classList.toggle('show');
    }
}

function closeMobileMenu() {
    const panels = document.querySelectorAll('.mobile-drawer');
    const overlay = document.getElementById('mobile-overlay');
    
    panels.forEach(panel => panel.classList.remove('show'));
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // PDF Upload
    const uploadInput = document.getElementById('pdf-upload');
    const uploadZone = document.getElementById('upload-zone');

    if (uploadInput) {
        uploadInput.addEventListener('change', handlePDFUpload);
    }

    if (uploadZone) {
        uploadZone.addEventListener('click', () => uploadInput?.click());
        
        // Drag and drop
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
            closeMobileMenu(); // Close menu on mobile
        });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Keyboard shortcuts
function handleKeyboard(e) {
    // Delete selected field
    if (e.key === 'Delete' && state.selectedFieldId) {
        deleteField(state.selectedFieldId);
    }
    
    // Ctrl+Z: Undo (future enhancement)
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        // TODO: Implement undo
    }
    
    // Ctrl+S: Save template
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveTemplate();
    }
}

// Handle PDF Upload
async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showToast('Carregando PDF...', 'info');

    try {
        const arrayBuffer = await file.arrayBuffer();
        state.currentPDF = arrayBuffer;

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        state.pdfDocument = await loadingTask.promise;

        console.log('PDF carregado:', state.pdfDocument.numPages, 'páginas');

        await renderPDFPage(1);

        document.getElementById('empty-canvas').classList.add('d-none');
        document.getElementById('pdf-canvas').style.display = 'inline-block';

        const pdfInfo = document.getElementById('pdf-info');
        pdfInfo.textContent = `${file.name} (${state.pdfDocument.numPages} página${state.pdfDocument.numPages > 1 ? 's' : ''})`;
        pdfInfo.classList.remove('d-none');

        showToast('PDF carregado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        showToast('Erro ao carregar PDF', 'danger');
    }
}

// Render PDF Page
async function renderPDFPage(pageNum) {
    if (!state.pdfDocument) return;

    try {
        const page = await state.pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: state.zoom * 1.5 });

        const canvas = document.getElementById('pdf-render');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const overlay = document.getElementById('fields-overlay');
        overlay.style.width = viewport.width + 'px';
        overlay.style.height = viewport.height + 'px';

        renderFields();
    } catch (error) {
        console.error('Erro ao renderizar PDF:', error);
    }
}

// Add field to canvas
function addFieldToCanvas(type) {
    if (!state.currentPDF) {
        showToast('Carregue um PDF primeiro!', 'warning');
        return;
    }

    const field = {
        id: 'field_' + Date.now(),
        type: type,
        name: `${type}_${state.fields.length + 1}`,
        x: 50 + (state.fields.length * 20 % 200),
        y: 50 + (state.fields.length * 20 % 200),
        width: type === 'checkbox' ? 20 : type === 'image' ? 100 : 200,
        height: type === 'textarea' ? 80 : type === 'checkbox' ? 20 : type === 'image' ? 100 : 30,
        fontSize: 12,
        required: false
    };

    state.fields.push(field);
    renderFields();
    showToast(`Campo ${type} adicionado`, 'success');
}

// Render fields on canvas
function renderFields() {
    const overlay = document.getElementById('fields-overlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';

    state.fields.forEach(field => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'field-overlay';
        if (field.id === state.selectedFieldId) {
            fieldEl.classList.add('selected');
        }
        fieldEl.setAttribute('data-field-id', field.id);
        fieldEl.style.left = field.x + 'px';
        fieldEl.style.top = field.y + 'px';
        fieldEl.style.width = field.width + 'px';
        fieldEl.style.height = field.height + 'px';

        const label = document.createElement('div');
        label.className = 'field-label';
        label.textContent = field.name;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'field-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteField(field.id);
        };

        fieldEl.appendChild(label);
        fieldEl.appendChild(deleteBtn);

        makeDraggable(fieldEl, field);
        
        fieldEl.addEventListener('click', () => {
            state.selectedFieldId = field.id;
            renderFields();
        });

        overlay.appendChild(fieldEl);
    });
}

// Make field draggable (touch and mouse support)
function makeDraggable(element, field) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    const handleStart = (e) => {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        initialX = field.x;
        initialY = field.y;
        element.style.cursor = 'grabbing';
        e.preventDefault();
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        field.x = Math.max(0, initialX + dx);
        field.y = Math.max(0, initialY + dy);

        element.style.left = field.x + 'px';
        element.style.top = field.y + 'px';
    };

    const handleEnd = () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'move';
        }
    };

    // Mouse events
    element.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
}

// Delete field
function deleteField(fieldId) {
    state.fields = state.fields.filter(f => f.id !== fieldId);
    if (state.selectedFieldId === fieldId) {
        state.selectedFieldId = null;
    }
    renderFields();
    showToast('Campo removido', 'info');
}

// Clear all fields
function clearFields() {
    if (state.fields.length === 0) return;
    
    if (confirm('Remover todos os campos?')) {
        state.fields = [];
        state.selectedFieldId = null;
        renderFields();
        showToast('Campos limpos', 'info');
    }
}

// Save template
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

    document.getElementById('template-name').value = '';
    state.fields = [];
    state.selectedFieldId = null;
    renderFields();
}

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Update template selector
function updateTemplateSelector() {
    const selector = document.getElementById('template-selector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Selecione um template...</option>';

    state.templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        selector.appendChild(option);
    });
}

// Load template for filling
async function loadTemplate() {
    const selector = document.getElementById('template-selector');
    const templateId = selector.value;

    const btnDuplicate = document.getElementById('btn-duplicate');
    const btnDelete = document.getElementById('btn-delete');

    if (!templateId) {
        document.getElementById('form-fields').innerHTML = `
            <p class="text-muted text-center py-4 small">
                <i class="bi bi-info-circle me-2"></i>Selecione um template
            </p>
        `;
        document.getElementById('empty-preview').style.display = 'flex';
        document.getElementById('pdf-preview').style.display = 'none';
        document.getElementById('btn-generate').disabled = true;
        if (btnDuplicate) btnDuplicate.disabled = true;
        if (btnDelete) btnDelete.disabled = true;
        return;
    }

    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    state.currentTemplate = template;
    state.formData = {};

    if (btnDuplicate) btnDuplicate.disabled = false;
    if (btnDelete) btnDelete.disabled = false;

    try {
        const pdfData = base64ToArrayBuffer(template.pdfData);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        state.pdfDocument = await loadingTask.promise;

        await renderPreviewPDF();

        document.getElementById('empty-preview').style.display = 'none';
        document.getElementById('pdf-preview').style.display = 'inline-block';
    } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        showToast('Erro ao carregar PDF do template', 'danger');
    }

    renderFormFields(template.fields);
    updateFillProgress();

    document.getElementById('btn-generate').disabled = false;
}

// Duplicate current template
function duplicateCurrentTemplate() {
    if (!state.currentTemplate) return;

    const copy = {
        id: 'template_' + Date.now(),
        name: state.currentTemplate.name + ' (Cópia)',
        fields: JSON.parse(JSON.stringify(state.currentTemplate.fields)),
        pdfData: state.currentTemplate.pdfData,
        createdAt: new Date().toISOString()
    };

    state.templates.push(copy);
    saveTemplates();
    updateTemplateSelector();
    
    showToast(`Template "${copy.name}" duplicado!`, 'success');
}

// Delete current template
function deleteCurrentTemplate() {
    if (!state.currentTemplate) return;

    if (confirm(`Excluir template "${state.currentTemplate.name}"?`)) {
        state.templates = state.templates.filter(t => t.id !== state.currentTemplate.id);
        saveTemplates();
        updateTemplateSelector();
        
        state.currentTemplate = null;
        document.getElementById('template-selector').value = '';
        loadTemplate();
        
        showToast('Template excluído', 'info');
    }
}

// Render preview PDF
async function renderPreviewPDF() {
    if (!state.pdfDocument) return;

    try {
        const page = await state.pdfDocument.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.getElementById('pdf-preview-render');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const overlay = document.getElementById('preview-overlay');
        overlay.style.width = viewport.width + 'px';
        overlay.style.height = viewport.height + 'px';

        renderPreviewOverlay();
    } catch (error) {
        console.error('Erro ao renderizar preview:', error);
    }
}

// Render form fields
function renderFormFields(fields) {
    const container = document.getElementById('form-fields');
    if (!container) return;
    
    container.innerHTML = '';

    fields.forEach(field => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'mb-2';

        const label = document.createElement('label');
        label.className = 'form-label small mb-1';
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
                input.className = 'form-control form-control-sm';
                input.id = field.id;
                input.placeholder = field.placeholder || '';
                if (field.type === 'date') {
                    input.value = new Date().toISOString().split('T')[0]; // Auto-fill today
                    state.formData[field.id] = input.value;
                }
                break;

            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'form-control form-control-sm';
                input.id = field.id;
                input.rows = 2;
                input.placeholder = field.placeholder || '';
                break;

            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'form-check-input';
                input.id = field.id;
                fieldGroup.className += ' form-check';
                break;

            case 'signature':
                input = document.createElement('button');
                input.type = 'button';
                input.className = 'btn btn-outline-secondary btn-sm w-100';
                input.innerHTML = '<i class="bi bi-pen me-1"></i>Clicar para assinar';
                input.onclick = () => openSignaturePad(field.id);
                break;

            case 'image':
                input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.className = 'form-control form-control-sm';
                input.id = field.id;
                break;

            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control form-control-sm';
                input.id = field.id;
        }

        if (field.type !== 'signature') {
            input.addEventListener('input', (e) => {
                if (field.type === 'checkbox') {
                    state.formData[field.id] = e.target.checked;
                } else if (field.type === 'image') {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            state.formData[field.id] = event.target.result;
                            renderPreviewOverlay();
                        };
                        reader.readAsDataURL(file);
                    }
                } else {
                    state.formData[field.id] = e.target.value;
                }
                renderPreviewOverlay();
                updateFillProgress();
            });

            input.addEventListener('change', () => {
                updateFillProgress();
            });
        }

        if (field.type === 'checkbox') {
            fieldGroup.appendChild(input);
            fieldGroup.appendChild(label);
        } else {
            fieldGroup.appendChild(label);
            fieldGroup.appendChild(input);
        }

        container.appendChild(fieldGroup);
    });
}

// Update fill progress
function updateFillProgress() {
    if (!state.currentTemplate) return;

    const totalFields = state.currentTemplate.fields.length;
    const filledFields = state.currentTemplate.fields.filter(f => {
        const value = state.formData[f.id];
        if (f.type === 'checkbox') return value !== undefined;
        return value && value.toString().trim() !== '';
    }).length;

    const progressEl = document.getElementById('fill-progress');
    if (progressEl) {
        progressEl.textContent = `${filledFields}/${totalFields}`;
    }
}

// Initialize signature canvas
function initializeSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;

    state.signatureCanvas = canvas;
    state.signatureContext = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Drawing
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;

        state.signatureContext.beginPath();
        state.signatureContext.moveTo(lastX, lastY);
        state.signatureContext.lineTo(currentX, currentY);
        state.signatureContext.strokeStyle = '#000';
        state.signatureContext.lineWidth = 2;
        state.signatureContext.lineCap = 'round';
        state.signatureContext.stroke();

        lastX = currentX;
        lastY = currentY;
    };

    const stopDrawing = () => {
        isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

// Open signature pad
function openSignaturePad(fieldId) {
    state.currentSignatureFieldId = fieldId;
    clearSignature();
    const modal = new bootstrap.Modal(document.getElementById('signatureModal'));
    modal.show();
}

// Clear signature
function clearSignature() {
    if (!state.signatureCanvas) return;
    state.signatureContext.clearRect(0, 0, state.signatureCanvas.width, state.signatureCanvas.height);
}

// Save signature
function saveSignature() {
    if (!state.currentSignatureFieldId) return;

    const dataURL = state.signatureCanvas.toDataURL('image/png');
    state.formData[state.currentSignatureFieldId] = dataURL;

    // Update button
    const btn = document.getElementById(state.currentSignatureFieldId);
    if (btn && btn.tagName === 'BUTTON') {
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Assinado';
        btn.classList.remove('btn-outline-secondary');
        btn.classList.add('btn-success');
    }

    renderPreviewOverlay();
    updateFillProgress();

    bootstrap.Modal.getInstance(document.getElementById('signatureModal')).hide();
}

// Render preview overlay with form data
function renderPreviewOverlay() {
    if (!state.currentTemplate) return;

    const overlay = document.getElementById('preview-overlay');
    if (!overlay) return;
    
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
        } else if (field.type === 'signature' || field.type === 'image') {
            if (value) {
                const img = document.createElement('img');
                img.src = value;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                fieldEl.appendChild(img);
            }
        } else {
            fieldEl.textContent = value;
        }

        overlay.appendChild(fieldEl);
    });
}

// Generate PDF
async function generatePDF() {
    if (!state.currentTemplate) {
        showToast('Selecione um template primeiro', 'warning');
        return;
    }

    showToast('Gerando PDF...', 'info');

    try {
        const pdfData = base64ToArrayBuffer(state.currentTemplate.pdfData);
        const pdfDoc = await PDFLib.PDFDocument.load(pdfData);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Add fields to PDF
        for (const field of state.currentTemplate.fields) {
            const value = state.formData[field.id];
            if (!value && field.type !== 'checkbox') continue;

            const { height } = firstPage.getSize();
            const pdfX = field.x;
            const pdfY = height - field.y - field.height;

            if (field.type === 'checkbox') {
                firstPage.drawText(value ? '☑' : '☐', {
                    x: pdfX,
                    y: pdfY,
                    size: 20
                });
            } else if (field.type === 'signature' || field.type === 'image') {
                if (value && value.startsWith('data:image')) {
                    try {
                        const imageBytes = Uint8Array.from(
                            atob(value.split(',')[1]),
                            c => c.charCodeAt(0)
                        );
                        
                        const image = value.includes('png') 
                            ? await pdfDoc.embedPng(imageBytes)
                            : await pdfDoc.embedJpg(imageBytes);

                        const scale = Math.min(
                            field.width / image.width,
                            field.height / image.height
                        );

                        firstPage.drawImage(image, {
                            x: pdfX,
                            y: pdfY,
                            width: image.width * scale,
                            height: image.height * scale
                        });
                    } catch (error) {
                        console.error('Erro ao adicionar imagem:', error);
                    }
                }
            } else {
                const text = String(value);
                const lines = text.split('\n');
                
                lines.forEach((line, index) => {
                    firstPage.drawText(line, {
                        x: pdfX,
                        y: pdfY - (index * field.fontSize),
                        size: field.fontSize
                    });
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentTemplate.name}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();

        URL.revokeObjectURL(url);

        savePDFToHistory(state.currentTemplate.name, blob);
        showToast('PDF gerado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showToast('Erro ao gerar PDF: ' + error.message, 'danger');
    }
}

// Clear form
function clearForm() {
    state.formData = {};

    const inputs = document.querySelectorAll('#form-fields input, #form-fields textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });

    const signatureBtns = document.querySelectorAll('#form-fields button');
    signatureBtns.forEach(btn => {
        if (btn.innerHTML.includes('Assinado')) {
            btn.innerHTML = '<i class="bi bi-pen me-1"></i>Clicar para assinar';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        }
    });

    renderPreviewOverlay();
    updateFillProgress();
    showToast('Formulário limpo', 'info');
}

// Switch mode
function switchMode(mode) {
    state.currentMode = mode;
    closeMobileMenu();
    console.log('Modo:', mode);
}

// Zoom controls
function zoomIn() {
    state.zoom = Math.min(state.zoom + 0.1, 2.0);
    updateZoom();
}

function zoomOut() {
    state.zoom = Math.max(state.zoom - 0.1, 0.5);
    updateZoom();
}

function updateZoom() {
    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel) {
        zoomLevel.textContent = Math.round(state.zoom * 100) + '%';
    }
    if (state.currentMode === 'design' && state.pdfDocument) {
        renderPDFPage(1);
    }
}

function togglePreviewZoom() {
    // Toggle between normal and fit-to-screen
    const preview = document.getElementById('pdf-preview');
    if (preview) {
        preview.classList.toggle('fit-screen');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    const toastBody = document.getElementById('toast-message');

    if (!toastEl || !toastBody) return;

    toastBody.textContent = message;

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

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// Load sample hospital templates
function loadSampleTemplates() {
    // Only add samples if no templates exist
    if (state.templates.length > 0) return;

    console.log('Carregando templates de exemplo...');
    // Sample templates would go here (PDF data would be added by user)
}

console.log('DocsHgumba app.js carregado! Versão Mobile Otimizada com Assinatura e Modo Escuro');
