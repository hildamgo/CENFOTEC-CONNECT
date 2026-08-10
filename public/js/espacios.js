// ======================================================
// ESPACIOS
// ======================================================
// Este archivo controla únicamente el formulario
// de registro de espacios.
//
// El listado se encuentra en:
// lista-espacios.html
//
// No se utilizan:
// - localStorage
// - búsqueda
// - edición
// - eliminación
// ======================================================
const API_ESPACIOS =
    "/api/espacios";

const formEspacio = document.getElementById("formEspacio");
const btnLimpiarEspacio = document.getElementById("btnLimpiarEspacio");

// ======================================================
// REGISTRAR ESPACIO
// ======================================================
formEspacio.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        limpiarErrores();
        const espacio = obtenerDatosFormulario();

        if (!validarEspacio(espacio)
        ) {
            return;
        }
        try {
            const respuesta = await fetch(API_ESPACIOS,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(espacio)
                    }
                );
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.mensaje ||
                    "No se pudo registrar el espacio."
                );
            }
            alert(
                "Espacio registrado correctamente."
            );
            formEspacio.reset();
        } catch (error) {
            console.error("Error al registrar espacio:",
                error
            );
            alert(
                error.message ||
                "Ocurrió un error al registrar el espacio."
            );
        }
    }
);

// ======================================================
// OBTENER DATOS
// ======================================================
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById("nombreEspacio").value.trim(),
        sede: document.getElementById("sedeEspacio").value.trim(),
        estado: document.getElementById("estadoEspacio").value
    };
}

// ======================================================
// VALIDAR ESPACIO
// ======================================================
function validarEspacio(espacio) {
    let valido = true;
    // NOMBRE
    if (!espacio.nombre) {
        mostrarError(
            "errorNombreEspacio",
            "Ingrese el nombre del espacio."
        );
        valido = false;
    }
    else if (espacio.nombre.length < 2) {
        mostrarError(
            "errorNombreEspacio",
            "El nombre debe tener al menos 2 caracteres."
        );
        valido = false;
    }
    // SEDE
    if (!espacio.sede) {
        mostrarError(
            "errorSedeEspacio",
            "Ingrese la sede."
        );
        valido = false;
    }
    else if (espacio.sede.length < 2) {
        mostrarError(
            "errorSedeEspacio",
            "La sede debe tener al menos 2 caracteres."
        );
        valido = false;
    }
    // ESTADO
    if (!espacio.estado) {
        mostrarError(
            "errorEstadoEspacio",
            "Seleccione el estado del espacio."
        );
        valido = false;
    }
    return valido;
}

// ======================================================
// MOSTRAR ERROR
// ======================================================
function mostrarError(id, mensaje) {
    const elemento =
        document.getElementById(
            id
        );
    if (elemento) {
        elemento.textContent =
            mensaje;
    }
}

// ======================================================
// LIMPIAR ERRORES
// ======================================================
function limpiarErrores() {
    const errores = document.querySelectorAll(".mensaje-error");
    errores.forEach(function (elemento) {
            elemento.textContent = "";
        }
    );
}

// ======================================================
// LIMPIAR FORMULARIO
// ======================================================
btnLimpiarEspacio.addEventListener("click", function () {
        formEspacio.reset();
        limpiarErrores();
    }
);