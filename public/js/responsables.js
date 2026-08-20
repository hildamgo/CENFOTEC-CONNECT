
const API_RESPONSABLES = "/api/responsables";

function mostrarError(id, mensaje) { const el = document.getElementById(id); if (el) el.textContent = mensaje; }
function limpiarError(id) { mostrarError(id, ""); }
function marcarCampo(id, esValido) {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.classList.remove("campo-error", "campo-valido");
    campo.classList.add(esValido ? "campo-valido" : "campo-error");
}
function validarTexto(idCampo, idError, nombreCampo, minimo) {
    const valor = document.getElementById(idCampo).value.trim();
    if (!valor) { mostrarError(idError, nombreCampo + " es obligatorio."); marcarCampo(idCampo, false); return false; }
    if (valor.length < minimo) { mostrarError(idError, nombreCampo + " debe tener al menos " + minimo + " caracteres."); marcarCampo(idCampo, false); return false; }
    limpiarError(idError); marcarCampo(idCampo, true); return true;
}
function validarCorreo(idCampo, idError) {
    const correo = document.getElementById(idCampo).value.trim();
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!expresion.test(correo)) { mostrarError(idError, "Ingrese un correo valido."); marcarCampo(idCampo, false); return false; }
    limpiarError(idError); marcarCampo(idCampo, true); return true;
}

const formResponsable = document.getElementById("formResponsable");
const btnLimpiarResponsable = document.getElementById("btnLimpiar");

function obtenerFormularioResponsable() {
    return {
        identificacion:  document.getElementById("identificacion").value.trim(),
        correo:          document.getElementById("correo").value.trim().toLowerCase(),
        nombre:          document.getElementById("nombre").value.trim(),
        primerApellido:  document.getElementById("primerApellido").value.trim(),
        segundoApellido: document.getElementById("segundoApellido").value.trim(),
        telefono:        document.getElementById("telefono").value.trim(),
        especialidad:    document.getElementById("especialidad").value.trim(),
        institucion:     document.getElementById("institucion").value.trim(),
        biografia:       document.getElementById("biografia").value.trim()
        // fotografia: pendiente hasta que exista sistema de subida de archivos
    };
}

function validarResponsable() {
    const validaciones = [
        validarTexto("identificacion", "errorIdentificacion", "La identificacion", 5),
        validarCorreo("correo", "errorCorreo"),
        validarTexto("nombre", "errorNombre", "El nombre", 2),
        validarTexto("primerApellido", "errorPrimerApellido", "El primer Apellido", 2),
        validarTexto("segundoApellido", "errorSegundoApellido", "El segundo Apellido", 2),
        validarTexto("telefono", "errorTelefono", "El telefono", 8),
        validarTexto("especialidad", "errorEspecialidad", "La especialidad", 3),
        validarTexto("institucion", "errorInstitucion", "La institucion", 2),
        validarTexto("biografia", "errorBiografia", "La biografia", 2)
    ];
    return validaciones.every(v => v === true);
}

// ======================================================
// REGISTRAR RESPONSABLE EN LA API (HUGR-21)
// ======================================================
async function guardarResponsable(evento) {
    evento.preventDefault();

    if (!validarResponsable()) return;

    // FormData armado a mano (el HTML no tiene name= en todos los campos,
    // así que no podemos usar "new FormData(formResponsable)" directo)
    const datosFormulario = new FormData();
    datosFormulario.append("identificacion", document.getElementById("identificacion").value.trim());
    datosFormulario.append("correo", document.getElementById("correo").value.trim().toLowerCase());
    datosFormulario.append("nombre", document.getElementById("nombre").value.trim());
    datosFormulario.append("primerApellido", document.getElementById("primerApellido").value.trim());
    datosFormulario.append("segundoApellido", document.getElementById("segundoApellido").value.trim());
    datosFormulario.append("telefono", document.getElementById("telefono").value.trim());
    datosFormulario.append("especialidad", document.getElementById("especialidad").value.trim());
    datosFormulario.append("institucion", document.getElementById("institucion").value.trim());
    datosFormulario.append("biografia", document.getElementById("biografia").value.trim());

    const archivoFoto = document.getElementById("fotografia").files[0];
    if (archivoFoto) {
        datosFormulario.append("fotografia", archivoFoto);
    }

    const botonGuardar = formResponsable.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_RESPONSABLES, {
            method: "POST",
            body: datosFormulario
            // sin "Content-Type": el navegador lo arma solo con el boundary correcto
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            if (resultado.mensaje && resultado.mensaje.toLowerCase().includes("identificación")) {
                marcarCampo("identificacion", false);
                mostrarError("errorIdentificacion", resultado.mensaje);
            } else if (resultado.mensaje && resultado.mensaje.toLowerCase().includes("correo")) {
                marcarCampo("correo", false);
                mostrarError("errorCorreo", resultado.mensaje);
            } else {
                alert(resultado.mensaje || "Ocurrió un error al guardar el responsable.");
            }
            return;
        }

        alert("Responsable guardado correctamente.");
        limpiarFormularioResponsable();

    } catch (error) {
        console.error("Error al guardar responsable:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
}

function limpiarFormularioResponsable() {
    formResponsable.reset();
    formResponsable.querySelectorAll("input, textarea").forEach(campo => {
        campo.classList.remove("campo-valido", "campo-error");
    });
    formResponsable.querySelectorAll(".mensaje-error").forEach(error => {
        error.textContent = "";
    });
}

// ── Eventos y arranque
formResponsable.addEventListener("submit", guardarResponsable);
btnLimpiarResponsable.addEventListener("click", limpiarFormularioResponsable);