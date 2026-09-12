// ============================================
// CARTA DIGITAL INTERACTIVA
// Admin Authentication
// ============================================

const PIN_SECRETO = '1234';

function checkPin() {
    const pinInput = document.getElementById('pin-input');
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');

    if (!pinInput || !authSection || !adminSection) {
        console.error('Elementos de autenticación no encontrados.');
        return;
    }

    const pin = pinInput.value.trim();

    if (pin === PIN_SECRETO) {
        authSection.classList.add('hidden');
        adminSection.classList.remove('hidden');

        // Activamos de manera limpia la carga inicial Y el tiempo real
        initStock();
    } else {
        alert('PIN incorrecto');

        pinInput.value = '';
        pinInput.focus();
    }
}
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

    // Cambiamos el texto del botón mientras carga
    const btn = event.currentTarget || document.querySelector('#auth-section button');
    const originalText = btn.innerText;
    btn.innerText = 'Validando...';
    btn.disabled = true;

    // Autenticación real contra Supabase
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    // Restauramos el botón
    btn.innerText = originalText;
    btn.disabled = false;

    if (error) {
        alert('Acceso denegado: Credenciales incorrectas');
        passwordInput.value = '';
        passwordInput.focus();
        return;
    }

    // Login exitoso: Supabase guardó el token
    authSection.classList.add('hidden');
    adminSection.classList.remove('hidden');

    // Iniciamos la carga del stock protegido
    if (typeof initStock === 'function') {
        initStock();
    }
}