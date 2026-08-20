
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

// ── Verificar sesión al cargar la página.
// El formulario de registro queda siempre visible (así se puede crear
// el primer administrador). La lista solo se carga si hay sesión activa.
async function verificarSesion() {
    try {
        const respuesta = await fetch(API_USUARIOS + "/sesion");
        const datos = await respuesta.json();

        if (!datos.autenticado) {
            document.getElementById("bienvenida").textContent =
                "No hay sesión activa. Podés registrar un administrador abajo, o iniciar sesión.";
            return;
        }

        document.getElementById("bienvenida").textContent =
            "Bienvenido, " + datos.usuario.nombre + " (" + datos.usuario.rol + ")";

        cargarUsuarios();

    } catch (error) {
        console.error("Error al verificar sesión:");
        console.error(error);
    }
}

// ── Cargar la lista de administradores (HUGU-03)
async function cargarUsuarios() {
    try {
        const respuesta = await fetch(API_USUARIOS);
        const lista = await respuesta.json();

        const tabla = document.getElementById("tablaUsuarios");
        tabla.innerHTML = "";

        lista.forEach(function (u) {
            const fila = document.createElement("tr");
            fila.innerHTML =
                "<td>" + u.nombre + "</td>" +
                "<td>" + u.correo + "</td>" +
                "<td>" + u.rol + "</td>" +
                "<td>" + (u.estado || "Activo") + "</td>";
            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar usuarios:");
        console.error(error);
    }
}

// ── Registrar nuevo administrador (HUGU-01)
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
        cargarUsuarios();

    } catch (error) {
        console.error("Error al registrar administrador:");
        console.error(error);
        mostrarError("err-registro", "Ocurrió un error de conexión. Intente de nuevo.");
    }
});

// ── Cerrar sesión
document.getElementById("btnCerrarSesion").addEventListener("click", async function (evento) {
    evento.preventDefault();
    try {
        await fetch(API_USUARIOS + "/logout", { method: "POST" });
    } catch (error) {
        console.error("Error al cerrar sesión:");
        console.error(error);
    } finally {
        window.location.href = "login.html";
    }
});

verificarSesion();