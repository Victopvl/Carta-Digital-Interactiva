// ============================================
// CARTA DIGITAL INTERACTIVA
// Admin Authentication (Supabase Auth)
// ============================================

async function checkLogin() {
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');

    if (!emailInput || !passwordInput || !authSection || !adminSection) {
        console.error('Elementos de autenticación no encontrados.');
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert('Por favor ingresa tu correo y contraseña.');
        return;
    }

    const btn = event.currentTarget || document.querySelector('#auth-section button');
    const originalText = btn.innerText;
    btn.innerText = 'Validando...';
    btn.disabled = true;

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    btn.innerText = originalText;
    btn.disabled = false;

    if (error) {
        alert('Acceso denegado: Credenciales incorrectas');
        passwordInput.value = '';
        passwordInput.focus();
        return;
    }

    // Login exitoso
    authSection.classList.add('hidden');
    adminSection.classList.remove('hidden');

    if (typeof initStock === 'function') {
        initStock();
    }
}

// Función para cerrar sesión explícitamente desde el botón "Salir"
async function logoutAdmin() {
    if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
    }
    location.reload();
}

// Verificar sesión activa al cargar la página
async function initAuth() {
    // Esperar un instante a que cargue el cliente de Supabase si es necesario
    if (!window.supabaseClient) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');

    if (session && authSection && adminSection) {
        // Si hay sesión válida, saltamos el login y abrimos el panel
        authSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        if (typeof initStock === 'function') {
            initStock();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}