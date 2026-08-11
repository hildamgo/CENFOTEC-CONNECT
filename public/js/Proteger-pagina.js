// ======================================================
// PROTEGER PÁGINA: redirige a login.html si no hay sesión activa
// Incluir este script ANTES que el JS propio de cada página
// en: actividades.html, espacios.html, responsables.html
// ======================================================
(async function protegerPagina() {
    try {
        const respuesta = await fetch("/api/usuarios/sesion");
        const datos = await respuesta.json();

        if (!datos.autenticado) {
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error al verificar sesión:");
        console.error(error);
        window.location.href = "login.html";
    }
})();