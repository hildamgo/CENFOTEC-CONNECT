// ======================================================
// LISTADO DE ESPACIOS
// ======================================================
const API_ESPACIOS = "/api/espacios";
const tablaEspacios = document.getElementById("tablaEspacios");

// ======================================================
// CARGAR ESPACIOS
// ======================================================
async function cargarEspacios() {
    try {
        const respuesta = await fetch(API_ESPACIOS);
        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron obtener los espacios."
            );
        }
        const espacios = await respuesta.json();
        mostrarEspacios(espacios);
    } catch (error) {
        console.error(
            "Error al cargar espacios:",
            error
        );
        tablaEspacios.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="text-center text-danger"
                >
                    No se pudieron cargar los espacios.
                </td>
            </tr>
        `;
    }
}

// ======================================================
// MOSTRAR ESPACIOS
// ======================================================
function mostrarEspacios( espacios) {
    if ( !Array.isArray(espacios) || espacios.length === 0) {
        tablaEspacios.innerHTML = `
            <tr>
                <td
                    colspan="3"
                    class="text-center text-muted"
                >
                    No hay espacios registrados.
                </td>
            </tr>
        `;
        return;
    }
    tablaEspacios.innerHTML =
        espacios.map(function (espacio) {
                return `
                    <tr>
                        <td>
                            ${escaparHTML(espacio.nombre)}
                        </td>
                        <td>
                            ${escaparHTML(espacio.sede)}
                        </td>
                        <td>
                            ${mostrarEstado(espacio.estado)}
                        </td>
                    </tr>
                `;
            }
        ).join("");
}

// ======================================================
// MOSTRAR ESTADO
// ======================================================
function mostrarEstado(estado) {
    const estadoTexto = escaparHTML(estado || "");
    return `
        <span class="badge bg-success">
            ${estadoTexto}
        </span>
    `;
}

// ======================================================
// PROTEGER HTML
// ======================================================
function escaparHTML(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }
    return String(valor).replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}
cargarEspacios();