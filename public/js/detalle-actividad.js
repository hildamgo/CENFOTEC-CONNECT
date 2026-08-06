// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_ACTIVIDADES   = "/api/actividades";
const API_INSCRIPCIONES = "/api/inscripciones";

function obtenerIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function cargarDetalle() {
    const id = obtenerIdDesdeURL();

    if (!id) {
        alert("No se especificó una actividad.");
        window.location.href = "actividades.html";
        return;
    }

    try {
        const respuesta = await fetch(API_ACTIVIDADES + "/" + id);

        if (!respuesta.ok) {
            alert("Actividad no encontrada.");
            window.location.href = "actividades.html";
            return;
        }

        const actividad = await respuesta.json();

        const cupoMax     = actividad.entradaLibre ? "Libre" : actividad.cupoMaximo;
        const cupoDisp     = actividad.entradaLibre ? "Libre" : (actividad.cupoMaximo - actividad.cuposOcupados);

        document.getElementById("detalle-nombre").textContent    = actividad.nombre;
        document.getElementById("detalle-id").value               = actividad._id;
        document.getElementById("detalle-estado").value           = actividad.estado;
        document.getElementById("detalle-categoria").value        = actividad.categoria;
        document.getElementById("detalle-responsable").value      = actividad.responsableNombre;
        document.getElementById("detalle-descripcion").value      = actividad.descripcion;
        document.getElementById("detalle-fecha").value            = actividad.fecha;
        document.getElementById("detalle-horario").value          = actividad.horaInicio + " - " + actividad.horaFin;
        document.getElementById("detalle-lugar").value            = actividad.lugar;
        document.getElementById("detalle-cupo-maximo").value      = cupoMax;
        document.getElementById("detalle-cupo-disponible").value  = cupoDisp;

        await cargarParticipantes(id);

    } catch (error) {
        console.error("Error al cargar el detalle de la actividad:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

async function cargarParticipantes(actividadId) {
    const sinParticipantes = document.getElementById("detalle-sin-participantes");
    const tabla            = document.getElementById("detalle-tabla-participantes");
    const tbody            = document.getElementById("detalle-tbody-participantes");

    try {
        const respuesta = await fetch(API_INSCRIPCIONES + "?actividadId=" + encodeURIComponent(actividadId));
        const inscripciones = await respuesta.json();

        const inscritasActivas = inscripciones.filter(i => i.estado === "Activa");

        if (!inscritasActivas.length) {
            sinParticipantes.style.display = "block";
            tabla.style.display = "none";
            return;
        }

        sinParticipantes.style.display = "none";
        tabla.style.display = "table";

        tbody.innerHTML = inscritasActivas.map(function (i) {
            return `<tr>
                <td>${i.participanteNombre}</td>
                <td>${i.participanteIdentificacion}</td>
                <td>${i.estado}</td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al cargar los participantes inscritos:", error);
        sinParticipantes.textContent = "No se pudo cargar la lista de participantes.";
        sinParticipantes.style.display = "block";
        tabla.style.display = "none";
    }
}

cargarDetalle();