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

        loadStock();
    } else {
        alert('PIN incorrecto');

        pinInput.value = '';
        pinInput.focus();
    }
}