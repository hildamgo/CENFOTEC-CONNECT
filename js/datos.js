const CLAVE_ESPACIOS = "cenfotec_espacios";
const CLAVE_RESPONSABLES = "cenfotec_responsables";
const CLAVE_ACTIVIDADES = "cenfotec_actividades";
const CLAVE_SESION = "cenfotec_sesion";


function crearId() {
    return Date.now().toString();
}

function obtenerDatos(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function obtenerFechaActual() {
    return new Date().toLocaleDateString("es-CR");
}

function mostrarError(id, mensaje) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = mensaje;
    }
}

function limpiarError(id) {
    mostrarError(id, "");
}

function marcarCampo(id, esValido) {
    const campo = document.getElementById(id);
    if (!campo) {
        return;
    }
    campo.classList.remove("campo-error", "campo-valido");
    campo.classList.add(esValido ? "campo-valido" : "campo-error");
}

function validarTexto(idCampo, idError, nombreCampo, minimo) {
    const campo = document.getElementById(idCampo);
    const valor = campo.value.trim();

    if (valor === "") {
        mostrarError(idError, nombreCampo + " es obligatorio.");
        marcarCampo(idCampo, false);
        return false;
    }

    if (valor.length < minimo) {
        mostrarError(idError, nombreCampo + " debe tener al menos " + minimo + " caracteres.");
        marcarCampo(idCampo, false);
        return false;
    }

    limpiarError(idError);
    marcarCampo(idCampo, true);
    return true;
}

function validarCorreo(idCampo, idError) {
    const correo = document.getElementById(idCampo).value.trim();
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expresion.test(correo)) {
        mostrarError(idError, "Ingrese un correo valido.");
        marcarCampo(idCampo, false);
        return false;
    }

    limpiarError(idError);
    marcarCampo(idCampo, true);
    return true;
}

function validarUrl(idCampo, idError) {
    const url = document.getElementById(idCampo).value.trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        mostrarError(idError, "Ingrese una URL valida.");
        marcarCampo(idCampo, false);
        return false;
    }

    limpiarError(idError);
    marcarCampo(idCampo, true);
    return true;
}

function validarSesion() {
    let sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));

    if (!sesion) {
        sesion = {
            usuario: "admin@ucenfotec.ac.cr",
            rol: "Administrador General",
            ultimaActividad: Date.now()
        };
        localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    }

    const minutosInactivo = (Date.now() - sesion.ultimaActividad) / 60000;
    if (minutosInactivo > 30) {
        localStorage.removeItem(CLAVE_SESION);
        alert("La sesion expiro por inactividad.");
        location.href = "index.html";
        return false;
    }

    sesion.ultimaActividad = Date.now();
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return true;
}

validarSesion();
