// DocsHgumba - App Logic
// Sistema 100% offline para geração de PDFs editáveis

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
    isDragging: false,
    draggedFieldType: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DocsHgumba iniciado!');
    loadTemplates();
    initializeEventListeners();
});

// Load templates from localStorage
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

// Save templates to localStorage
function saveTemplates() {
    try {
        localStorage.setItem('docsHgumbaTemplates', JSON.stringify(state.templates));
        console.log('Templates salvos com sucesso');
    } catch (error) {
        console.error('Erro ao salvar templates:', error);
        showToast('Erro ao salvar templates', 'danger');
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    // PDF Upload
    const uploadInput = document.getElementById('pdf-upload');
    const uploadZone = document.getElementById('upload-zone');

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

    // Field Library drag start
    const fieldTypes = document.querySelectorAll('.field-type');
    fieldTypes.forEach(fieldType => {
        fieldType.addEventListener('click', () => {
            const type = fieldType.getAttribute('data-type');
            addFieldToCanvas(type);
        });
    });

    // Canvas click to drop field
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.addEventListener('click', handleCanvasClick);
}

// Handle PDF Upload
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

// Add field to canvas
function addFieldToCanvas(type) {
    if (!state.currentPDF) {
        showToast('Carregue um PDF primeiro!', 'warning');
        return;
    }

    const canvas = document.getElementById('pdf-render');
    const canvasRect = canvas.getBoundingClientRect();

    const field = {
        id: 'field_' + Date.now(),
        type: type,
        name: `${type}_${state.fields.length + 1}`,
        x: 100,
        y: 100,
        width: type === 'checkbox' ? 20 : 200,
        height: type === 'textarea' ? 80 : 30,
        fontSize: 12,
        required: false
    };

    state.fields.push(field);
    renderFields();
    showToast(`Campo ${type} adicionado`, 'success');
}

// Handle canvas click
function handleCanvasClick(event) {
    // Check if clicked on a field
    const target = event.target;
    if (target.classList.contains('field-overlay')) {
        const fieldId = target.getAttribute('data-field-id');
        selectField(fieldId);
    }
}

// Render fields on canvas
function renderFields() {
    const overlay = document.getElementById('fields-overlay');
    overlay.innerHTML = '';

    state.fields.forEach(field => {
        const fieldEl = document.createElement('div');
        fieldEl.className = 'field-overlay';
        fieldEl.setAttribute('data-field-id', field.id);
        fieldEl.style.left = field.x + 'px';
        fieldEl.style.top = field.y + 'px';
        fieldEl.style.width = field.width + 'px';
        fieldEl.style.height = field.height + 'px';
        fieldEl.style.pointerEvents = 'auto';

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

        // Make draggable
        makeDraggable(fieldEl, field);

        overlay.appendChild(fieldEl);
    });
}

// Make field draggable
function makeDraggable(element, field) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = field.x;
        initialY = field.y;
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        field.x = Math.max(0, initialX + dx);
        field.y = Math.max(0, initialY + dy);

        element.style.left = field.x + 'px';
        element.style.top = field.y + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
        }
    });
}

// Delete field
function deleteField(fieldId) {
    state.fields = state.fields.filter(f => f.id !== fieldId);
    renderFields();
    showToast('Campo removido', 'info');
}

// Select field
function selectField(fieldId) {
    console.log('Campo selecionado:', fieldId);
    // Future: show properties panel
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
    state.fields = [];
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
        return;
    }

    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    state.currentTemplate = template;
    state.formData = {};

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

// Render form fields
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
                break;

            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'form-control';
                input.id = field.id;
                input.rows = 3;
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
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.id = field.id;
                input.placeholder = 'Digite seu nome para assinar';
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
}

// Render preview overlay with form data
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

    renderPreviewOverlay();
    showToast('Formulário limpo', 'info');
}

// Switch mode
function switchMode(mode) {
    state.currentMode = mode;
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
    document.getElementById('zoom-level').textContent = Math.round(state.zoom * 100) + '%';
    if (state.currentMode === 'design' && state.pdfDocument) {
        renderPDFPage(1);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    const toastBody = document.getElementById('toast-message');

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

console.log('DocsHgumba app.js carregado!');
