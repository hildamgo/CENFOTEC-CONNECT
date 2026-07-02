// Variables globales
const formActividad = document.getElementById("formActividad");
const formEdicionActividad = document.getElementById("formEdicionActividad");
const tipoLugar = document.getElementById("tipoLugar");
const grupoEspacioInterno = document.getElementById("grupoEspacioInterno");
const grupoLugarExterno = document.getElementById("grupoLugarExterno");
const espacioActividad = document.getElementById("espacioActividad");
const responsableActividad = document.getElementById("responsableActividad");
const buscarActividad = document.getElementById("buscarActividad");
const tablaActividades = document.getElementById("tablaActividades");

let idEditando = null;

// Cambia entre lugar interno o externo
function cambiarTipoLugar() {
    grupoEspacioInterno.style.display = "none";
    grupoLugarExterno.style.display = "none";

    if (tipoLugar.value === "interno") {
        grupoEspacioInterno.style.display = "block";
    } else if (tipoLugar.value === "externo") {
        grupoLugarExterno.style.display = "block";
    }
}

// Entrada libre (RF-18)
function toggleEntradaLibre() {
    const campo = document.getElementById('cupoActividad');
    if (document.getElementById('entradaLibre').checked) {
        campo.value = '';
        campo.disabled = true;
    } else {
        campo.disabled = false;
    }
}

function toggleEditEntradaLibre() {
    const campo = document.getElementById('editCupo');
    if (document.getElementById('editEntradaLibre').checked) {
        campo.value = '';
        campo.disabled = true;
    } else {
        campo.disabled = false;
    }
}

// Valida el formulario de registro
function validarActividad() {
    let valido = true;

    if (!validarTexto("nombreActividad", "errorNombreActividad", "El nombre", 3)) valido = false;
    if (!validarTexto("descripcionActividad", "errorDescripcionActividad", "La descripcion", 10)) valido = false;

    if (document.getElementById("categoriaActividad").value === "") {
        mostrarError("errorCategoriaActividad", "Seleccione una categoria.");
        valido = false;
    } else {
        limpiarError("errorCategoriaActividad");
    }

    if (document.getElementById("fechaActividad").value === "") {
        mostrarError("errorFechaActividad", "Seleccione una fecha.");
        valido = false;
    } else {
        limpiarError("errorFechaActividad");
    }

    if (document.getElementById("horaInicio").value === "") {
        mostrarError("errorHoraInicio", "Seleccione la hora de inicio.");
        valido = false;
    } else {
        limpiarError("errorHoraInicio");
    }

    if (document.getElementById("horaFin").value === "") {
        mostrarError("errorHoraFin", "Seleccione la hora de fin.");
        valido = false;
    } else {
        limpiarError("errorHoraFin");
    }

    if (tipoLugar.value === "") {
        mostrarError("errorTipoLugar", "Seleccione el tipo de lugar.");
        valido = false;
    } else {
        limpiarError("errorTipoLugar");
    }

    if (tipoLugar.value === "externo" && !validarTexto("lugarExterno", "errorLugarExterno", "El lugar externo", 3)) {
        valido = false;
    }

    // Cupo respeta entrada libre (RF-18)
    const esEntradaLibre = document.getElementById('entradaLibre').checked;
    const cupo = document.getElementById("cupoActividad").value;

    if (!esEntradaLibre && (cupo === "" || Number(cupo) <= 0)) {
        mostrarError("errorCupoActividad", "El cupo debe ser mayor a 0, o marque entrada libre.");
        valido = false;
    } else {
        limpiarError("errorCupoActividad");
    }

    return valido;
}

// Guarda una nueva actividad (RF-10, RF-11, RF-12)
function guardarActividad(evento) {
    evento.preventDefault();
    if (!validarActividad()) return;

    const esEntradaLibre = document.getElementById('entradaLibre').checked;

    let lugar = "";
    if (tipoLugar.value === "interno") {
        lugar = "Interno";
    } else if (tipoLugar.value === "externo") {
        lugar = document.getElementById("lugarExterno").value.trim();
    }

    const actividad = {
        id: crearId(),
        nombre: document.getElementById("nombreActividad").value.trim(),
        categoria: document.getElementById("categoriaActividad").value,
        descripcion: document.getElementById("descripcionActividad").value.trim(),
        fecha: document.getElementById("fechaActividad").value,
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        lugar: lugar,
        cupoMaximo: esEntradaLibre ? null : Number(document.getElementById("cupoActividad").value),
        entradaLibre: esEntradaLibre,
        cuposOcupados: 0,
        responsableNombre: "Pendiente",
        estado: "Disponible"
    };

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    actividades.push(actividad);
    guardarDatos(CLAVE_ACTIVIDADES, actividades);

    formActividad.reset();
    cambiarTipoLugar();
    mostrarActividades();
    alert("Actividad guardada correctamente.");
}

