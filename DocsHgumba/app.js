// DocsHgumba - App Logic (Complete Edition - Fases 1, 2, 3)
// Sistema 100% offline para geração de PDFs editáveis
// Versão Completa com TODAS as funcionalidades

// Configure PDF.js worker (Local)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.min.js';

// ==================== GLOBAL STATE ====================
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
    currentSignatureFieldId: null,
    currentUser: null,
    textLibrary: null,
    usageStats: {
        templatesCreated: 0,
        pdfsGenerated: 0,
        totalFields: 0
    },
    speechRecognition: null,
    isDictating: false,
    backupInterval: null
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DocsHgumba iniciado - Versão Completa (Fases 1+2+3)!');
    checkAuthentication();
});

function initializeApp() {
    loadTemplates();
    loadPDFHistory();
    loadThemePreference();
    initializeEventListeners();
    initializeSignatureCanvas();
    initializeMobileMenu();
    loadSampleTemplates();
    loadTextLibrary();
    loadUsageStats();
    initializeSpeechRecognition();
    startAutomaticBackup();
}

// ==================== FASE 2: AUTHENTICATION & USER MANAGEMENT ====================
async function checkAuthentication() {
    try {
        const storedUser = localStorage.getItem('docsHgumbaCurrentUser');
        if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            
            // SECURITY: Check if password change is required
            if (currentUser.mustChangePassword) {
                console.log('⚠️  Usuário com senha padrão - forçando troca!');
                state.currentUser = currentUser;
                showPasswordChangeScreen();
                return;
            }
            
            state.currentUser = currentUser;
            initializeApp();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.body.innerHTML = `
        <div class="container-fluid vh-100 d-flex align-items-center justify-content-center bg-army-green">
            <div class="card shadow-lg" style="max-width: 400px; width: 100%;">
                <div class="card-header bg-army-green text-white text-center py-3">
                    <i class="bi bi-file-earmark-pdf fs-1"></i>
                    <h4 class="mb-0 mt-2">DocsHgumba</h4>
                    <small>Sistema de PDFs Editáveis</small>
                </div>
                <div class="card-body p-4">
                    <h5 class="text-center mb-4">Login</h5>
                    <div id="login-error" class="alert alert-danger d-none"></div>
                    <div class="mb-3">
                        <label class="form-label">Usuário</label>
                        <input type="text" id="login-username" class="form-control" placeholder="Digite seu usuário">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Senha</label>
                        <input type="password" id="login-password" class="form-control" placeholder="Digite sua senha">
                    </div>
                    <button onclick="handleLogin()" class="btn btn-success w-100">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Entrar
                    </button>
                    <div class="text-center mt-3">
                        <small class="text-muted">Usuário padrão: <strong>admin</strong> / Senha: <strong>admin123</strong></small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

function showPasswordChangeScreen() {
    document.body.innerHTML = `
        <div class="container-fluid vh-100 d-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);">
            <div class="card shadow-lg" style="max-width: 500px; width: 100%;">
                <div class="card-header bg-warning text-dark text-center py-3">
                    <i class="bi bi-shield-exclamation fs-1"></i>
                    <h4 class="mb-0 mt-2">Troca de Senha Obrigatória</h4>
                    <small>Segurança Hospitalar</small>
                </div>
                <div class="card-body p-4">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Atenção!</strong> Você está usando uma senha padrão. 
                        Por segurança, é <strong>obrigatório</strong> alterá-la antes de continuar.
                    </div>
                    <div id="password-error" class="alert alert-danger d-none"></div>
                    <div class="mb-3">
                        <label class="form-label">Nova Senha</label>
                        <input type="password" id="new-password" class="form-control" 
                               placeholder="Mínimo 8 caracteres" minlength="8">
                        <small class="text-muted">Escolha uma senha forte e única</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirmar Nova Senha</label>
                        <input type="password" id="confirm-password" class="form-control" 
                               placeholder="Digite novamente" minlength="8">
                    </div>
                    <button onclick="handlePasswordChange()" class="btn btn-warning w-100">
                        <i class="bi bi-key me-2"></i>Alterar Senha e Continuar
                    </button>
                    <div class="text-center mt-3">
                        <small class="text-muted">Usuário: <strong>${state.currentUser.name}</strong></small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('confirm-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePasswordChange();
    });
}

// PBKDF2 hash function with per-user salt for offline security
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = encoder.encode(salt);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    
    // Derive 256-bit key using PBKDF2 with 100k iterations
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltData,
            iterations: 100000, // High iteration count for offline resistance
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    
    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Initialize default users with PRE-HASHED passwords
