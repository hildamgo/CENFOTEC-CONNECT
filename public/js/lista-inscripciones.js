// ======================================================
// LISTADO DE INSCRIPCIONES
// ======================================================

const API_INSCRIPCIONES =
    "/api/inscripciones";

const tablaInscripciones =
    document.getElementById("tablaInscripciones");


// ======================================================
// CARGAR INSCRIPCIONES
// ======================================================

async function cargarInscripciones() {

    try {

        const respuesta =
            await fetch(API_INSCRIPCIONES);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las inscripciones."
            );

        }

        const inscripciones =
            await respuesta.json();

        mostrarInscripciones(inscripciones);

    } catch (error) {

        console.error(
            "Error al cargar inscripciones:",
            error
        );

        tablaInscripciones.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="text-center text-danger"
                >
                    No se pudieron cargar las inscripciones.
                </td>

            </tr>
        `;
    }
}


// ======================================================
// MOSTRAR INSCRIPCIONES
// ======================================================

function mostrarInscripciones(inscripciones) {

    if (
        !Array.isArray(inscripciones) ||
        inscripciones.length === 0
    ) {

        tablaInscripciones.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted"
                >
                    No hay inscripciones registradas.
                </td>

            </tr>
        `;

        return;
    }


    tablaInscripciones.innerHTML =
        inscripciones
            .map(function (inscripcion) {

                return `
                    <tr>

                        <td>
                            ${escaparHTML(
                                inscripcion._id
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                inscripcion.participanteNombre
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                inscripcion.actividadNombre
                            )}
                        </td>

                        <td>
                            ${mostrarEstado(
                                inscripcion.estado
                            )}
                        </td>

                    </tr>
                `;

            })
            .join("");
}


// ======================================================
// MOSTRAR ESTADO
// ======================================================

function mostrarEstado(estado) {

    const estadoTexto =
        escaparHTML(
            estado || ""
        );


    if (estado === "Activa") {

        return `
            <span class="badge bg-success">
                ${estadoTexto}
            </span>
        `;

    }


    return `
        <span class="badge bg-secondary">
            ${estadoTexto}
        </span>
    `;
}


// ======================================================
// PROTEGER EL HTML
// ======================================================

function escaparHTML(valor) {

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


// ======================================================
// INICIAR
// ======================================================

cargarInscripciones();