// Actualiza el estado de la actividad (RF-12)
function actualizarEstado(actividad) {
    if (actividad.estado === 'Cancelada') return actividad;

    const fechaHoraFin = new Date(actividad.fecha + 'T' + actividad.horaFin);
    if (new Date() > fechaHoraFin) {
        actividad.estado = 'Finalizada';
        return actividad;
    }

    if (!actividad.entradaLibre && actividad.cuposOcupados >= actividad.cupoMaximo) {
        actividad.estado = 'Llena';
        return actividad;
    }

    actividad.estado = 'Disponible';
    return actividad;
}

// Cancela una actividad (RF-12, RF-17)
function cancelarActividad(id) {
    if (!confirm('¿Cancelar esta actividad?')) return;

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    const indice = actividades.findIndex(function(a) { return a.id === id; });

    if (indice === -1) return;

    actividades[indice].estado = 'Cancelada';
    guardarDatos(CLAVE_ACTIVIDADES, actividades);
    mostrarActividades();
    alert('Actividad cancelada.');
}

// Elimina una actividad si cumple las reglas (RF-17)
function eliminarActividad(id) {
    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);

    const indice = actividades.findIndex(function(a) { return a.id === id; });
    if (indice === -1) return;

    const actividad = actividades[indice];

    if (actividad.estado === 'Finalizada') {
        alert('No se puede eliminar una actividad finalizada.');
        return;
    }

    if (!confirm('¿Eliminar esta actividad? Esta acción no se puede deshacer.')) return;

    actividades.splice(indice, 1);
    guardarDatos(CLAVE_ACTIVIDADES, actividades);
    mostrarActividades();
    alert('Actividad eliminada.');
}

// Ver detalle (RF-15)
function verDetalleActividad(id) {
    window.location.href = 'detalle-actividad.html?id=' + id;
}

// Abrir formulario de edición (RF-13, RF-17)
function abrirEdicionActividad(id) {
    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    const actividad = actividades.find(function(a) { return a.id === id; });

    if (!actividad) return;

    idEditando = id;

    document.getElementById('editId').value = actividad.id;
    document.getElementById('editNombre').value = actividad.nombre;
    document.getElementById('editCategoria').value = actividad.categoria;
    document.getElementById('editDescripcion').value = actividad.descripcion;
    document.getElementById('editFecha').value = actividad.fecha;
    document.getElementById('editHoraInicio').value = actividad.horaInicio;
    document.getElementById('editHoraFin').value = actividad.horaFin;

    const campoCupo = document.getElementById('editCupo');
    const checkboxEntrada = document.getElementById('editEntradaLibre');

    if (actividad.entradaLibre) {
        checkboxEntrada.checked = true;
        campoCupo.value = '';
        campoCupo.disabled = true;
    } else {
        checkboxEntrada.checked = false;
        campoCupo.value = actividad.cupoMaximo;
        campoCupo.disabled = false;
    }

    document.getElementById('seccionEdicion').style.display = 'block';
    document.getElementById('seccionEdicion').scrollIntoView({ behavior: 'smooth' });
}

// Cierra edición
function cerrarEdicionActividad() {
    document.getElementById('seccionEdicion').style.display = 'none';
    idEditando = null;
}

// Guarda cambios de edición (RF-13)
function guardarEdicionActividad(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('editNombre').value.trim();
    const categoria = document.getElementById('editCategoria').value;
    const descripcion = document.getElementById('editDescripcion').value.trim();
    const fecha = document.getElementById('editFecha').value;
    const horaInicio = document.getElementById('editHoraInicio').value;
    const horaFin = document.getElementById('editHoraFin').value;
    const esEntradaLibre = document.getElementById('editEntradaLibre').checked;
    const cupo = Number(document.getElementById('editCupo').value);

    let esValido = true;

    if (nombre === '') { mostrarError('errorEditNombre', 'El nombre es obligatorio.'); esValido = false; }
    else limpiarError('errorEditNombre');

    if (categoria === '') { mostrarError('errorEditCategoria', 'Seleccione una categoria.'); esValido = false; }
    else limpiarError('errorEditCategoria');

    if (descripcion.length < 10) { mostrarError('errorEditDescripcion', 'La descripcion es muy corta.'); esValido = false; }
    else limpiarError('errorEditDescripcion');

    if (fecha === '') { mostrarError('errorEditFecha', 'Seleccione una fecha.'); esValido = false; }
    else limpiarError('errorEditFecha');

    if (horaInicio === '') { mostrarError('errorEditHoraInicio', 'Seleccione la hora inicio.'); esValido = false; }
    else limpiarError('errorEditHoraInicio');

    if (horaFin === '') { mostrarError('errorEditHoraFin', 'Seleccione la hora fin.'); esValido = false; }
    else limpiarError('errorEditHoraFin');

    // RF-13: cupo no puede ser menor a los inscritos
    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    const indice = actividades.findIndex(function(a) { return a.id === idEditando; });
    const cuposOcupados = actividades[indice].cuposOcupados;

    if (!esEntradaLibre) {
        if (cupo <= 0 || isNaN(cupo)) {
            mostrarError('errorEditCupo', 'El cupo debe ser mayor a 0.');
            esValido = false;
        } else if (cupo < cuposOcupados) {
            mostrarError('errorEditCupo', 'El cupo no puede ser menor a los inscritos (' + cuposOcupados + ').');
            esValido = false;
        } else {
            limpiarError('errorEditCupo');
        }
    } else {
        limpiarError('errorEditCupo');
    }

    if (!esValido) return;

    actividades[indice].nombre = nombre;
    actividades[indice].categoria = categoria;
    actividades[indice].descripcion = descripcion;
    actividades[indice].fecha = fecha;
    actividades[indice].horaInicio = horaInicio;
    actividades[indice].horaFin = horaFin;
    actividades[indice].cupoMaximo = esEntradaLibre ? null : cupo;
    actividades[indice].entradaLibre = esEntradaLibre;

    guardarDatos(CLAVE_ACTIVIDADES, actividades);
    cerrarEdicionActividad();
    mostrarActividades();
    alert('Actividad actualizada.');
}