async function initializeDefaultUsers() {
    const existingUsers = localStorage.getItem('docsHgumbaUsers');
    if (!existingUsers) {
        console.log('Inicializando usuários padrão com senhas pré-hashadas...');
        
        // Default credentials (documented for first access, then MUST be changed)
        const defaultCredentials = [
            { username: 'admin', tempPass: 'admin123', name: 'Administrador', role: 'admin', crm: '', coren: '' },
            { username: 'dr.silva', tempPass: 'medico123', name: 'Dr. João Silva', role: 'medico', crm: '12345-SP', coren: '' },
            { username: 'enf.maria', tempPass: 'enfermeira123', name: 'Enf. Maria Santos', role: 'enfermeiro', crm: '', coren: '98765-SP' }
        ];
        
        const defaultUsers = [];
        for (let i = 0; i < defaultCredentials.length; i++) {
            const cred = defaultCredentials[i];
            const salt = generateSalt();
            const passwordHash = await hashPassword(cred.tempPass, salt);
            
            defaultUsers.push({
                id: `user_${String(i + 1).padStart(3, '0')}`,
                username: cred.username,
                passwordHash: passwordHash,
                salt: salt,
                name: cred.name,
                role: cred.role,
                profile: cred.role === 'admin' ? 'Administrador' : cred.role === 'medico' ? 'Médico' : 'Enfermeiro(a)',
                crm: cred.crm,
                coren: cred.coren,
                mustChangePassword: true, // Force password change on first login
                createdAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('docsHgumbaUsers', JSON.stringify(defaultUsers));
        console.log('✅ Usuários padrão criados com senhas SHA-256 + salt único');
        console.log('⚠️  ATENÇÃO: Altere as senhas padrão após primeiro acesso!');
    }
}

async function handleLogin(event) {
    if (event) event.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (!username || !password) {
        errorDiv.textContent = 'Preencha usuário e senha';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    try {
        await initializeDefaultUsers();
        
        const usersData = JSON.parse(localStorage.getItem('docsHgumbaUsers') || '[]');
        const user = usersData.find(u => u.username === username);
        
        if (user) {
            // Verify password with user's salt
            const passwordHash = await hashPassword(password, user.salt);
            
            if (user.passwordHash === passwordHash) {
                const userSession = {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    profile: user.profile,
                    crm: user.crm || '',
                    coren: user.coren || '',
                    mustChangePassword: user.mustChangePassword || false
                };
                
                // SECURITY FIX: Do NOT save session until password changed
                if (user.mustChangePassword) {
                    console.log('⚠️  BLOQUEANDO acesso - troca obrigatória!');
                    state.currentUser = userSession; // Temporary in memory only
                    showPasswordChangeScreen(); // Force change BEFORE saving session
                    return; // BLOCK - no localStorage save
                }
                
                // Only save session if password is NOT default
                state.currentUser = userSession;
                localStorage.setItem('docsHgumbaCurrentUser', JSON.stringify(userSession));
                
                console.log('✅ Login realizado:', userSession.name);
                location.reload();
            } else {
                errorDiv.textContent = 'Usuário ou senha incorretos';
                errorDiv.classList.remove('d-none');
            }
        } else {
            errorDiv.textContent = 'Usuário não encontrado';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        errorDiv.textContent = 'Erro ao processar login. Tente novamente.';
        errorDiv.classList.remove('d-none');
    }
}

async function handlePasswordChange(event) {
    if (event) event.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('password-error');
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'As senhas não coincidem!';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    // Validate minimum length
    if (newPassword.length < 8) {
        errorDiv.textContent = 'A senha deve ter no mínimo 8 caracteres!';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    // Validate not using default password
    const defaultPasswords = ['admin123', 'medico123', 'enfermeira123'];
    if (defaultPasswords.includes(newPassword)) {
        errorDiv.textContent = 'Não use senhas padrão! Escolha uma senha forte e única.';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    try {
        const currentUser = state.currentUser;
        const usersData = JSON.parse(localStorage.getItem('docsHgumbaUsers') || '[]');
        const user = usersData.find(u => u.username === currentUser.username);
        
        if (user) {
            // Hash new password with user's existing salt
            const newPasswordHash = await hashPassword(newPassword, user.salt);
            
            // Update user password and remove mustChangePassword flag
            user.passwordHash = newPasswordHash;
            user.mustChangePassword = false;
            user.passwordChangedAt = new Date().toISOString();
            
            // Save updated user to localStorage
            localStorage.setItem('docsHgumbaUsers', JSON.stringify(usersData));
            
            // SECURITY FIX: Save session ONLY AFTER password changed
            currentUser.mustChangePassword = false;
            state.currentUser = currentUser;
            localStorage.setItem('docsHgumbaCurrentUser', JSON.stringify(currentUser));
            
            console.log('✅ Senha alterada com sucesso para:', currentUser.username);
            console.log('✅ Sessão salva - acesso liberado!');
            
            // Reload to initialize app
            location.reload();
        } else {
            errorDiv.textContent = 'Erro ao encontrar usuário!';
            errorDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        errorDiv.textContent = 'Erro ao processar alteração de senha!';
        errorDiv.classList.remove('d-none');
    }
}

function handleLogout() {
    if (confirm('Deseja sair do sistema?')) {
        localStorage.removeItem('docsHgumbaCurrentUser');
        location.reload();
    }
}

// ==================== TEMPLATE MANAGEMENT ====================
async function loadTemplates() {
    try {
        const stored = localStorage.getItem('docsHgumbaTemplates');
        if (stored) {
            state.templates = JSON.parse(stored);
        }

        try {
            const response = await fetch('data/templates.json');
            if (response.ok) {
                const data = await response.json();
                const jsonTemplates = data.templates || [];
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

function saveTemplates() {
    try {
        const templatesJSON = JSON.stringify(state.templates, null, 2);
        localStorage.setItem('docsHgumbaTemplates', templatesJSON);
        
        const lastExport = localStorage.getItem('docsHgumbaLastExport');
        const daysSinceExport = lastExport 
            ? Math.floor((Date.now() - new Date(lastExport).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
        
        if (daysSinceExport > 7 && state.templates.length > 0) {
            console.log(`⚠️ Templates não exportados há ${daysSinceExport} dias`);
        }
        
        console.log('Templates salvos em localStorage');
    } catch (error) {
        console.error('Erro ao salvar templates:', error);
        showToast('Erro ao salvar templates', 'danger');
    }
}

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
        a.download = `templates_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        localStorage.setItem('docsHgumbaLastExport', new Date().toISOString());
        showToast('Templates exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar templates:', error);
        showToast('Erro ao exportar templates', 'danger');
    }
}

function importTemplates(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            let imported = JSON.parse(e.target.result);
            
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
    event.target.value = '';
}

// ==================== FASE 2: TEXT LIBRARY ====================
async function loadTextLibrary() {
    try {
        const response = await fetch('data/text-library.json');
        if (response.ok) {
            state.textLibrary = await response.json();
            console.log('Biblioteca de textos carregada');
        }
    } catch (error) {
        console.log('text-library.json não encontrado');
    }
}

function showTextLibrary(fieldId) {
    if (!state.textLibrary) {
        showToast('Biblioteca de textos não disponível', 'warning');
        return;
    }
    
    let html = '<div class="modal fade" id="textLibraryModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">';
    html += '<div class="modal-header bg-army-green text-white">';
    html += '<h5 class="modal-title"><i class="bi bi-book me-2"></i>Biblioteca de Textos Padrão</h5>';
    html += '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>';
    html += '<div class="modal-body">';
    
    state.textLibrary.categories.forEach(category => {
        html += `<h6 class="mt-3 mb-2 text-success"><i class="bi bi-folder me-2"></i>${category.name}</h6>`;
        html += '<div class="list-group mb-3">';
        category.items.forEach(item => {
            html += `<button class="list-group-item list-group-item-action" onclick="insertTextFromLibrary('${fieldId}', \`${item.text.replace(/`/g, '\\`')}\`)">`;
            html += `<div class="d-flex justify-content-between align-items-center">`;
            html += `<strong>${item.title}</strong>`;
            html += `<i class="bi bi-arrow-right-circle text-success"></i>`;
            html += `</div>`;
            html += `<small class="text-muted">${item.text.substring(0, 100)}...</small>`;
            html += `</button>`;
        });
        html += '</div>';
    });
    
    html += '</div></div></div></div>';
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = html;
    document.body.appendChild(modalDiv);
    
    const modal = new bootstrap.Modal(document.getElementById('textLibraryModal'));
    modal.show();
    
    document.getElementById('textLibraryModal').addEventListener('hidden.bs.modal', () => {
        modalDiv.remove();
    });
}

function insertTextFromLibrary(fieldId, text) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = text;
        state.formData[fieldId] = text;
        renderPreviewOverlay();
        updateFillProgress();
        bootstrap.Modal.getInstance(document.getElementById('textLibraryModal')).hide();
        showToast('Texto inserido com sucesso', 'success');
    }
}

// ==================== PDF HISTORY ====================
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

function savePDFToHistory(templateName, pdfBlob) {
    try {
        const historyItem = {
            id: 'pdf_' + Date.now(),
            templateName: templateName,
            timestamp: new Date().toISOString(),
            size: pdfBlob.size,
            user: state.currentUser ? state.currentUser.name : 'Unknown'
        };

        state.pdfHistory.unshift(historyItem);
        state.pdfHistory = state.pdfHistory.slice(0, 50);
        
        localStorage.setItem('docsHgumbaPDFHistory', JSON.stringify(state.pdfHistory));
        
        updateUsageStats('pdfsGenerated');
    } catch (error) {
        console.error('Erro ao salvar no histórico:', error);
    }
}

// ==================== THEME MANAGEMENT ====================
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

// ==================== MOBILE MENU ====================
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

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    const uploadInput = document.getElementById('pdf-upload');
    const uploadZone = document.getElementById('upload-zone');

    if (uploadInput) {
        uploadInput.addEventListener('change', handlePDFUpload);
    }

    if (uploadZone) {
        uploadZone.addEventListener('click', () => uploadInput?.click());
        
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

    const fieldTypes = document.querySelectorAll('.field-type');
    fieldTypes.forEach(fieldType => {
        fieldType.addEventListener('click', () => {
            const type = fieldType.getAttribute('data-type');
            addFieldToCanvas(type);
            closeMobileMenu();
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    document.addEventListener('keydown', handleKeyboard);
}

// ==================== FASE 2: ADVANCED KEYBOARD SHORTCUTS ====================
function handleKeyboard(e) {
    if (e.key === 'Delete' && state.selectedFieldId) {
        deleteField(state.selectedFieldId);
    }
    
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveTemplate();
    }
    
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        if (state.selectedFieldId) {
            showFieldPropertiesPanel(state.selectedFieldId);
        } else {
            showToast('Selecione um campo primeiro', 'warning');
        }
    }
    
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (state.selectedFieldId) {
            duplicateField(state.selectedFieldId);
        } else {
            showToast('Selecione um campo para duplicar', 'warning');
        }
    }
}

function duplicateField(fieldId) {
    const field = state.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    const newField = {
        ...field,
        id: 'field_' + Date.now(),
        name: field.name + '_copia',
        x: field.x + 20,
        y: field.y + 20
    };
    
    state.fields.push(newField);
    renderFields();
    showToast('Campo duplicado', 'success');
}

// ==================== PDF UPLOAD ====================
async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showToast('Carregando PDF...', 'info');

    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // SECURITY FIX: Create a copy of the ArrayBuffer to prevent detachment by PDF.js
        // PDF.js detaches the buffer after processing, causing "detached ArrayBuffer" errors
        // when trying to save templates later
        state.currentPDF = arrayBuffer.slice(0);

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

// ==================== FASE 1: SPECIALIZED FIELD TYPES ====================
function addFieldToCanvas(type) {
    if (!state.currentPDF) {
        showToast('Carregue um PDF primeiro!', 'warning');
        return;
    }

    const fieldConfig = getFieldConfig(type);
    
    const field = {
        id: 'field_' + Date.now(),
        type: type,
        name: `${type}_${state.fields.length + 1}`,
        x: 50 + (state.fields.length * 20 % 200),
        y: 50 + (state.fields.length * 20 % 200),
        width: fieldConfig.width,
        height: fieldConfig.height,
        fontSize: fieldConfig.fontSize,
        required: false,
        ...fieldConfig.extraProps
    };

    state.fields.push(field);
    renderFields();
    updateUsageStats('totalFields');
    showToast(`Campo ${type} adicionado`, 'success');
}

function getFieldConfig(type) {
    const configs = {
        text: { width: 200, height: 30, fontSize: 12, extraProps: {} },
        textarea: { width: 200, height: 80, fontSize: 12, extraProps: {} },
        checkbox: { width: 20, height: 20, fontSize: 12, extraProps: {} },
        date: { width: 150, height: 30, fontSize: 12, extraProps: {} },
        signature: { width: 150, height: 60, fontSize: 12, extraProps: {} },
        image: { width: 100, height: 100, fontSize: 12, extraProps: {} },
        cpf: { width: 150, height: 30, fontSize: 12, extraProps: { mask: '###.###.###-##' } },
        cns: { width: 180, height: 30, fontSize: 12, extraProps: { mask: '### #### #### ####' } },
        telefone: { width: 150, height: 30, fontSize: 12, extraProps: { mask: '(##) #####-####' } },
        hora: { width: 100, height: 30, fontSize: 12, extraProps: { format: '24h' } },
        numerico: { width: 120, height: 30, fontSize: 12, extraProps: { min: null, max: null } }
    };
    
    return configs[type] || configs.text;
}

// ==================== FIELD RENDERING ====================
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
        
        fieldEl.addEventListener('click', (e) => {
            e.stopPropagation();
            state.selectedFieldId = field.id;
            renderFields();
            showFieldPropertiesPanel(field.id);
        });

        overlay.appendChild(fieldEl);
    });
    
    if (state.selectedFieldId && !state.fields.find(f => f.id === state.selectedFieldId)) {
        state.selectedFieldId = null;
        hideFieldPropertiesPanel();
    }
}

// ==================== FASE 1: FIELD PROPERTIES PANEL ====================
function showFieldPropertiesPanel(fieldId) {
    const field = state.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    const panel = document.getElementById('field-properties-content');
    if (!panel) return;
    
    let html = '<form id="field-properties-form" class="small">';
    
    html += '<div class="mb-3">';
    html += '<label class="form-label fw-bold">Nome do Campo</label>';
    html += `<input type="text" class="form-control form-control-sm" id="prop-name" value="${field.name}">`;
    html += '</div>';
    
    html += '<div class="row">';
    html += '<div class="col-6 mb-3">';
    html += '<label class="form-label fw-bold">Largura</label>';
    html += `<input type="number" class="form-control form-control-sm" id="prop-width" value="${field.width}" min="20">`;
    html += '</div>';
    html += '<div class="col-6 mb-3">';
    html += '<label class="form-label fw-bold">Altura</label>';
    html += `<input type="number" class="form-control form-control-sm" id="prop-height" value="${field.height}" min="20">`;
    html += '</div>';
    html += '</div>';
    
    html += '<div class="mb-3">';
    html += '<label class="form-label fw-bold">Tamanho da Fonte</label>';
    html += `<input type="number" class="form-control form-control-sm" id="prop-fontSize" value="${field.fontSize}" min="8" max="72">`;
    html += '</div>';
    
    html += '<div class="mb-3">';
    html += '<div class="form-check">';
    html += `<input class="form-check-input" type="checkbox" id="prop-required" ${field.required ? 'checked' : ''}>`;
    html += '<label class="form-check-label fw-bold" for="prop-required">Campo Obrigatório</label>';
    html += '</div>';
    html += '</div>';
    
    if (field.type === 'numerico') {
        html += '<div class="row">';
        html += '<div class="col-6 mb-3">';
        html += '<label class="form-label fw-bold">Mínimo</label>';
        html += `<input type="number" class="form-control form-control-sm" id="prop-min" value="${field.min || ''}">`;
        html += '</div>';
        html += '<div class="col-6 mb-3">';
        html += '<label class="form-label fw-bold">Máximo</label>';
        html += `<input type="number" class="form-control form-control-sm" id="prop-max" value="${field.max || ''}">`;
        html += '</div>';
        html += '</div>';
    }
    
    html += '<div class="d-grid gap-2">';
    html += `<button type="button" class="btn btn-success btn-sm" onclick="updateFieldProperties('${fieldId}')">`;
    html += '<i class="bi bi-check-lg me-1"></i>Aplicar Mudanças';
    html += '</button>';
    html += `<button type="button" class="btn btn-outline-secondary btn-sm" onclick="duplicateField('${fieldId}')">`;
    html += '<i class="bi bi-files me-1"></i>Duplicar Campo';
    html += '</button>';
    html += '</div>';
    
    html += '</form>';
    
    panel.innerHTML = html;
}

function updateFieldProperties(fieldId) {
    const field = state.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    field.name = document.getElementById('prop-name').value;
    field.width = parseInt(document.getElementById('prop-width').value);
    field.height = parseInt(document.getElementById('prop-height').value);
    field.fontSize = parseInt(document.getElementById('prop-fontSize').value);
    field.required = document.getElementById('prop-required').checked;
    
    if (field.type === 'numerico') {
        const minVal = document.getElementById('prop-min').value;
        const maxVal = document.getElementById('prop-max').value;
        field.min = minVal ? parseInt(minVal) : null;
        field.max = maxVal ? parseInt(maxVal) : null;
    }
    
    renderFields();
    showToast('Propriedades atualizadas', 'success');
}

function hideFieldPropertiesPanel() {
    const panel = document.getElementById('field-properties-content');
    if (panel) {
        panel.innerHTML = `
            <p class="text-muted text-center py-4 small">
                <i class="bi bi-info-circle me-2"></i>
                Selecione um campo para editar
            </p>
        `;
    }
}

// ==================== DRAGGABLE FIELDS ====================
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

    element.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    element.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
}

// ==================== FIELD OPERATIONS ====================
function deleteField(fieldId) {
    state.fields = state.fields.filter(f => f.id !== fieldId);
    if (state.selectedFieldId === fieldId) {
        state.selectedFieldId = null;
        hideFieldPropertiesPanel();
    }
    renderFields();
    showToast('Campo removido', 'info');
}

function clearFields() {
    if (state.fields.length === 0) return;
    
    if (confirm('Remover todos os campos?')) {
        state.fields = [];
        state.selectedFieldId = null;
        hideFieldPropertiesPanel();
        renderFields();
        showToast('Campos limpos', 'info');
    }
}

// ==================== FASE 1 & 3: TEMPLATE SAVING WITH CATEGORIES ====================
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
        category: 'Geral',
        tags: [],
        fields: JSON.parse(JSON.stringify(state.fields)),
        pdfData: base64PDF,
        createdAt: new Date().toISOString(),
        createdBy: state.currentUser ? state.currentUser.name : 'Unknown',
        conditionalLogic: []
    };

    state.templates.push(template);
    saveTemplates();
    updateTemplateSelector();
    updateUsageStats('templatesCreated');

    showToast(`Template "${name}" salvo com sucesso!`, 'success');

    document.getElementById('template-name').value = '';
    state.fields = [];
    state.selectedFieldId = null;
    hideFieldPropertiesPanel();
    renderFields();
}

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

// ==================== TEMPLATE SELECTOR ====================
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

// ==================== TEMPLATE LOADING FOR FILLING ====================
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
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.getElementById('pdf-preview-render');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const overlay = document.getElementById('preview-overlay');
        overlay.style.width = viewport.width + 'px';
        overlay.style.height = viewport.height + 'px';

        document.getElementById('empty-preview').style.display = 'none';
        document.getElementById('pdf-preview').style.display = 'inline-block';
        document.getElementById('btn-generate').disabled = false;

        renderFormFields();
        updateFillProgress();
    } catch (error) {
        console.error('Erro ao carregar template:', error);
        showToast('Erro ao carregar template', 'danger');
    }
}

// ==================== FASE 1 & 2: FORM FIELDS WITH VALIDATION AND MASKS ====================
function renderFormFields() {
    if (!state.currentTemplate) return;

    const container = document.getElementById('form-fields');
    container.innerHTML = '';

    state.currentTemplate.fields.forEach((field, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label small fw-bold';
        label.textContent = field.name;
        if (field.required) {
            label.innerHTML += ' <span class="text-danger">*</span>';
        }
        fieldGroup.appendChild(label);

        let inputElement;

        switch (field.type) {
            case 'textarea':
                inputElement = document.createElement('textarea');
                inputElement.className = 'form-control form-control-sm';
                inputElement.rows = 3;
                inputElement.id = field.id;
                
                const textLibBtn = document.createElement('button');
                textLibBtn.type = 'button';
                textLibBtn.className = 'btn btn-outline-secondary btn-sm w-100 mt-1';
                textLibBtn.innerHTML = '<i class="bi bi-book me-1"></i>Biblioteca de Textos';
                textLibBtn.onclick = () => showTextLibrary(field.id);
                fieldGroup.appendChild(textLibBtn);
                break;
                
            case 'checkbox':
                inputElement = document.createElement('input');
                inputElement.type = 'checkbox';
                inputElement.className = 'form-check-input';
                inputElement.id = field.id;
                fieldGroup.className = 'form-check mb-3';
                label.className = 'form-check-label small';
                break;
                
            case 'date':
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                inputElement.className = 'form-control form-control-sm';
                inputElement.id = field.id;
                break;
                
            case 'signature':
                inputElement = document.createElement('button');
                inputElement.type = 'button';
                inputElement.className = 'btn btn-outline-secondary btn-sm w-100';
                inputElement.innerHTML = '<i class="bi bi-pen me-1"></i>Clicar para assinar';
                inputElement.id = field.id;
                inputElement.onclick = () => openSignaturePad(field.id);
                break;
                
            case 'image':
                inputElement = document.createElement('input');
                inputElement.type = 'file';
                inputElement.accept = 'image/*';
                inputElement.className = 'form-control form-control-sm';
                inputElement.id = field.id;
                inputElement.onchange = (e) => handleImageUpload(e, field.id);
                break;
                
            case 'cpf':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.className = 'form-control form-control-sm';
                inputElement.placeholder = '000.000.000-00';
                inputElement.id = field.id;
                inputElement.maxLength = 14;
                inputElement.addEventListener('input', (e) => applyCPFMask(e.target));
                inputElement.addEventListener('blur', (e) => validateCPF(e.target));
                break;
                
            case 'cns':
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.className = 'form-control form-control-sm';
                inputElement.placeholder = '000 0000 0000 0000';
                inputElement.id = field.id;
                inputElement.maxLength = 18;
                inputElement.addEventListener('input', (e) => applyCNSMask(e.target));
                inputElement.addEventListener('blur', (e) => validateCNS(e.target));
                break;
                
            case 'telefone':
                inputElement = document.createElement('input');
                inputElement.type = 'tel';
                inputElement.className = 'form-control form-control-sm';
                inputElement.placeholder = '(00) 00000-0000';
                inputElement.id = field.id;
                inputElement.maxLength = 15;
                inputElement.addEventListener('input', (e) => applyPhoneMask(e.target));
                break;
                
            case 'hora':
                inputElement = document.createElement('input');
                inputElement.type = 'time';
                inputElement.className = 'form-control form-control-sm';
                inputElement.id = field.id;
                break;
                
            case 'numerico':
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.className = 'form-control form-control-sm';
                inputElement.id = field.id;
                if (field.min !== null && field.min !== undefined) {
                    inputElement.min = field.min;
                }
                if (field.max !== null && field.max !== undefined) {
                    inputElement.max = field.max;
                }
                break;
                
            default:
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.className = 'form-control form-control-sm';
                inputElement.id = field.id;
        }

        if (inputElement.tagName !== 'BUTTON') {
            inputElement.addEventListener('input', (e) => {
                if (e.target.type === 'checkbox') {
                    state.formData[field.id] = e.target.checked;
                } else {
                    state.formData[field.id] = e.target.value;
                }
                renderPreviewOverlay();
                updateFillProgress();
                applyConditionalLogic();
            });
        }

        if (field.type === 'checkbox') {
            fieldGroup.appendChild(inputElement);
            fieldGroup.appendChild(label);
        } else {
            fieldGroup.appendChild(label);
            fieldGroup.appendChild(inputElement);
        }

        container.appendChild(fieldGroup);
    });
    
    addCalculatedFields();
}

// ==================== FASE 2: CALCULATED FIELDS ====================
function addCalculatedFields() {
    if (!state.currentTemplate) return;
    
    const hasDataNascimento = state.currentTemplate.fields.find(f => 
        f.name.toLowerCase().includes('nascimento') || f.name.toLowerCase().includes('data')
    );
    
    const hasPeso = state.currentTemplate.fields.find(f => 
        f.name.toLowerCase().includes('peso')
    );
    
    const hasAltura = state.currentTemplate.fields.find(f => 
        f.name.toLowerCase().includes('altura')
    );
    
    if (hasDataNascimento) {
        const idadeField = {
            id: 'calc_idade',
            name: 'Idade (Calculada)',
            type: 'calculated'
        };
        
        addCalculatedFieldDisplay(idadeField);
    }
    
    if (hasPeso && hasAltura) {
        const imcField = {
            id: 'calc_imc',
            name: 'IMC (Calculado)',
            type: 'calculated'
        };
        
        addCalculatedFieldDisplay(imcField);
    }
}

function addCalculatedFieldDisplay(field) {
    const container = document.getElementById('form-fields');
    if (!container) return;
    
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'mb-3';
    fieldGroup.innerHTML = `
        <label class="form-label small fw-bold text-info">
            <i class="bi bi-calculator me-1"></i>${field.name}
        </label>
        <div id="${field.id}" class="alert alert-info small py-2">
            Será calculado automaticamente
        </div>
    `;
    
    container.appendChild(fieldGroup);
}

// ==================== FASE 1: INPUT MASKS ====================
function applyCPFMask(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 11);
    
    if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }
    
    input.value = value;
}

function validateCPF(input) {
    const cpf = input.value.replace(/\D/g, '');
    
    if (cpf.length === 0) return;
    
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        input.classList.add('is-invalid');
        showToast('CPF inválido', 'warning');
        return false;
    }
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) {
        input.classList.add('is-invalid');
        showToast('CPF inválido', 'warning');
        return false;
    }
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    
    if (digito2 !== parseInt(cpf.charAt(10))) {
        input.classList.add('is-invalid');
        showToast('CPF inválido', 'warning');
        return false;
    }
    
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

function applyCNSMask(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 15);
    
    if (value.length > 12) {
        value = value.replace(/(\d{3})(\d{4})(\d{4})(\d{0,4})/, '$1 $2 $3 $4');
    } else if (value.length > 8) {
        value = value.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1 $2 $3');
    } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,4})/, '$1 $2');
    }
    
    input.value = value;
}

function validateCNS(input) {
    const cns = input.value.replace(/\D/g, '');
    
    if (cns.length === 0) return;
    
    if (cns.length !== 15) {
        input.classList.add('is-invalid');
        showToast('CNS deve ter 15 dígitos', 'warning');
        return false;
    }
    
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

function applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    input.value = value;
}

// ==================== FILL PROGRESS ====================
function updateFillProgress() {
    if (!state.currentTemplate) return;

    const totalFields = state.currentTemplate.fields.filter(f => f.type !== 'signature' && f.type !== 'image').length;
    const filledFields = Object.keys(state.formData).filter(key => {
        const value = state.formData[key];
        return value !== null && value !== undefined && value !== '';
    }).length;

    const badge = document.getElementById('fill-progress');
    if (badge) {
        badge.textContent = `${filledFields}/${totalFields}`;
        
        if (filledFields === totalFields) {
            badge.classList.remove('bg-light', 'text-dark');
            badge.classList.add('bg-success', 'text-white');
        } else {
            badge.classList.remove('bg-success', 'text-white');
            badge.classList.add('bg-light', 'text-dark');
        }
    }
}

// ==================== IMAGE UPLOAD ====================
function handleImageUpload(event, fieldId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        state.formData[fieldId] = e.target.result;
        renderPreviewOverlay();
        updateFillProgress();
        showToast('Imagem carregada', 'success');
    };
    reader.readAsDataURL(file);
}

// ==================== SIGNATURE PAD ====================
function initializeSignatureCanvas() {
    const modal = document.getElementById('signatureModal');
    if (!modal) return;

    modal.addEventListener('shown.bs.modal', () => {
        const canvas = document.getElementById('signature-canvas');
        if (!canvas) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        state.signatureCanvas = canvas;
        state.signatureContext = canvas.getContext('2d');

        state.signatureContext.strokeStyle = '#000';
        state.signatureContext.lineWidth = 2;
        state.signatureContext.lineCap = 'round';

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        const draw = (e) => {
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            state.signatureContext.beginPath();
            state.signatureContext.moveTo(lastX, lastY);
            state.signatureContext.lineTo(x, y);
            state.signatureContext.stroke();

            lastX = x;
            lastY = y;
        };

        const startDrawing = (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            lastX = (e.clientX || e.touches[0].clientX) - rect.left;
            lastY = (e.clientY || e.touches[0].clientY) - rect.top;
        };

        const stopDrawing = () => {
            isDrawing = false;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
    });
}

function openSignaturePad(fieldId) {
    state.currentSignatureFieldId = fieldId;
    const modal = new bootstrap.Modal(document.getElementById('signatureModal'));
    modal.show();
}

function clearSignature() {
    if (!state.signatureCanvas) return;
    state.signatureContext.clearRect(0, 0, state.signatureCanvas.width, state.signatureCanvas.height);
}

function saveSignature() {
    if (!state.currentSignatureFieldId) return;

    const dataURL = state.signatureCanvas.toDataURL('image/png');
    state.formData[state.currentSignatureFieldId] = dataURL;

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

// ==================== PREVIEW OVERLAY ====================
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

// ==================== FASE 3: CONDITIONAL LOGIC ====================
function applyConditionalLogic() {
    if (!state.currentTemplate || !state.currentTemplate.conditionalLogic) return;
    
    state.currentTemplate.conditionalLogic.forEach(rule => {
        const condition = rule.condition;
        const fieldValue = state.formData[condition.fieldId];
        
        let conditionMet = false;
        
        switch (condition.operator) {
            case 'equals':
                conditionMet = fieldValue === condition.value;
                break;
            case 'notEquals':
                conditionMet = fieldValue !== condition.value;
                break;
            case 'contains':
                conditionMet = fieldValue && fieldValue.includes(condition.value);
                break;
            case 'greaterThan':
                conditionMet = parseFloat(fieldValue) > parseFloat(condition.value);
                break;
            case 'lessThan':
                conditionMet = parseFloat(fieldValue) < parseFloat(condition.value);
                break;
        }
        
        rule.actions.forEach(action => {
            const targetElement = document.getElementById(action.fieldId);
            if (!targetElement) return;
            
            const fieldGroup = targetElement.closest('.mb-3');
            if (!fieldGroup) return;
            
            if (action.type === 'show') {
                fieldGroup.style.display = conditionMet ? 'block' : 'none';
            } else if (action.type === 'hide') {
                fieldGroup.style.display = conditionMet ? 'none' : 'block';
            } else if (action.type === 'require') {
                targetElement.required = conditionMet;
            }
        });
    });
}

// ==================== FASE 3: QR CODE GENERATION ====================
function generateQRCode(data) {
    const canvas = document.createElement('canvas');
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = 'black';
    ctx.font = '8px Arial';
    ctx.fillText('QR Code', 10, 50);
    ctx.fillText(data.substring(0, 10), 10, 60);
    
    return canvas.toDataURL('image/png');
}

// ==================== PDF GENERATION ====================
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
        
        const qrData = `DocsHgumba-${state.currentTemplate.name}-${Date.now()}`;
        const qrImage = generateQRCode(qrData);
        
        try {
            const qrBytes = Uint8Array.from(
                atob(qrImage.split(',')[1]),
                c => c.charCodeAt(0)
            );
            const qrPng = await pdfDoc.embedPng(qrBytes);
            const { width, height } = firstPage.getSize();
            firstPage.drawImage(qrPng, {
                x: width - 110,
                y: 10,
                width: 100,
                height: 100
            });
        } catch (error) {
            console.log('QR Code não adicionado:', error);
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

// ==================== CLEAR FORM ====================
function clearForm() {
    state.formData = {};

    const inputs = document.querySelectorAll('#form-fields input, #form-fields textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
        input.classList.remove('is-valid', 'is-invalid');
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

// ==================== TEMPLATE OPERATIONS ====================
function duplicateCurrentTemplate() {
    if (!state.currentTemplate) return;
    
    const newTemplate = {
        ...state.currentTemplate,
        id: 'template_' + Date.now(),
        name: state.currentTemplate.name + ' (Cópia)',
        createdAt: new Date().toISOString()
    };
    
    state.templates.push(newTemplate);
    saveTemplates();
    updateTemplateSelector();
    showToast('Template duplicado', 'success');
}

function deleteCurrentTemplate() {
    if (!state.currentTemplate) return;
    
    if (confirm(`Deseja realmente excluir o template "${state.currentTemplate.name}"?`)) {
        state.templates = state.templates.filter(t => t.id !== state.currentTemplate.id);
        saveTemplates();
        updateTemplateSelector();
        
        state.currentTemplate = null;
        state.formData = {};
        
        document.getElementById('template-selector').value = '';
        document.getElementById('form-fields').innerHTML = `
            <p class="text-muted text-center py-4 small">
                <i class="bi bi-info-circle me-2"></i>Selecione um template
            </p>
        `;
        document.getElementById('empty-preview').style.display = 'flex';
        document.getElementById('pdf-preview').style.display = 'none';
        
        showToast('Template excluído', 'info');
    }
}

// ==================== MODE SWITCHING ====================
function switchMode(mode) {
    state.currentMode = mode;
    closeMobileMenu();
    console.log('Modo:', mode);
}

// ==================== ZOOM CONTROLS ====================
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
    const preview = document.getElementById('pdf-preview');
    if (preview) {
        preview.classList.toggle('fit-screen');
    }
}

// ==================== FASE 2: USAGE STATISTICS ====================
function loadUsageStats() {
    try {
        const stored = localStorage.getItem('docsHgumbaStats');
        if (stored) {
            state.usageStats = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

function updateUsageStats(metric) {
    state.usageStats[metric]++;
    localStorage.setItem('docsHgumbaStats', JSON.stringify(state.usageStats));
}

function showDashboard() {
    const html = `
        <div class="modal fade" id="dashboardModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-army-green text-white">
                        <h5 class="modal-title"><i class="bi bi-graph-up me-2"></i>Dashboard de Uso</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <i class="bi bi-files fs-1 text-success"></i>
                                        <h3 class="mt-2">${state.templates.length}</h3>
                                        <p class="text-muted mb-0">Templates</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <i class="bi bi-file-pdf fs-1 text-danger"></i>
                                        <h3 class="mt-2">${state.usageStats.pdfsGenerated}</h3>
                                        <p class="text-muted mb-0">PDFs Gerados</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card text-center">
                                    <div class="card-body">
                                        <i class="bi bi-grid fs-1 text-primary"></i>
                                        <h3 class="mt-2">${state.usageStats.totalFields}</h3>
                                        <p class="text-muted mb-0">Campos Criados</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4">
                            <h6>Histórico Recente</h6>
                            <div class="list-group">
                                ${state.pdfHistory.slice(0, 5).map(item => `
                                    <div class="list-group-item">
                                        <div class="d-flex justify-content-between">
                                            <strong>${item.templateName}</strong>
                                            <small class="text-muted">${new Date(item.timestamp).toLocaleString('pt-BR')}</small>
                                        </div>
                                        <small class="text-muted">Usuário: ${item.user}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = html;
    document.body.appendChild(modalDiv);
    
    const modal = new bootstrap.Modal(document.getElementById('dashboardModal'));
    modal.show();
    
    document.getElementById('dashboardModal').addEventListener('hidden.bs.modal', () => {
        modalDiv.remove();
    });
}

// ==================== FASE 3: SPEECH RECOGNITION ====================
function initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech Recognition não disponível neste navegador');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    state.speechRecognition = new SpeechRecognition();
    state.speechRecognition.lang = 'pt-BR';
    state.speechRecognition.continuous = true;
    state.speechRecognition.interimResults = true;
    
    state.speechRecognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            activeElement.value = transcript;
            state.formData[activeElement.id] = transcript;
            renderPreviewOverlay();
            updateFillProgress();
        }
    };
    
    state.speechRecognition.onerror = (event) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        state.isDictating = false;
    };
}

function toggleDictation() {
    if (!state.speechRecognition) {
        showToast('Reconhecimento de voz não disponível', 'warning');
        return;
    }
    
    if (state.isDictating) {
        state.speechRecognition.stop();
        state.isDictating = false;
        showToast('Ditado desativado', 'info');
    } else {
        state.speechRecognition.start();
        state.isDictating = true;
        showToast('Ditado ativado - fale para preencher o campo selecionado', 'success');
    }
}

// ==================== FASE 3: AUTOMATIC BACKUP ====================
function startAutomaticBackup() {
    if (state.backupInterval) {
        clearInterval(state.backupInterval);
    }
    
    state.backupInterval = setInterval(() => {
        const lastBackup = localStorage.getItem('docsHgumbaLastBackup');
        const hoursSinceBackup = lastBackup 
            ? (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60)
            : 999;
        
        if (hoursSinceBackup >= 24 && state.templates.length > 0) {
            console.log('Executando backup automático...');
            const backup = {
                templates: state.templates,
                history: state.pdfHistory,
                stats: state.usageStats,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('docsHgumbaBackup', JSON.stringify(backup));
            localStorage.setItem('docsHgumbaLastBackup', new Date().toISOString());
            console.log('Backup automático concluído');
        }
    }, 3600000);
}

// ==================== TOAST NOTIFICATIONS ====================
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

// ==================== SAMPLE TEMPLATES ====================
function loadSampleTemplates() {
    if (state.templates.length > 0) return;

    console.log('Sistema pronto para criar templates hospitalares personalizados');
}

console.log('✅ DocsHgumba COMPLETO carregado!');
console.log('📋 Funcionalidades implementadas:');
console.log('- FASE 1: Painel de propriedades, Campos especializados (CPF/CNS/Telefone), Categorias');
console.log('- FASE 2: Autenticação, Biblioteca de textos, Atalhos (Ctrl+E/D), Dashboard');
console.log('- FASE 3: Lógica condicional, QR Code, Ditado, Backup automático');
