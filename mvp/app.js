// DocsHgumba MVP - Simplified PDF Template System
// 100% Offline - No Authentication - Basic Features Only

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '../assets/js/pdf.worker.min.js';

// ==================== GLOBAL STATE ====================
const state = {
    currentPDF: null,           // Current PDF ArrayBuffer
    pdfDocument: null,          // PDF.js document
    templates: [],              // All templates
    currentTemplate: null,      // Template being edited/filled
    fields: [],                 // Fields in current template
    selectedFieldId: null,      // Currently selected field
    formData: {},               // Form data when filling
    signatureFieldId: null,     // Field ID for signature being drawn
    signatureCanvas: null,      // Signature canvas element
    signatureContext: null      // Signature canvas context
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DocsHgumba MVP initialized!');
    loadTemplates();
    renderTemplatesList();
    initializeEventListeners();
    initializeSignatureCanvas();
});

function initializeEventListeners() {
    // PDF Upload
    document.getElementById('pdf-upload').addEventListener('change', handlePDFUpload);

    // Field property changes
    document.getElementById('field-name')?.addEventListener('input', updateSelectedFieldProperty);
    document.getElementById('field-width')?.addEventListener('input', updateSelectedFieldProperty);
    document.getElementById('field-height')?.addEventListener('input', updateSelectedFieldProperty);
    document.getElementById('field-fontsize')?.addEventListener('input', updateSelectedFieldProperty);
}

function initializeSignatureCanvas() {
    state.signatureCanvas = document.getElementById('signature-canvas');
    state.signatureContext = state.signatureCanvas.getContext('2d');

    let isDrawing = false;

    state.signatureCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = state.signatureCanvas.getBoundingClientRect();
        state.signatureContext.beginPath();
        state.signatureContext.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    state.signatureCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = state.signatureCanvas.getBoundingClientRect();
        state.signatureContext.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        state.signatureContext.stroke();
    });

    state.signatureCanvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    state.signatureCanvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
}

// ==================== NAVIGATION ====================
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show selected page
    document.getElementById(`page-${page}`).classList.add('active');

    // Special actions per page
    if (page === 'templates') {
        renderTemplatesList();
    } else if (page === 'criar') {
        resetCreatePage();
    } else if (page === 'preencher') {
        populateTemplateSelector();
    }
}

// ==================== TEMPLATE LIST ====================
function loadTemplates() {
    const stored = localStorage.getItem('mvpTemplates');
    state.templates = stored ? JSON.parse(stored) : [];
}

function saveTemplates() {
    localStorage.setItem('mvpTemplates', JSON.stringify(state.templates));
}

