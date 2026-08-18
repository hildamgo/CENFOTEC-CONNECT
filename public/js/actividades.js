// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_ACTIVIDADES = "/api/actividades";

const formActividad        = document.getElementById("formActividad");
const tipoLugar             = document.getElementById("tipoLugar");
const grupoEspacioInterno   = document.getElementById("grupoEspacioInterno");
const grupoLugarExterno     = document.getElementById("grupoLugarExterno");
const espacioActividad      = document.getElementById("espacioActividad");
const responsableActividad  = document.getElementById("responsableActividad");

// ── Cargar espacios disponibles (vienen de Mongo vía la API)
async function cargarEspacios() {
    espacioActividad.innerHTML = '<option value="">Seleccione un espacio</option>';

    try {
        const respuesta = await fetch("/api/espacios");
        const espacios = await respuesta.json();

        espacios
            .filter(e => e.estado === "Disponible")
            .forEach(e => {
                const opcion = document.createElement("option");
                opcion.value = e._id;
                opcion.textContent = `${e.nombre} - ${e.sede}`;
                espacioActividad.appendChild(opcion);
            });
    } catch (error) {
        console.error("Error al cargar espacios:", error);
    }
}

// ── Cargar responsables (vienen de Mongo vía la API)
async function cargarResponsables() {
    responsableActividad.innerHTML = '<option value="">Seleccione un responsable</option>';

    try {
        const respuesta = await fetch("/api/responsables");
        const responsables = await respuesta.json();

        responsables.forEach(r => {
            const nombreCompleto = `${r.nombre} ${r.primerApellido} ${r.segundoApellido}`;
            const opcion = document.createElement("option");
            opcion.value = nombreCompleto;
            opcion.textContent = nombreCompleto;
            responsableActividad.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error al cargar responsables:", error);
    }
}

// ── Mostrar/ocultar espacio interno vs lugar externo
function cambiarTipoLugar() {
    grupoEspacioInterno.style.display = "none";
    grupoLugarExterno.style.display = "none";

    if (tipoLugar.value === "interno") {
        grupoEspacioInterno.style.display = "block";
    } else if (tipoLugar.value === "externo") {
        grupoLugarExterno.style.display = "block";
    }
}

// ── Entrada libre, sin cupo limitado
function toggleEntradaLibre() {
    const campo = document.getElementById("cupoActividad");
    if (document.getElementById("entradaLibre").checked) {
        campo.value = "";
        campo.disabled = true;
    } else {
        campo.disabled = false;
    }
}
// ======================================================
// REFERENCIAS DOM - Panel de asistencia IA
// ======================================================
const botonMejorarDescripcion = document.getElementById("btnMejorarDescripcion");
const panelSugerenciaIA = document.getElementById("panelSugerenciaIA");
const descripcionOriginalIA = document.getElementById("descripcionOriginalIA");
const descripcionSugeridaIA = document.getElementById("descripcionSugeridaIA");

botonMejorarDescripcion.addEventListener("click", solicitarMejoraDescripcion);

document
    .getElementById("btnAceptarSugerenciaIA")
    .addEventListener("click", aceptarSugerenciaDescripcion);

document
    .getElementById("btnRechazarSugerenciaIA")
    .addEventListener("click", cerrarSugerenciaDescripcion);

// ── Validación del formulario (en el navegador, antes de mandar a la API)
function validarActividad() {
    let valido = true;

    if (!validarTexto("nombreActividad", "errorNombreActividad", "El nombre", 3)) valido = false;
    if (!validarTexto("descripcionActividad", "errorDescripcionActividad", "La descripcion", 10)) valido = false;

    if (document.getElementById("categoriaActividad").value === "") {
        mostrarError("errorCategoriaActividad", "Seleccione una categoria.");
        valido = false;
    } else limpiarError("errorCategoriaActividad");

    if (document.getElementById("fechaActividad").value === "") {
        mostrarError("errorFechaActividad", "Seleccione una fecha.");
        valido = false;
    } else limpiarError("errorFechaActividad");

    if (document.getElementById("horaInicio").value === "") {
        mostrarError("errorHoraInicio", "Seleccione la hora de inicio.");
        valido = false;
    } else limpiarError("errorHoraInicio");

    if (document.getElementById("horaFin").value === "") {
        mostrarError("errorHoraFin", "Seleccione la hora de fin.");
        valido = false;
    } else limpiarError("errorHoraFin");

    if (tipoLugar.value === "") {
        mostrarError("errorTipoLugar", "Seleccione el tipo de lugar.");
        valido = false;
    } else limpiarError("errorTipoLugar");

    if (tipoLugar.value === "interno" && espacioActividad.value === "") {
        mostrarError("errorEspacioActividad", "Seleccione un espacio.");
        valido = false;
    }

    if (tipoLugar.value === "externo" && !validarTexto("lugarExterno", "errorLugarExterno", "El lugar externo", 3)) {
        valido = false;
    }

    const esEntradaLibre = document.getElementById("entradaLibre").checked;
    const cupo = document.getElementById("cupoActividad").value;

    if (!esEntradaLibre && (cupo === "" || Number(cupo) <= 0)) {
        mostrarError("errorCupoActividad", "El cupo debe ser mayor a 0, o marque entrada libre.");
        valido = false;
    } else limpiarError("errorCupoActividad");

    if (responsableActividad.value === "") {
        mostrarError("errorResponsableActividad", "Seleccione un responsable.");
        valido = false;
    } else limpiarError("errorResponsableActividad");

    return valido;
}

// ======================================================
// GUARDAR ACTIVIDAD EN LA API (HUGA-10)
// ======================================================
async function guardarActividad(evento) {
    evento.preventDefault();

    if (!validarActividad()) return;

    // CORRECCIÓN: antes se buscaba el espacio en localStorage con
    // obtenerDatos(CLAVE_ESPACIOS) y se comparaba por "id". Los espacios
    // ya viven en Mongo y llegan por /api/espacios con "_id", así que
    // ahora se toma directo del <select>, que ya viene poblado desde la API.
    let lugar = "";
    let espacioId = "";

    if (tipoLugar.value === "interno") {
        const opcionSeleccionada = espacioActividad.selectedOptions[0];
        lugar = opcionSeleccionada ? opcionSeleccionada.textContent.trim() : "";
        espacioId = espacioActividad.value;
    } else {
        lugar = document.getElementById("lugarExterno").value.trim();
    }

    const esEntradaLibre = document.getElementById("entradaLibre").checked;

    const nuevaActividad = {
        nombre: document.getElementById("nombreActividad").value.trim(),
        categoria: document.getElementById("categoriaActividad").value,
        descripcion: document.getElementById("descripcionActividad").value.trim(),
        fecha: document.getElementById("fechaActividad").value,
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        lugar: lugar,
        espacioId: tipoLugar.value === "interno" ? espacioId : "",
        entradaLibre: esEntradaLibre,
        cupoMaximo: esEntradaLibre ? null : Number(document.getElementById("cupoActividad").value),
        responsableNombre: responsableActividad.value
    };

    const botonGuardar = formActividad.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_ACTIVIDADES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaActividad)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(resultado.mensaje || "Ocurrió un error al guardar la actividad.");
            return;
        }

        formActividad.reset();
        cambiarTipoLugar();
        alert("Actividad guardada correctamente.");

    } catch (error) {
        console.error("Error al guardar actividad:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
}

// ── Eventos y arranque
document.getElementById("btnLimpiar").addEventListener("click", function () {
    formActividad.reset();
    cambiarTipoLugar();
    ["errorNombreActividad","errorCategoriaActividad","errorDescripcionActividad","errorFechaActividad",
     "errorHoraInicio","errorHoraFin","errorTipoLugar","errorEspacioActividad","errorLugarExterno",
     "errorCupoActividad","errorResponsableActividad"].forEach(limpiarError);
});

tipoLugar.addEventListener("change", cambiarTipoLugar);
document.getElementById("entradaLibre").addEventListener("change", toggleEntradaLibre);
formActividad.addEventListener("submit", guardarActividad);

cargarEspacios();
cargarResponsables();
cambiarTipoLugar();