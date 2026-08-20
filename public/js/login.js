
const API_USUARIOS = "/api/usuarios";

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}
function limpiarError(id) {
    mostrarError(id, "");
}
function marcarCampo(id, ok) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("campo-error", "campo-valido");
    el.classList.add(ok ? "campo-valido" : "campo-error");
}

const form = document.getElementById("formLogin");

form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    limpiarError("err-correo");
    limpiarError("err-contrasena");
    limpiarError("err-login");

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    let valido = true;

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) {
        mostrarError("err-correo", "Ingrese un correo electrónico válido.");
        marcarCampo("correo", false);
        valido = false;
    } else {
        marcarCampo("correo", true);
    }

    if (!contrasena) {
        mostrarError("err-contrasena", "La contraseña es obligatoria.");
        marcarCampo("contrasena", false);
        valido = false;
    } else {
        marcarCampo("contrasena", true);
    }

    if (!valido) return;

    try {
        const respuesta = await fetch(API_USUARIOS + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            // Mensaje de error genérico a propósito (CP-01): no revelar si el correo existe
            mostrarError("err-login", datos.mensaje || "No fue posible iniciar sesión.");
            return;
        }

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Error al iniciar sesión:");
        console.error(error);
        mostrarError("err-login", "Ocurrió un error de conexión. Intente de nuevo.");
    }
});