function renderTemplatesList() {
    const container = document.getElementById('templates-list');
    const emptyState = document.getElementById('empty-state');

    if (state.templates.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    container.innerHTML = state.templates.map(template => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="bi bi-file-earmark-pdf text-primary"></i>
                        ${template.name}
                    </h5>
                    <p class="text-muted small mb-3">
                        ${template.fields.length} campos • Criado em ${new Date(template.createdAt).toLocaleDateString()}
                    </p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-primary" onclick="fillTemplate('${template.id}')">
                            <i class="bi bi-pencil"></i> Preencher
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="editTemplate('${template.id}')">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTemplate('${template.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteTemplate(templateId) {
    if (!confirm('Deseja realmente excluir este template?')) return;

    state.templates = state.templates.filter(t => t.id !== templateId);
    saveTemplates();
    renderTemplatesList();
    showToast('Template excluído com sucesso!');
}

function editTemplate(templateId) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    state.currentTemplate = template;
    state.fields = [...template.fields];

    navigateTo('criar');

    // Load PDF
    const pdfData = base64ToArrayBuffer(template.pdfData);
    state.currentPDF = pdfData;
    renderPDF(pdfData, 'pdf-canvas');

    // Set template name
    document.getElementById('template-name').value = template.name;

    // Show sections
    document.getElementById('fields-section').style.display = 'block';
    document.getElementById('save-section').style.display = 'block';

    // Render fields
    renderFieldsOnCanvas();
}

function fillTemplate(templateId) {
    navigateTo('preencher');
    setTimeout(() => {
        document.getElementById('template-select').value = templateId;
        loadTemplateForFill();
    }, 100);
}

// ==================== CREATE TEMPLATE ====================
function resetCreatePage() {
    state.currentPDF = null;
    state.pdfDocument = null;
    state.currentTemplate = null;
    state.fields = [];
    state.selectedFieldId = null;

    document.getElementById('pdf-upload').value = '';
    document.getElementById('template-name').value = '';
    document.getElementById('fields-section').style.display = 'none';
    document.getElementById('save-section').style.display = 'none';
    document.getElementById('properties-panel').style.display = 'none';
    document.getElementById('fields-overlay').innerHTML = '';

    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        state.currentPDF = e.target.result;
        await renderPDF(e.target.result, 'pdf-canvas');

        // Show field tools
        document.getElementById('fields-section').style.display = 'block';
        document.getElementById('save-section').style.display = 'block';

        showToast('PDF carregado com sucesso!');
    };
    reader.readAsArrayBuffer(file);
}

async function renderPDF(pdfData, canvasId) {
    const loadingTask = pdfjsLib.getDocument(pdfData);
    const pdf = await loadingTask.promise;
    state.pdfDocument = pdf;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;
}

function addField(type) {
    const fieldId = 'field_' + Date.now();
    const field = {
        id: fieldId,
        type: type,
        name: `Campo ${type}`,
        x: 50,
        y: 50,
        width: type === 'signature' ? 200 : 150,
        height: type === 'textarea' ? 80 : type === 'signature' ? 60 : 30,
        fontSize: 12
    };

    state.fields.push(field);
    renderFieldsOnCanvas();
    selectField(fieldId);
    showToast(`Campo "${type}" adicionado!`);
}

function renderFieldsOnCanvas() {
    const overlay = document.getElementById('fields-overlay');
    overlay.innerHTML = '';

    state.fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'field-box';
        fieldDiv.id = `field-${field.id}`;
        fieldDiv.style.left = field.x + 'px';
        fieldDiv.style.top = field.y + 'px';
        fieldDiv.style.width = field.width + 'px';
        fieldDiv.style.height = field.height + 'px';

        const icon = getFieldIcon(field.type);
        fieldDiv.innerHTML = `
            <div class="field-label">${icon} ${field.name}</div>
        `;

        fieldDiv.addEventListener('click', () => selectField(field.id));
        makeDraggable(fieldDiv, field.id);

        overlay.appendChild(fieldDiv);
    });
}

function getFieldIcon(type) {
    const icons = {
        text: '<i class="bi bi-input-cursor-text"></i>',
        textarea: '<i class="bi bi-textarea-t"></i>',
        date: '<i class="bi bi-calendar"></i>',
        checkbox: '<i class="bi bi-check-square"></i>',
        signature: '<i class="bi bi-pencil"></i>'
    };
    return icons[type] || '<i class="bi bi-question"></i>';
}

function makeDraggable(element, fieldId) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('field-label')) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const field = state.fields.find(f => f.id === fieldId);
            initialX = field.x;
            initialY = field.y;
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const field = state.fields.find(f => f.id === fieldId);
        field.x = initialX + deltaX;
        field.y = initialY + deltaY;

        element.style.left = field.x + 'px';
        element.style.top = field.y + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
        }
    });
}

function selectField(fieldId) {
    state.selectedFieldId = fieldId;

    // Highlight selected field
    document.querySelectorAll('.field-box').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById(`field-${fieldId}`)?.classList.add('selected');

    // Show properties panel
    const field = state.fields.find(f => f.id === fieldId);
    if (!field) return;

    document.getElementById('properties-panel').style.display = 'block';
    document.getElementById('field-name').value = field.name;
    document.getElementById('field-width').value = field.width;
    document.getElementById('field-height').value = field.height;
    document.getElementById('field-fontsize').value = field.fontSize;
}

