// ======================================================
// LISTADO DE PARTICIPANTES
// ======================================================

const API_PARTICIPANTES = "/api/participantes";

const tablaParticipantes =
    document.getElementById("tablaParticipantes");


// ======================================================
// CARGAR PARTICIPANTES
// ======================================================

async function cargarParticipantes() {

    try {

        const respuesta =
            await fetch(API_PARTICIPANTES);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los participantes."
            );

        }

        const participantes =
            await respuesta.json();

        mostrarParticipantes(participantes);

    } catch (error) {

        console.error(
            "Error al cargar participantes:",
            error
        );

        tablaParticipantes.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="text-center text-danger"
                >
                    No se pudieron cargar los participantes.
                </td>

            </tr>
        `;
    }
}


// ======================================================
// MOSTRAR PARTICIPANTES
// ======================================================

function mostrarParticipantes(participantes) {

    if (
        !Array.isArray(participantes) ||
        participantes.length === 0
    ) {

        tablaParticipantes.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="text-center text-muted"
                >
                    No hay participantes registrados.
                </td>

            </tr>
        `;

        return;
    }


    tablaParticipantes.innerHTML =
        participantes
            .map(function (participante) {

                return `
                    <tr>

                        <td>
                            ${escaparHTML(
                                participante.nombre
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                participante.identificacion
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                participante.correo
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                participante.telefono
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                participante.edad
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                participante.profesion
                            )}
                        </td>

                    </tr>
                `;

            })
            .join("");
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

cargarParticipantes();