// Muestra la tabla con búsqueda y filtros (RF-14, RF-16)
function mostrarActividades() {
    const busqueda = buscarActividad.value.toLowerCase();
    const fCategoria = document.getElementById('filtroCategoria').value;
    const fEstado = document.getElementById('filtroEstado').value;
    const fFecha = document.getElementById('filtroFecha').value;
    const fLugar = document.getElementById('filtroLugar').value.toLowerCase();

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);

    tablaActividades.innerHTML = '';

    for (let i = 0; i < actividades.length; i++) {
        let actividad = actualizarEstado(actividades[i]);

        // Aplicar búsqueda
        const texto = (actividad.nombre + ' ' + actividad.lugar + ' ' + actividad.descripcion).toLowerCase();
        if (busqueda && texto.indexOf(busqueda) === -1) continue;

        // Aplicar filtros
        if (fCategoria && actividad.categoria !== fCategoria) continue;
        if (fEstado && actividad.estado !== fEstado) continue;
        if (fFecha && actividad.fecha !== fFecha) continue;
        if (fLugar && actividad.lugar.toLowerCase().indexOf(fLugar) === -1) continue;

        // Cupos
        const cupoMax = actividad.entradaLibre ? 'Libre' : actividad.cupoMaximo;
        const cupoDisp = actividad.entradaLibre ? 'Libre' : (actividad.cupoMaximo - actividad.cuposOcupados);

        // Botones según estado
        let botones = '<button onclick="verDetalleActividad(\'' + actividad.id + '\')">Ver</button> ';
        botones += '<button onclick="eliminarActividad(\'' + actividad.id + '\')">Eliminar</button>';

        if (actividad.estado !== 'Cancelada' && actividad.estado !== 'Finalizada') {
            botones = '<button onclick="abrirEdicionActividad(\'' + actividad.id + '\')">Editar</button> ' +
                      '<button onclick="verDetalleActividad(\'' + actividad.id + '\')">Ver</button> ' +
                      '<button onclick="cancelarActividad(\'' + actividad.id + '\')">Cancelar</button> ' +
                      '<button onclick="eliminarActividad(\'' + actividad.id + '\')">Eliminar</button>';
        }

        // Crear fila
        const fila = '<tr>' +
            '<td>' + actividad.id + '</td>' +
            '<td>' + actividad.nombre + '</td>' +
            '<td>' + actividad.categoria + '</td>' +
            '<td>' + actividad.fecha + '</td>' +
            '<td>' + actividad.horaInicio + ' - ' + actividad.horaFin + '</td>' +
            '<td>' + actividad.lugar + '</td>' +
            '<td>' + cupoMax + '</td>' +
            '<td>' + actividad.cuposOcupados + '</td>' +
            '<td>' + cupoDisp + '</td>' +
            '<td>' + actividad.estado + '</td>' +
            '<td>' + botones + '</td>' +
        '</tr>';

        tablaActividades.innerHTML += fila;
    }
}

// Limpia filtros
function limpiarFiltros() {
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFecha').value = '';
    document.getElementById('filtroLugar').value = '';
    buscarActividad.value = '';
    mostrarActividades();
}

// Eventos
tipoLugar.addEventListener("change", cambiarTipoLugar);
formActividad.addEventListener("submit", guardarActividad);
formEdicionActividad.addEventListener("submit", guardarEdicionActividad);
buscarActividad.addEventListener("input", mostrarActividades);

// Carga inicial
cambiarTipoLugar();
mostrarActividades();