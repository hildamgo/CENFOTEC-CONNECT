// ======================================================
// LISTADO DE RESPONSABLES
// ======================================================

const API_RESPONSABLES = "/api/responsables";

const tablaResponsables =
    document.getElementById("tablaResponsables");


// ======================================================
// CARGAR RESPONSABLES DESDE MONGODB
// ======================================================

async function cargarResponsables() {

    try {

        const respuesta =
            await fetch(API_RESPONSABLES);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los responsables."
            );

        }

        const responsables =
            await respuesta.json();

        mostrarResponsables(responsables);

    } catch (error) {

        console.error(
            "Error al cargar responsables:",
            error
        );

        tablaResponsables.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="text-center text-danger"
                >
                    No se pudieron cargar los responsables.
                </td>

            </tr>
        `;
    }
}


// ======================================================
// MOSTRAR RESPONSABLES
// ======================================================

function mostrarResponsables(responsables) {

    if (
        !Array.isArray(responsables) ||
        responsables.length === 0
    ) {

        tablaResponsables.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="text-center text-muted"
                >
                    No hay responsables registrados.
                </td>

            </tr>
        `;

        return;
    }


    tablaResponsables.innerHTML =
        responsables
            .map(function (responsable) {

                return `
                    <tr>

                        <td>
                            ${escaparHTML(
                                responsable.identificacion
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                responsable.nombre
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                responsable.primerApellido
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                responsable.segundoApellido
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                responsable.telefono
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                responsable.especialidad
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

cargarResponsables();