const formActividad = document.getElementById("formActividad");
const tipoLugar = document.getElementById("tipoLugar");
const grupoEspacioInterno = document.getElementById("grupoEspacioInterno");
const grupoLugarExterno = document.getElementById("grupoLugarExterno");
const espacioActividad = document.getElementById("espacioActividad");
const responsableActividad = document.getElementById("responsableActividad");
const buscarActividad = document.getElementById("buscarActividad");
const tablaActividades = document.getElementById("tablaActividades");

function cargarEspacios() {
    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    espacioActividad.innerHTML = '<option value="">Seleccione un espacio</option>';
    espacios.forEach(function(espacio) {
        if (espacio.estado === "Disponible") {
            const opcion = document.createElement("option");
            opcion.value = espacio.id;
            opcion.textContent = espacio.nombre + " - " + espacio.sede;
            espacioActividad.appendChild(opcion);
        }
    });
}

function cargarResponsables() {
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);
    responsableActividad.innerHTML = '<option value="">Seleccione un responsable</option>';
    responsables.forEach(function(responsable) {
        const opcion = document.createElement("option");
        opcion.value = responsable.id;
        opcion.textContent = responsable.nombre + " " + responsable.primerApellido + " " + responsable.segundoApellido;
        responsableActividad.appendChild(opcion);
    });
}

function cambiarTipoLugar() {
    if (tipoLugar.value === "interno") {
        grupoEspacioInterno.style.display = "block";
        grupoLugarExterno.style.display = "none";
    } else if (tipoLugar.value === "externo") {
        grupoEspacioInterno.style.display = "none";
        grupoLugarExterno.style.display = "block";
    } else {
        grupoEspacioInterno.style.display = "none";
        grupoLugarExterno.style.display = "none";
    }
}

function validarActividad() {
    let valido = true;

    if (!validarTexto("nombreActividad", "errorNombreActividad", "El nombre de la actividad", 3)) {
        valido = false;
    }

    if (document.getElementById("categoriaActividad").value === "") {
        mostrarError("errorCategoriaActividad", "Seleccione una categoria.");
        marcarCampo("categoriaActividad", false);
        valido = false;
    } else {
        limpiarError("errorCategoriaActividad");
        marcarCampo("categoriaActividad", true);
    }

    if (!validarTexto("descripcionActividad", "errorDescripcionActividad", "La descripcion", 10)) {
        valido = false;
    }

    if (document.getElementById("fechaActividad").value === "") {
        mostrarError("errorFechaActividad", "Seleccione una fecha.");
        marcarCampo("fechaActividad", false);
        valido = false;
    } else {
        limpiarError("errorFechaActividad");
        marcarCampo("fechaActividad", true);
    }

    if (document.getElementById("horaInicio").value === "") {
        mostrarError("errorHoraInicio", "Seleccione la hora de inicio.");
        marcarCampo("horaInicio", false);
        valido = false;
    } else {
        limpiarError("errorHoraInicio");
        marcarCampo("horaInicio", true);
    }

    if (document.getElementById("horaFin").value === "") {
        mostrarError("errorHoraFin", "Seleccione la hora de fin.");
        marcarCampo("horaFin", false);
        valido = false;
    } else {
        limpiarError("errorHoraFin");
        marcarCampo("horaFin", true);
    }

    if (tipoLugar.value === "") {
        mostrarError("errorTipoLugar", "Seleccione el tipo de lugar.");
        marcarCampo("tipoLugar", false);
        valido = false;
    } else {
        limpiarError("errorTipoLugar");
        marcarCampo("tipoLugar", true);
    }

    if (tipoLugar.value === "interno" && espacioActividad.value === "") {
        mostrarError("errorEspacioActividad", "Seleccione un espacio registrado.");
        marcarCampo("espacioActividad", false);
        valido = false;
    } else {
        limpiarError("errorEspacioActividad");
    }

    if (tipoLugar.value === "externo" && !validarTexto("lugarExterno", "errorLugarExterno", "El lugar externo", 3)) {
        valido = false;
    }

    const cupo = document.getElementById("cupoActividad").value;
    if (cupo === "" || Number(cupo) <= 0) {
        mostrarError("errorCupoActividad", "El cupo debe ser mayor a 0.");
        marcarCampo("cupoActividad", false);
        valido = false;
    } else {
        limpiarError("errorCupoActividad");
        marcarCampo("cupoActividad", true);
    }

    if (responsableActividad.value === "") {
        mostrarError("errorResponsableActividad", "Seleccione un responsable.");
        marcarCampo("responsableActividad", false);
        valido = false;
    } else {
        limpiarError("errorResponsableActividad");
        marcarCampo("responsableActividad", true);
    }

    return valido;
}

