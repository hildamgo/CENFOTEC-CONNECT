// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_USUARIOS = "/api/usuarios";

// Accesos por módulo, filtrados según el rol del administrador
const ACCESOS_POR_ROL = {
    "Administrador General": [
        { nombre: "Actividades", href: "actividades.html" },
        { nombre: "Espacios", href: "espacios.html" },
        { nombre: "Responsables", href: "responsables.html" },
        { nombre: "Participantes", href: "participantes.html" },
        { nombre: "Inscripciones", href: "inscripciones.html" }
    ],
    "Administrador de Actividades": [
        { nombre: "Actividades", href: "actividades.html" },
        { nombre: "Espacios", href: "espacios.html" },
        { nombre: "Responsables", href: "responsables.html" }
    ]
};

async function verificarSesionYCargarPanel() {
    try {
        const respuesta = await fetch(API_USUARIOS + "/sesion");
        const datos = await respuesta.json();

        // HUGU-07 / HURNF-34: sin sesión activa, no se puede ver el panel
        if (!datos.autenticado) {
            window.location.href = "login.html";
            return;
        }

        const usuario = datos.usuario;
        document.getElementById("bienvenida").textContent =
            "Bienvenido, " + usuario.nombre + " (" + usuario.rol + ")";

        const accesos = ACCESOS_POR_ROL[usuario.rol] || [];
        const contenedorAccesos = document.getElementById("accesosDirectos");
        contenedorAccesos.innerHTML = accesos
            .map(function (a) {
                return '<a href="' + a.href + '" class="tarjeta-acceso">' + a.nombre + "</a>";
            })
            .join(" ");

        // Solo el Administrador General ve la lista de administradores (HUGU-03)
        if (usuario.rol === "Administrador General") {
            document.getElementById("bloqueUsuarios").style.display = "block";
            cargarUsuarios();
        }

    } catch (error) {
        console.error("Error al verificar sesión:");
        console.error(error);
        window.location.href = "login.html";
    }
}

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

verificarSesionYCargarPanel();