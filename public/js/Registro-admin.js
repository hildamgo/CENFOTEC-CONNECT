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

const form = document.getElementById("formRegistroAdmin");

form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    ["err-nombre", "err-correo", "err-contrasena", "err-confirmarContrasena", "err-rol", "err-registro"].forEach(limpiarError);
    document.getElementById("exito-registro").textContent = "";

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;
    const rol = document.getElementById("rol").value;

    let valido = true;

    if (!nombre) {
        mostrarError("err-nombre", "El nombre es obligatorio.");
        marcarCampo("nombre", false);
        valido = false;
    } else {
        marcarCampo("nombre", true);
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) {
        mostrarError("err-correo", "Ingrese un correo electrónico válido.");
        marcarCampo("correo", false);
        valido = false;
    } else {
        marcarCampo("correo", true);
    }

    const formatoContrasena = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formatoContrasena.test(contrasena)) {
        mostrarError("err-contrasena", "Mínimo 8 caracteres, una mayúscula y un número.");
        marcarCampo("contrasena", false);
        valido = false;
    } else {
        marcarCampo("contrasena", true);
    }

    if (contrasena !== confirmarContrasena) {
        mostrarError("err-confirmarContrasena", "Las contraseñas no coinciden.");
        marcarCampo("confirmarContrasena", false);
        valido = false;
    } else {
        marcarCampo("confirmarContrasena", true);
    }

    if (!rol) {
        mostrarError("err-rol", "Debe seleccionar un rol.");
        marcarCampo("rol", false);
        valido = false;
    } else {
        marcarCampo("rol", true);
    }

    if (!valido) return;

    try {
        const respuesta = await fetch(API_USUARIOS + "/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, correo, contrasena, confirmarContrasena, rol })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarError("err-registro", datos.mensaje || "No fue posible registrar el administrador.");
            return;
        }

        document.getElementById("exito-registro").textContent = "Administrador registrado correctamente.";
        form.reset();

    } catch (error) {
        console.error("Error al registrar administrador:");
        console.error(error);
        mostrarError("err-registro", "Ocurrió un error de conexión. Intente de nuevo.");
    }
});