function guardarActividad(evento) {
    evento.preventDefault();

    if (!validarActividad()) {
        return;
    }

    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);

    const espacioSeleccionado = espacios.find(function(espacio) {
        return espacio.id === espacioActividad.value;
    });

    const responsableSeleccionado = responsables.find(function(responsable) {
        return responsable.id === responsableActividad.value;
    });

    let lugar = document.getElementById("lugarExterno").value.trim();

    if (tipoLugar.value === "interno") {
        lugar = espacioSeleccionado.nombre + " - " + espacioSeleccionado.sede;
    }

    const actividad = {
        id: crearId(),
        nombre: document.getElementById("nombreActividad").value.trim(),
        categoria: document.getElementById("categoriaActividad").value,
        descripcion: document.getElementById("descripcionActividad").value.trim(),
        fecha: document.getElementById("fechaActividad").value,
        horaInicio: document.getElementById("horaInicio").value,
        horaFin: document.getElementById("horaFin").value,
        tipoLugar: tipoLugar.value,
        espacioId: espacioActividad.value,
        lugar: lugar,
        cupoMaximo: Number(document.getElementById("cupoActividad").value),
        cuposOcupados: 0,
        responsableId: responsableActividad.value,
        responsableNombre: responsableSeleccionado.nombre + " " + responsableSeleccionado.primerApellido,
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

function actualizarEstado(actividad) {
    if (actividad.estado === 'Cancelada') {
        return actividad;
    }

    const fechaHoraFin = new Date(actividad.fecha + 'T' + actividad.horaFin);
    const ahora = new Date();

    if (ahora > fechaHoraFin) {
        actividad.estado = 'Finalizada';
        return actividad;
    }

    if (actividad.cuposOcupados >= actividad.cupoMaximo) {
        actividad.estado = 'Llena';
        return actividad;  
    }

    actividad.estado = 'Disponible';
    return actividad;
}

function cancelarActividad(id) {
    if (!confirm('¿Está seguro de cancelar esta actividad? Todas las inscripciones activas serán canceladas.')) {
        return;
    }

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);

    const indice = actividades.findIndex(function(a) {
        return a.id === id;
    });

    if (indice === -1) return;

    actividades[indice].estado = 'Cancelada';

    guardarDatos(CLAVE_ACTIVIDADES, actividades);
    mostrarActividades();
    alert('Actividad cancelada correctamente.');
}

let idEditando = null;

function abrirEdicionActividad(id) {
    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);

    const actividad = actividades.find(function(a) {
        return a.id === id;
    });

    if (!actividad) return;

    idEditando = id;

    document.getElementById('editId').value             = actividad.id;
    document.getElementById('editNombre').value         = actividad.nombre;
    document.getElementById('editCategoria').value      = actividad.categoria;
    document.getElementById('editDescripcion').value    = actividad.descripcion;
    document.getElementById('editFecha').value          = actividad.fecha;
    document.getElementById('editHoraInicio').value     = actividad.horaInicio;
    document.getElementById('editHoraFin').value        = actividad.horaFin;
    document.getElementById('editCupo').value           = actividad.cupoMaximo;
    
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);
    const selectResponsable = document.getElementById('editResponsable');
    selectResponsable.innerHTML = '<option value="">Seleccione un responsable</option>';

    responsables.forEach(function(responsable) {
        const opcion = document.createElement('option');
        opcion.value = responsable.id;
        opcion.textContent = responsable.nombre + ' ' + responsable.primerApellido + ' ' + responsable.segundoApellido;
        selectResponsable.appendChild(opcion);
    });

    selectResponsable.value = actividad.responsableId;

    document.getElementById('errorEditNombre').textContent          = '';
    document.getElementById('errorEditCategoria').textContent       = '';
    document.getElementById('errorEditDescripcion').textContent     = '';
    document.getElementById('errorEditFecha').textContent           = '';
    document.getElementById('errorEditHoraFin').textContent         = '';
    document.getElementById('errorEditCupo').textContent            = '';
    document.getElementById('errorEditResponsable').textContent     = '';

    document.getElementById('seccionEdicion').style.display = 'block';
    document.getElementById('seccionEdicion').scrollIntoView({ behavior: 'smooth'});
}

