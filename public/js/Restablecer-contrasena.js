// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
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

const form = document.getElementById("formRestablecer");

form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    ["err-correo", "err-contrasenaNueva", "err-confirmarContrasenaNueva", "err-restablecer"].forEach(limpiarError);
    document.getElementById("exito-restablecer").textContent = "";

    const correo = document.getElementById("correo").value.trim();
    const contrasenaNueva = document.getElementById("contrasenaNueva").value;
    const confirmarContrasenaNueva = document.getElementById("confirmarContrasenaNueva").value;

    let valido = true;

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) {
        mostrarError("err-correo", "Ingrese un correo electrónico válido.");
        marcarCampo("correo", false);
        valido = false;
    } else {
        marcarCampo("correo", true);
    }

    const formatoContrasena = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formatoContrasena.test(contrasenaNueva)) {
        mostrarError("err-contrasenaNueva", "Mínimo 8 caracteres, una mayúscula y un número.");
        marcarCampo("contrasenaNueva", false);
        valido = false;
    } else {
        marcarCampo("contrasenaNueva", true);
    }

    if (contrasenaNueva !== confirmarContrasenaNueva) {
        mostrarError("err-confirmarContrasenaNueva", "Las contraseñas no coinciden.");
        marcarCampo("confirmarContrasenaNueva", false);
        valido = false;
    } else {
        marcarCampo("confirmarContrasenaNueva", true);
    }

    if (!valido) return;

    try {
        const respuesta = await fetch(API_USUARIOS + "/restablecer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasenaNueva, confirmarContrasenaNueva })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarError("err-restablecer", datos.mensaje || "No fue posible restablecer la contraseña.");
            return;
        }

        document.getElementById("exito-restablecer").textContent = "Contraseña actualizada. Ya puede iniciar sesión.";
        form.reset();

    } catch (error) {
        console.error("Error al restablecer contraseña:");
        console.error(error);
        mostrarError("err-restablecer", "Ocurrió un error de conexión. Intente de nuevo.");
    }
});