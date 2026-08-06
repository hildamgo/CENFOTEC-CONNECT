// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_ACTIVIDADES = "/api/actividades";

// Espacios y Responsables siguen en localStorage (esos módulos no son míos todavía)
const formActividad        = document.getElementById("formActividad");
const tipoLugar             = document.getElementById("tipoLugar");
const grupoEspacioInterno   = document.getElementById("grupoEspacioInterno");
const grupoLugarExterno     = document.getElementById("grupoLugarExterno");
const espacioActividad      = document.getElementById("espacioActividad");
const responsableActividad  = document.getElementById("responsableActividad");
const buscarActividad       = document.getElementById("buscarActividad");
const tablaActividades      = document.getElementById("tablaActividades");
const btnVerActividades     = document.getElementById("btnVerActividades");

// ── Cargar espacios disponibles (localStorage, módulo de Espacios)
function cargarEspacios() {
    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    espacioActividad.innerHTML = '<option value="">Seleccione un espacio</option>';
    espacios.filter(e => e.estado === "Disponible").forEach(e => {
        espacioActividad.innerHTML += `<option value="${e.id}">${e.nombre} - ${e.sede}</option>`;
    });
}

// ── Cargar responsables (localStorage, módulo de Responsables)
function cargarResponsables() {
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);
    responsableActividad.innerHTML = '<option value="">Seleccione un responsable</option>';
    responsables.forEach(r => {
        const nombreCompleto = `${r.nombre} ${r.primerApellido} ${r.segundoApellido}`;
        responsableActividad.innerHTML += `<option value="${r.id}">${nombreCompleto}</option>`;
    });
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
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);

    const espacio = espacios.find(e => e.id === espacioActividad.value);
    const responsable = responsables.find(r => r.id === responsableActividad.value);

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
        responsableNombre: `${responsable.nombre} ${responsable.primerApellido}`
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
        await mostrarActividades();

    } catch (error) {
        console.error("Error al guardar actividad:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
}

// ── Ver el detalle de la actividad
function verDetalleActividad(id) {
    window.location.href = "detalle-actividad.html?id=" + id;
}

// ======================================================
// CONSULTAR ACTIVIDADES DESDE LA API (HUGA-14, HUGA-16)
// ======================================================
async function mostrarActividades() {
    const busqueda  = buscarActividad.value.trim();
    const fCategoria = document.getElementById("filtroCategoria").value;
    const fEstado    = document.getElementById("filtroEstado").value;
    const fFecha     = document.getElementById("filtroFecha").value;
    const fLugar     = document.getElementById("filtroLugar").value.trim();

    const params = new URLSearchParams();
    if (busqueda)   params.append("buscar", busqueda);
    if (fCategoria) params.append("categoria", fCategoria);
    if (fEstado)    params.append("estado", fEstado);
    if (fFecha)     params.append("fecha", fFecha);
    if (fLugar)     params.append("lugar", fLugar);

    tablaActividades.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#888;padding:20px;">Cargando...</td></tr>';

    try {
        const respuesta = await fetch(API_ACTIVIDADES + "?" + params.toString());
        if (!respuesta.ok) throw new Error("Respuesta no válida del servidor");

        const actividades = await respuesta.json();

        if (!actividades.length) {
            tablaActividades.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
            return;
        }

        // Guarda las actividades "Disponibles" en localStorage para que
        // Inscripciones (y este mismo formulario) puedan usarlas mientras
        // ese flujo de datos no esté 100% migrado.
        guardarDatos(CLAVE_ACTIVIDADES, actividades.map(a => ({
            id: a._id,
            nombre: a.nombre,
            categoria: a.categoria,
            fecha: a.fecha,
            cupoMaximo: a.cupoMaximo,
            cuposOcupados: a.cuposOcupados,
            estado: a.estado
        })));

        tablaActividades.innerHTML = actividades.map(a => {
            const cupoMax  = a.entradaLibre ? "Libre" : a.cupoMaximo;
            const cupoDisp = a.entradaLibre ? "Libre" : (a.cupoMaximo - a.cuposOcupados);
            return `<tr>
                <td>${a.nombre}</td><td>${a.categoria}</td><td>${a.fecha}</td>
                <td>${a.horaInicio} - ${a.horaFin}</td><td>${a.lugar}</td>
                <td>${cupoMax}</td><td>${a.cuposOcupados}</td><td>${cupoDisp}</td>
                <td>${a.responsableNombre}</td><td>${a.estado}</td>
                <td><button onclick="verDetalleActividad('${a._id}')">Ver</button></td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al consultar actividades:", error);
        tablaActividades.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#c0392b;padding:20px;">No se pudo conectar con el servidor.</td></tr>';
    }
}

// ── Limpiar filtros
function limpiarFiltros() {
    document.getElementById("filtroCategoria").value = "";
    document.getElementById("filtroEstado").value = "";
    document.getElementById("filtroFecha").value = "";
    document.getElementById("filtroLugar").value = "";
    buscarActividad.value = "";
    mostrarActividades();
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
btnVerActividades.addEventListener("click", mostrarActividades);
buscarActividad.addEventListener("input", mostrarActividades);
document.getElementById("filtroCategoria").addEventListener("change", mostrarActividades);
document.getElementById("filtroEstado").addEventListener("change", mostrarActividades);
document.getElementById("filtroFecha").addEventListener("change", mostrarActividades);
document.getElementById("filtroLugar").addEventListener("input", mostrarActividades);

cargarEspacios();
cargarResponsables();
cambiarTipoLugar();
tablaActividades.innerHTML = '<tr><td colspan="11" style="text-align:center;color:#888;padding:20px;">Presioná "Ver Actividades" para cargar la lista.</td></tr>';