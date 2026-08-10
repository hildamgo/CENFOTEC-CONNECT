// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
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
function validarUrl(idCampo, idError) {
    const url = document.getElementById(idCampo).value.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) { mostrarError(idError, "Ingrese una URL valida."); marcarCampo(idCampo, false); return false; }
    limpiarError(idError); marcarCampo(idCampo, true); return true;
}

const formResponsable       = document.getElementById("formResponsable");
const tablaResponsable      = document.getElementById("tablaResponsables");
const buscarResponsable     = document.getElementById("buscarResponsable");
const btnLimpiarResponsable = document.getElementById("btnLimpiar");
const btnVerResponsables    = document.getElementById("btnVerResponsables");

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
        biografia:       document.getElementById("biografia").value.trim(),
        fotografia:      document.getElementById("fotografia").value.trim()
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
        validarTexto("biografia", "errorBiografia", "La biografia", 2),
        validarUrl("fotografia", "errorFotografia")
    ];
    return validaciones.every(v => v === true);
}

// ======================================================
// REGISTRAR RESPONSABLE EN LA API (HUGR-21)
// ======================================================
async function guardarResponsable(evento) {
    evento.preventDefault();

    if (!validarResponsable()) return;

    const nuevoResponsable = obtenerFormularioResponsable();
    const botonGuardar = formResponsable.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_RESPONSABLES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoResponsable)
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
        await mostrarResponsables();

    } catch (error) {
        console.error("Error al guardar responsable:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
}

// ======================================================
// CONSULTAR RESPONSABLES DESDE LA API (HUGR-24)
// ======================================================
async function mostrarResponsables() {
    const texto = buscarResponsable.value.trim();
    const params = new URLSearchParams();
    if (texto) params.append("buscar", texto);

    tablaResponsable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:20px;">Cargando...</td></tr>';

    try {
        const respuesta = await fetch(API_RESPONSABLES + "?" + params.toString());
        if (!respuesta.ok) throw new Error("Respuesta no válida del servidor");

        const responsables = await respuesta.json();

        if (!responsables.length) {
            tablaResponsable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
            return;
        }

        tablaResponsable.innerHTML = responsables.map(function (r) {
            const fecha = new Date(r.fechaRegistro).toLocaleDateString("es-CR");
            return `<tr>
                <td>${r.nombre} ${r.primerApellido} ${r.segundoApellido}</td>
                <td>${r.identificacion}</td>
                <td>${r.correo}</td>
                <td>${r.especialidad}</td>
                <td>${fecha}</td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al consultar responsables:", error);
        tablaResponsable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#c0392b;padding:20px;">No se pudo conectar con el servidor.</td></tr>';
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
btnVerResponsables.addEventListener("click", mostrarResponsables);
buscarResponsable.addEventListener("input", mostrarResponsables);
btnLimpiarResponsable.addEventListener("click", limpiarFormularioResponsable);

tablaResponsable.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:20px;">Presioná "Ver Responsables" para cargar la lista.</td></tr>';