function updateSelectedFieldProperty() {
    if (!state.selectedFieldId) return;

    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;

    field.name = document.getElementById('field-name').value;
    field.width = parseInt(document.getElementById('field-width').value);
    field.height = parseInt(document.getElementById('field-height').value);
    field.fontSize = parseInt(document.getElementById('field-fontsize').value);

    // Update visual
    const element = document.getElementById(`field-${field.id}`);
    element.style.width = field.width + 'px';
    element.style.height = field.height + 'px';
    element.querySelector('.field-label').innerHTML = `${getFieldIcon(field.type)} ${field.name}`;
}

function deleteSelectedField() {
    if (!state.selectedFieldId) return;

    state.fields = state.fields.filter(f => f.id !== state.selectedFieldId);
    state.selectedFieldId = null;

    document.getElementById('properties-panel').style.display = 'none';
    renderFieldsOnCanvas();
    showToast('Campo excluído!');
}

function saveTemplate() {
    const name = document.getElementById('template-name').value.trim();

    if (!name) {
        alert('Por favor, digite um nome para o template.');
        return;
    }

    if (!state.currentPDF) {
        alert('Por favor, faça upload de um PDF primeiro.');
        return;
    }

    if (state.fields.length === 0) {
        alert('Por favor, adicione pelo menos um campo.');
        return;
    }

    const pdfBase64 = arrayBufferToBase64(state.currentPDF);

    const template = {
        id: state.currentTemplate?.id || 'template_' + Date.now(),
        name: name,
        pdfData: pdfBase64,
        fields: state.fields,
        createdAt: state.currentTemplate?.createdAt || new Date().toISOString()
    };

    if (state.currentTemplate) {
        // Update existing
        const index = state.templates.findIndex(t => t.id === template.id);
        state.templates[index] = template;
    } else {
        // Add new
        state.templates.push(template);
    }

    saveTemplates();
    showToast('Template salvo com sucesso!');

    setTimeout(() => {
        navigateTo('templates');
    }, 1000);
}

// ==================== FILL TEMPLATE ====================
function populateTemplateSelector() {
    const select = document.getElementById('template-select');
    select.innerHTML = '<option value="">Escolha um template...</option>';

    state.templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        select.appendChild(option);
    });
}

async function loadTemplateForFill() {
    const templateId = document.getElementById('template-select').value;
    if (!templateId) {
        document.getElementById('fill-form-container').style.display = 'none';
        return;
    }

    const template = state.templates.find(t => t.id === templateId);
    if (!template) return;

    state.currentTemplate = template;
    state.formData = {};

    // Render PDF preview
    const pdfData = base64ToArrayBuffer(template.pdfData);
    await renderPDF(pdfData, 'preview-canvas');

    // Render form
    renderFillForm();

    document.getElementById('fill-form-container').style.display = 'block';
}

function renderFillForm() {
    const form = document.getElementById('fill-form');
    form.innerHTML = '';

    state.currentTemplate.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.name;
        formGroup.appendChild(label);

        let input;

        if (field.type === 'text') {
            input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
        } else if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-control';
            input.rows = 3;
        } else if (field.type === 'date') {
            input = document.createElement('input');
            input.type = 'date';
            input.className = 'form-control';
        } else if (field.type === 'checkbox') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'form-check-input';
            formGroup.className = 'mb-3 form-check';
            label.className = 'form-check-label';
        } else if (field.type === 'signature') {
            input = document.createElement('button');
            input.type = 'button';
            input.className = 'btn btn-outline-primary';
            input.innerHTML = '<i class="bi bi-pencil"></i> Desenhar Assinatura';
            input.onclick = () => openSignaturePad(field.id);
        }

        input.id = `input-${field.id}`;

        if (field.type !== 'signature') {
            input.addEventListener('input', () => updateFormData(field.id, input));
        }

        formGroup.appendChild(input);
        form.appendChild(formGroup);
    });
}