function cerrarEdicionActividad() {
    document.getElementById('seccionEdicion').style.display = 'none';
    idEditandot = null;
}

function guardarEdicionActividad(evento) {
    evento.preventDefault();

    document.getElementById('errorEditNombre').textContent          = '';
    document.getElementById('errorEditCategoria').textContent       = '';
    document.getElementById('errorEditDescripcion').textContent     = '';
    document.getElementById('errorEditFecha').textContent           = '';
    document.getElementById('errorEditHoraFin').textContent         = '';
    document.getElementById('errorEditCupo').textContent            = '';
    document.getElementById('errorEditResponsable').textContent     = '';

    const nombre        = document.getElementById('editNombre').value.trim();
    const categoria     = document.getElementById('editCategoria').value;
    const descripcion   = document.getElementById('editDescripcion').value.trim();
    const fecha         = document.getElementById('editFecha').value;
    const horaInicio    = document.getElementById('editHoraInicio').value;
    const horaFin       = document.getElementById('editHoraFin').value;
    const cupo          = Number(document.getElementById('editCupo').value);
    const responsable   = document.getElementById('editResponsable').value;

    let esValido = true;

    if (nombre === '') {
        mostrarError('errorEditNombre', 'El nombre de la actividad es obligatoria.');
        marcarCampo('editNombre', false);
        esValido = false;
    } else {
        marcarCampo('editNombre', true);
    }

    if (categoria === '') {
        mostrarError('errorEditCaetegoria', 'Seleccione una categoria.');
        marcarCampo('editCategoria', false);
        esValido = false;
    } else {
        marcarCampo('editCategoria', true);
    }

    if (descripcion.length < 10) {
        mostrarError('errorEditDescripcion', 'La descripcion debe tener al menos 10 caracteres.');
        marcarCampo('editDescripcion', false);
        esValido = false;
    } else {
        marcarCampo('editDescripcion', true);
    }

    if (fecha === '') {
        mostrarError('errorEditFecha', 'Seleccione una fecha.');
        marcarCampo('editFecha', false);
        esValido = false;
    } else {
        marcarCampo('editFecha', true);
    }

    if (horaInicio === '') {
        mostrarError('errorEditHoraInicio', 'Seleccione la hora de inicio.');
        marcarCampo('editHoraInicio', false);
        esValido = false;
    } else {
        marcarCampo('editHoraInicio', true);
    }

    if (horaFin === '') {
        mostrarError('errorEditHoraFin', 'Seleccione la hora de fin.');
        marcarCampo('editHoraFin', false);
        esValido = false;
    } else {
        marcarCampo('editHoraFin', true);
    }

    const actividades   = obtenerDatos(CLAVE_ACTIVIDADES);
    const indice        = actividades.findIndex(function(a) { return a.id === idEditando; });
    const cuposOcupados = actividades[indice].cuposOcupados;

    if (cupo <= 0) {
        mostrarError('errorEditCupo', 'El cupo debe ser mayor a 0.');
        marcarCampo('editCupo', false);
        esValido = false;
    }
    else if (cupo < cuposOcupados) {
        mostrarError('errorEditCupo',
            'El cupo no puede ser menor a los cupos ya ocupados (' + cuposOcupados + ' inscritos).'
        );
        marcarCampo('editCupo', false);
        esValido = false;
    } else {
        marcarCampo('editCupo', true);
    }

    if (responsable === '') {
        mostrarError('errorEditResponsable', 'Seleccione un responsable.');
        marcarCampo('editResponsable', false);
        esValido = false;
    } else {
        marcarCampo('editResponsable', true);
    }

    if (!esValido) return;

    const responsables = obtenerDatos(CLAVE_RESPONSABLES);
    const responsableSeleccionado = responsables.find(function(r) {
        return r.id === responsable;
    });

    actividades[indice].nombre            = nombre;
    actividades[indice].categoria         = categoria;
    actividades[indice].descripcion       = descripcion;
    actividades[indice].fecha             = fecha;
    actividades[indice].horaInicio        = horaInicio;
    actividades[indice].horaFin           = horaFin;
    actividades[indice].cupoMaximo        = cupo;
    actividades[indice].responsableId     = responsable;
    actividades[indice].responsableNombre = responsableSeleccionado.nombre + ' ' + responsableSeleccionado.primerApellido;

    guardarDatos(CLAVE_ACTIVIDADES, actividades);
    cerrarEdicionActividad();
    mostrarActividades();
    alert('Actividad actualizada correctamente.');
}

