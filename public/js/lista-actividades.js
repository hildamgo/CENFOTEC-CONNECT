const API_ACTIVIDADES = "/api/actividades";
const tablaActividades =
    document.getElementById("tablaActividades");

async function cargarActividades() {
    try {
        const respuesta = await fetch(API_ACTIVIDADES);
        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron obtener las actividades."
            );
        }
        const actividades = await respuesta.json();
        mostrarActividades(
            actividades
        );
    } catch (error) {
        console.error(
            "Error al cargar actividades:",
            error
        );
        tablaActividades.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    No se pudieron cargar las actividades.
                </td>
            </tr>
        `;
    }
}
function mostrarActividades(
    actividades
) {
    if (
        !Array.isArray(actividades) || actividades.length === 0
    ) {
        tablaActividades.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    No hay actividades registradas.
                </td>
            </tr>
        `;
        return;
    }
    tablaActividades.innerHTML =
        actividades.map(
            function (actividad) {
                const cupo =
                    actividad.entradaLibre
                        ? "Entrada libre"
                        : `${actividad.cuposOcupados || 0} / ${actividad.cupoMaximo}`;
                return `
                    <tr>
                        <td>
                            ${escaparHTML(
                                actividad.nombre
                            )}
                        </td>
                        <td>
                            ${escaparHTML(
                                actividad.categoria
                            )}
                        </td>
                        <td>
                            ${formatearFecha(
                                actividad.fecha
                            )}
                        </td>
                        <td>
                            ${escaparHTML(
                                actividad.horaInicio
                            )}
                            -
                            ${escaparHTML(
                                actividad.horaFin
                            )}
                        </td>
                        <td>
                            ${escaparHTML(
                                actividad.lugar
                            )}
                        </td>
                        <td>
                            ${cupo}
                        </td>
                        <td>
                            ${escaparHTML(
                                actividad.responsableNombre
                            )}
                        </td>
                        <td>
                            <span class="badge bg-success">
                                ${escaparHTML(
                                    actividad.estado || "Disponible"
                                )}
                            </span>
                        </td>
                    </tr>
                `;
            }
        ).join("");
}
function formatearFecha(
    fecha
) {
    if (!fecha) {
        return "";
    }
    const partes = fecha.split("-");
    if (partes.length !== 3) {
        return fecha;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
function escaparHTML(
    valor
) {
    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
cargarActividades();