function updateFormData(fieldId, input) {
    if (input.type === 'checkbox') {
        state.formData[fieldId] = input.checked;
    } else {
        state.formData[fieldId] = input.value;
    }
    updatePreview();
}

function updatePreview() {
    const overlay = document.getElementById('preview-overlay');
    overlay.innerHTML = '';

    state.currentTemplate.fields.forEach(field => {
        const value = state.formData[field.id];
        if (!value && field.type !== 'checkbox') return;

        const fieldDiv = document.createElement('div');
        fieldDiv.style.position = 'absolute';
        fieldDiv.style.left = field.x + 'px';
        fieldDiv.style.top = field.y + 'px';
        fieldDiv.style.width = field.width + 'px';
        fieldDiv.style.height = field.height + 'px';
        fieldDiv.style.fontSize = field.fontSize + 'px';
        fieldDiv.style.overflow = 'hidden';
        fieldDiv.style.pointerEvents = 'none';

        if (field.type === 'checkbox') {
            fieldDiv.innerHTML = value ? '☑' : '☐';
            fieldDiv.style.fontSize = '20px';
        } else if (field.type === 'signature') {
            if (value) {
                const img = document.createElement('img');
                img.src = value;
                img.style.width = '100%';
                img.style.height = '100%';
                fieldDiv.appendChild(img);
            }
        } else {
            fieldDiv.textContent = value;
        }

        overlay.appendChild(fieldDiv);
    });
}

function openSignaturePad(fieldId) {
    state.signatureFieldId = fieldId;
    const modal = new bootstrap.Modal(document.getElementById('signatureModal'));
    modal.show();

    // Clear canvas
    clearSignature();
}

function clearSignature() {
    state.signatureContext.clearRect(0, 0, state.signatureCanvas.width, state.signatureCanvas.height);
}

function saveSignature() {
    const dataURL = state.signatureCanvas.toDataURL();
    state.formData[state.signatureFieldId] = dataURL;

    // Update input display
    const input = document.getElementById(`input-${state.signatureFieldId}`);
    input.innerHTML = '<i class="bi bi-check-circle text-success"></i> Assinatura salva';
    input.disabled = true;

    updatePreview();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('signatureModal'));
    modal.hide();
}

function clearForm() {
    state.formData = {};
    renderFillForm();
    document.getElementById('preview-overlay').innerHTML = '';
}

async function generatePDF() {
    try {
        const pdfData = base64ToArrayBuffer(state.currentTemplate.pdfData);
        const pdfDoc = await PDFLib.PDFDocument.load(pdfData);
        const page = pdfDoc.getPages()[0];
        const { width, height } = page.getSize();

        // Adjust coordinates (PDF coordinates start from bottom-left)
        const canvas = document.getElementById('preview-canvas');
        const scale = width / canvas.width;

        for (const field of state.currentTemplate.fields) {
            const value = state.formData[field.id];
            if (!value && field.type !== 'checkbox') continue;

            const x = field.x * scale;
            const y = height - (field.y * scale) - (field.height * scale);

            if (field.type === 'text' || field.type === 'textarea' || field.type === 'date') {
                page.drawText(String(value), {
                    x: x,
                    y: y + field.height * scale / 2,
                    size: field.fontSize,
                    color: PDFLib.rgb(0, 0, 0)
                });
            } else if (field.type === 'checkbox') {
                if (value) {
                    page.drawText('X', {
                        x: x,
                        y: y,
                        size: 16,
                        color: PDFLib.rgb(0, 0, 0)
                    });
                }
            } else if (field.type === 'signature' && value) {
                const imgData = value.split(',')[1];
                const img = await pdfDoc.embedPng(imgData);
                page.drawImage(img, {
                    x: x,
                    y: y,
                    width: field.width * scale,
                    height: field.height * scale
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${state.currentTemplate.name}_${Date.now()}.pdf`;
        link.click();

        showToast('PDF gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar PDF. Verifique o console.');
    }
}

// ==================== UTILITIES ====================
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = '#28a745';
    toast.style.color = 'white';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
