// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_ESPACIOS = "/api/espacios";

const formEspacio = document.getElementById("formEspacio");

// ======================================================
// REGISTRAR ESPACIO
// ======================================================
formEspacio.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    limpiarErroresEspacio();

    if (!validarEspacio()) return;

    const espacio = obtenerDatosFormulario();
    const botonGuardar = formEspacio.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_ESPACIOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(espacio)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || "No se pudo registrar el espacio.");
        }

        alert("Espacio registrado correctamente.");
        formEspacio.reset();

    } catch (error) {
        console.error("Error al registrar espacio:", error);
        alert(error.message || "Ocurrió un error al registrar el espacio.");
    } finally {
        botonGuardar.disabled = false;
    }
});

// ======================================================
// DATOS DEL FORMULARIO
// ======================================================
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById("nombreEspacio").value.trim(),
        sede: document.getElementById("sedeEspacio").value.trim(),
        estado: document.getElementById("estadoEspacio").value
    };
}

function validarEspacio() {
    const nombreValido = validarTexto("nombreEspacio", "errorNombreEspacio", "El nombre del espacio", 2);
    const sedeValida = validarTexto("sedeEspacio", "errorSedeEspacio", "La sede", 2);

    let estadoValido = true;
    if (document.getElementById("estadoEspacio").value === "") {
        mostrarError("errorEstadoEspacio", "Seleccione un estado.");
        estadoValido = false;
    } else {
        limpiarError("errorEstadoEspacio");
    }

    return nombreValido && sedeValida && estadoValido;
}

function limpiarErroresEspacio() {
    limpiarError("errorNombreEspacio");
    limpiarError("errorSedeEspacio");
    limpiarError("errorEstadoEspacio");
}