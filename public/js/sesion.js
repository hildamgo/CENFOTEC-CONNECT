// Hice este archivo JS para que ayude en cuanto a login y usuarios

const TIEMPO_INACTIVIDAD = 5 * 60 * 1000;
let temporizadorInactividad = null;

function cerrarSesion() {
    sessionStorage.clear();
    clearTimeout(temporizadorInactividad);
    window.location.href = 'login.html';
}

function reiniciarTemporizador() {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(function() {
        alert('Su sesión expiró por inactividad. Será redirigido al login.');
        cerrarSesion();
    }, TIEMPO_INACTIVIDAD);
}

function activarDeteccionInactividad(){
    document.addEventListener('mousemove',      reiniciarTemporizador);
    document.addEventListener('keypress',       reiniciarTemporizador);
    document.addEventListener('click',          reiniciarTemporizador);
    document.addEventListener('touchstart',     reiniciarTemporizador);
    reiniciarTemporizador();
}

function verificarSesion() {
    const sesionActiva = sessionStorage.getItem('sesionActiva');

    if (sesionActiva !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    activarDeteccionInactividad();
}