function verDetalleActividad(id) {
    window.location.href = 'detalle-actividad.html?id=' + id;
}

function mostrarActividades() {
    const textoBusqueda   = buscarActividad.value.toLowerCase();
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    const filtroEstado    = document.getElementById('filtroEstado').value;
    const filtroFecha     = document.getElementById('filtroFecha').value;
    const filtroLugar     = document.getElementById('filtroLugar').value.toLowerCase();

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);

    const filtradas = actividades.filter(function(actividad) {
        const texto = actividad.nombre            + ' ' +
                      actividad.lugar             + ' ' +
                      actividad.responsableNombre + ' ' +
                      actividad.descripcion;

        if (textoBusqueda && !texto.toLowerCase().includes(textoBusqueda)) {
            return false;
        }
        if (filtroCategoria && actividad.categoria !== filtroCategoria) {
            return false;
        }
        if (filtroEstado && actividad.estado !== filtroEstado) {
            return false;
        }
        if (filtroFecha && actividad.fecha !== filtroFecha) {
            return false;
        }
        if (filtroLugar && !actividad.lugar.toLowerCase().includes(filtroLugar)) {
            return false;
        }
        return true;
    });

    tablaActividades.innerHTML = '';

    if (filtradas.length === 0) {
        tablaActividades.innerHTML = '<tr><td colspan="12" style="text-align:center; color:#888; padding:1rem;">No se encontraron actividades con los criterios seleccionados.</td></tr>';
        return;
    }

    filtradas.forEach(function(actividad) {
        actividad = actualizarEstado(actividad);

        const cuposDisponibles = actividad.cupoMaximo - actividad.cuposOcupados;

        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td><span style="font-family: monospace; font-size: 11px; color: #888;">${actividad.id}</span></td>
            <td>${actividad.nombre}</td>
            <td>${actividad.categoria}</td>
            <td>${actividad.fecha}</td>
            <td>${actividad.horaInicio} - ${actividad.horaFin}</td>
            <td>${actividad.lugar}</td>
            <td>${actividad.cupoMaximo}</td>
            <td>${actividad.cuposOcupados}</td>
            <td>${cuposDisponibles}</td>
            <td>${actividad.responsableNombre}</td>
            <td>${actividad.estado}</td>
            <td>
                ${actividad.estado !== 'Cancelada' && actividad.estado !== 'Finalizada'
                    ? `<button onclick="abrirEdicionActividad('${actividad.id}')">Editar</button>
                       <button onclick="verDetalleActividad('${actividad.id}')">Ver</button>
                       <button onclick="cancelarActividad('${actividad.id}')">Cancelar</button>`
                    : `<button onclick="verDetalleActividad('${actividad.id}')">Ver</button>`
                }
            </td>
        `;

        tablaActividades.appendChild(fila);
    });
}

function limpiarFiltros() {
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroEstado').value    = '';
    document.getElementById('filtroFecha').value     = '';
    document.getElementById('filtroLugar').value     = '';
    buscarActividad.value                            = '';
    mostrarActividades();
}

tipoLugar.addEventListener("change", cambiarTipoLugar);
formActividad.addEventListener("submit", guardarActividad);
buscarActividad.addEventListener("input", mostrarActividades);
document.getElementById('formEdicionActividad').addEventListener('submit', guardarEdicionActividad);

cargarEspacios();
cargarResponsables();
cambiarTipoLugar();
mostrarActividades();