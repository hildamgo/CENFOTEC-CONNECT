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

// ── Cargar espacios disponibles (localStorage, módulo de Espacios)
function cargarEspacios() {
    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    espacioActividad.innerHTML = '<option value="">Seleccione un espacio</option>';
    espacios.filter(e => e.estado === "Disponible").forEach(e => {
        espacioActividad.innerHTML += `<option value="${e.id}">${e.nombre} - ${e.sede}</option>`;
    });
}

// ── Cargar responsables (ya migrado a Mongo — viene de la API)
async function cargarResponsables() {
    responsableActividad.innerHTML = '<option value="">Seleccione un responsable</option>';

    try {
        const respuesta = await fetch("/api/responsables");
        const responsables = await respuesta.json();

        responsables.forEach(r => {
            const nombreCompleto = `${r.nombre} ${r.primerApellido} ${r.segundoApellido}`;
            responsableActividad.innerHTML += `<option value="${nombreCompleto}">${nombreCompleto}</option>`;
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

    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    const espacio = espacios.find(e => e.id === espacioActividad.value);

    let lugar = document.getElementById("lugarExterno").value.trim();
    if (tipoLugar.value === "interno") {
        lugar = `${espacio.nombre} - ${espacio.sede}`;
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
formActividad.addEventListener("submit", guardarActividad);

cargarEspacios();
cargarResponsables();
cambiarTipoLugar();