// ======================================================
// LISTADO DE ACTIVIDADES (página aparte)
// Consulta la API y pinta la tabla que armó Hilda en
// lista-actividades.html (tbody id="tablaActividades").
// ======================================================
const API_ACTIVIDADES = "/api/actividades";
const tablaActividades = document.getElementById("tablaActividades");

async function mostrarActividades() {
    try {
        const respuesta = await fetch(API_ACTIVIDADES);
        if (!respuesta.ok) throw new Error("Respuesta no válida del servidor");

        const actividades = await respuesta.json();

        if (!actividades.length) {
            tablaActividades.innerHTML = '<tr><td colspan="8" class="text-center">No hay actividades registradas todavía.</td></tr>';
            return;
        }

        tablaActividades.innerHTML = actividades.map(function (a) {
            const cupoMax = a.entradaLibre ? "Libre" : `${a.cuposOcupados}/${a.cupoMaximo}`;
            return `<tr>
                <td><a href="detalle-actividad.html?id=${a._id}">${a.nombre}</a></td>
                <td>${a.categoria}</td>
                <td>${a.fecha}</td>
                <td>${a.horaInicio} - ${a.horaFin}</td>
                <td>${a.lugar}</td>
                <td>${cupoMax}</td>
                <td>${a.responsableNombre}</td>
                <td>${a.estado}</td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al consultar actividades:", error);
        tablaActividades.innerHTML = '<tr><td colspan="8" class="text-center text-danger">No se pudo conectar con el servidor.</td></tr>';
    }
}

mostrarActividades();