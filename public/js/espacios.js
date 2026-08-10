// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_ESPACIOS = "/api/espacios";

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

const formEspacio      = document.getElementById("formEspacio");
const tablaEspacios    = document.getElementById("tablaEspacios");
const buscarEspacio    = document.getElementById("buscarEspacio");
const btnLimpiarEspacio = document.getElementById("btnLimpiarEspacio");
const btnVerEspacios   = document.getElementById("btnVerEspacios");

function obtenerFormularioEspacio() {
    return {
        nombre: document.getElementById("nombreEspacio").value.trim(),
        sede: document.getElementById("sedeEspacio").value.trim(),
        estado: document.getElementById("estadoEspacio").value
    };
}

function validarEspacio() {
    const nombreValido = validarTexto("nombreEspacio", "errorNombreEspacio", "El nombre del espacio", 2);
    const sedeValida = validarTexto("sedeEspacio", "errorSedeEspacio", "La sede", 2);
    return nombreValido && sedeValida;
}

// ======================================================
// REGISTRAR ESPACIO EN LA API (HUGL-19)
// ======================================================
async function guardarEspacio(evento) {
    evento.preventDefault();

    if (!validarEspacio()) return;

    const nuevoEspacio = obtenerFormularioEspacio();
    const botonGuardar = formEspacio.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_ESPACIOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoEspacio)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            mostrarError("errorNombreEspacio", resultado.mensaje || "Ocurrió un error al guardar el espacio.");
            marcarCampo("nombreEspacio", false);
            return;
        }

        alert("Espacio guardado correctamente.");
        limpiarFormularioEspacio();
        await mostrarEspacios();

    } catch (error) {
        console.error("Error al guardar espacio:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
}

// ======================================================
// CONSULTAR ESPACIOS DESDE LA API
// ======================================================
async function mostrarEspacios() {
    const texto = buscarEspacio.value.trim();
    const params = new URLSearchParams();
    if (texto) params.append("buscar", texto);

    tablaEspacios.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;padding:20px;">Cargando...</td></tr>';

    try {
        const respuesta = await fetch(API_ESPACIOS + "?" + params.toString());
        if (!respuesta.ok) throw new Error("Respuesta no válida del servidor");

        const espacios = await respuesta.json();

        if (!espacios.length) {
            tablaEspacios.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
            return;
        }

        // Guarda los espacios "Disponibles" en localStorage para que
        // Actividades pueda seguir usándolos en su select mientras
        // ese flujo no esté 100% conectado directo a la API.
        guardarDatos(CLAVE_ESPACIOS, espacios.map(e => ({
            id: e._id,
            nombre: e.nombre,
            sede: e.sede,
            estado: e.estado
        })));

        tablaEspacios.innerHTML = espacios.map(function (e) {
            const fecha = new Date(e.fechaRegistro).toLocaleDateString("es-CR");
            return `<tr>
                <td>${e.nombre}</td>
                <td>${e.sede}</td>
                <td>${e.estado}</td>
                <td>${fecha}</td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al consultar espacios:", error);
        tablaEspacios.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#c0392b;padding:20px;">No se pudo conectar con el servidor.</td></tr>';
    }
}

function limpiarFormularioEspacio() {
    formEspacio.reset();
    limpiarError("errorNombreEspacio");
    limpiarError("errorSedeEspacio");
    document.getElementById("nombreEspacio").classList.remove("campo-error", "campo-valido");
    document.getElementById("sedeEspacio").classList.remove("campo-error", "campo-valido");
}

// ── Eventos y arranque
formEspacio.addEventListener("submit", guardarEspacio);
btnVerEspacios.addEventListener("click", mostrarEspacios);
buscarEspacio.addEventListener("input", mostrarEspacios);
btnLimpiarEspacio.addEventListener("click", limpiarFormularioEspacio);

tablaEspacios.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;padding:20px;">Presioná "Ver Espacios" para cargar la lista.</td></tr>';