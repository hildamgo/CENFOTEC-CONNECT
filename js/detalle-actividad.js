function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
function cargarDetalle() {
    const id = obtenerIdDesdeURL();

    if (!id) {
        alert('No se especificó una actividad.');
        window.location.href = 'actividades.html';
        return;
    }

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);

    const actividad = actividades.find(function(a) {
        return a.id === id;
    });

    if (!actividad) {
        alert('Actividad no encontrada.');
        window.location.href = 'actividades.html';
        return;
    }

    const cuposDisponibles = actividad.cupoMaximo - actividad.cuposOcupados;
    document.getElementById('detalle-nombre').textContent        = actividad.nombre;
    document.getElementById('detalle-id').value                  = actividad.id;
    document.getElementById('detalle-estado').value              = actividad.estado;
    document.getElementById('detalle-categoria').value           = actividad.categoria;
    document.getElementById('detalle-responsable').value         = actividad.responsableNombre;
    document.getElementById('detalle-descripcion').value         = actividad.descripcion;
    document.getElementById('detalle-fecha').value               = actividad.fecha;
    document.getElementById('detalle-horario').value             = actividad.horaInicio + ' - ' + actividad.horaFin;
    document.getElementById('detalle-lugar').value               = actividad.lugar;
    document.getElementById('detalle-cupo-maximo').value         = actividad.cupoMaximo;
    document.getElementById('detalle-cupo-disponible').value     = cuposDisponibles;

    cargarParticipantes(id);
}

function cargarParticipantes(actividadId) {
    const inscripciones  = obtenerDatos(CLAVE_INSCRIPCIONES);
    const participantes  = obtenerDatos(CLAVE_PARTICIPANTES);

    const inscritosEnActividad = inscripciones.filter(function(inscripcion) {
        return inscripcion.actividadId === actividadId;
    });

    const sinParticipantes = document.getElementById('detalle-sin-participantes');
    const tabla            = document.getElementById('detalle-tabla-participantes');
    const tbody            = document.getElementById('detalle-tbody-participantes');

if (inscritosEnActividad.length === 0) {
        sinParticipantes.style.display = 'block';
        tabla.style.display            = 'none';
        return;
    }

    sinParticipantes.style.display = 'none';
    tabla.style.display            = 'table';
    tbody.innerHTML                = '';

    inscritosEnActividad.forEach(function(inscripcion) {
    const participante = participantes.find(function(p) {
            return p.id === inscripcion.participanteId;
        });

        if (!participante) return;

        const fila = document.createElement('tr');
        fila.innerHTML =
            '<td>' + participante.nombre + ' ' + participante.primerApellido + '</td>' +
            '<td>' + participante.correo + '</td>' +
            '<td>' + inscripcion.estado + '</td>';

        tbody.appendChild(fila);
    });
}

cargarDetalle();