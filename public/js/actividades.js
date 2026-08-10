// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_ACTIVIDADES = 
    "/api/actividades";
const formActividad =
    document.getElementById("formActividad");
const btnLimpiar =
    document.getElementById("btnLimpiar");
/* ==========================================
   REGISTRAR ACTIVIDAD
========================================== */
formActividad.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();
        limpiarErrores();
        const actividad =
            obtenerDatosFormulario();
        if (!validarActividad(actividad)) {
            return;
        }
        try {
            const respuesta =
                await fetch(
                    API_ACTIVIDADES,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(
                                actividad
                            )
                    }
                );
            const datos =
                await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(
                    datos.mensaje ||
                    "No se pudo registrar la actividad."
                );
            }
            alert(
                "Actividad registrada correctamente."
            );
            formActividad.reset();
            ocultarCamposLugar();
        } catch (error) {
            console.error(
                "Error al registrar actividad:",
                error
            );
            alert(
                error.message ||
                "Ocurrió un error al registrar la actividad."
            );
        }
    }
);
/* ==========================================
   OBTENER DATOS DEL FORMULARIO
========================================== */
function obtenerDatosFormulario() {
    const tipoLugar =
        document.getElementById(
            "tipoLugar"
        ).value;
    let lugar = "";
    if (tipoLugar === "interno") {
        lugar =
            document.getElementById(
                "espacioActividad"
            ).value;
    }
    if (tipoLugar === "externo") {
        lugar =
            document.getElementById(
                "lugarExterno"
            ).value.trim();
    }
    const entradaLibre =
        document.getElementById(
            "entradaLibre"
        ).checked;
    const cupoTexto =
        document.getElementById(
            "cupoActividad"
        ).value;
    return {
        nombre:
            document.getElementById(
                "nombreActividad"
            ).value.trim(),
        categoria:
            document.getElementById(
                "categoriaActividad"
            ).value,
        descripcion:
            document.getElementById(
                "descripcionActividad"
            ).value.trim(),
        fecha:
            document.getElementById(
                "fechaActividad"
            ).value,
        horaInicio:
            document.getElementById(
                "horaInicio"
            ).value,
        horaFin:
            document.getElementById(
                "horaFin"
            ).value,
        lugar:
            lugar,
        cupoMaximo:
            entradaLibre
                ? null
                : Number(cupoTexto),
        entradaLibre:
            entradaLibre,
        cuposOcupados:
            0,
        responsableId:
            document.getElementById(
                "responsableActividad"
            ).value,
        responsableNombre:
            document.getElementById(
                "responsableActividad"
            )
            .selectedOptions[0]
            ?.text || "",
        estado:
            "Disponible"
    };
}
/* ==========================================
   VALIDACIÓN
========================================== */
function validarActividad(
    actividad
) {
    let valido = true;

    if (!validarTexto("nombreActividad", "errorNombreActividad", "El nombre", 3)) valido = false;
    if (!validarTexto("descripcionActividad", "errorDescripcionActividad", "La descripcion", 10)) valido = false;

    if (document.getElementById("categoriaActividad").value === "") {
        mostrarError("errorCategoriaActividad", "Seleccione una categoria.");
        valido = false;
    } else limpiarError("errorCategoriaActividad");

    if (document.getElementById("fechaActividad").value === "") {
        mostrarError("errorFechaActividad", "Seleccione una fecha.");
        valido = false;
    } else limpiarError("errorFechaActividad");

    if (document.getElementById("horaInicio").value === "") {
        mostrarError("errorHoraInicio", "Seleccione la hora de inicio.");
        valido = false;
    } else limpiarError("errorHoraInicio");

    if (document.getElementById("horaFin").value === "") {
        mostrarError("errorHoraFin", "Seleccione la hora de fin.");
        valido = false;
    } else limpiarError("errorHoraFin");

    if (tipoLugar.value === "") {
        mostrarError("errorTipoLugar", "Seleccione el tipo de lugar.");
        valido = false;
    } else limpiarError("errorTipoLugar");

    if (tipoLugar.value === "interno" && espacioActividad.value === "") {
        mostrarError("errorEspacioActividad", "Seleccione un espacio.");
        valido = false;
    }

    if (tipoLugar.value === "externo" && !validarTexto("lugarExterno", "errorLugarExterno", "El lugar externo", 3)) {
        valido = false;
    }
    if (!actividad.lugar) {
        if (
            actividad.tipoLugar === "interno"
        ) {
            mostrarError(
                "errorEspacioActividad",
                "Seleccione un espacio."
            );
        } else {
            mostrarError(
                "errorLugarExterno",
                "Ingrese el lugar externo."
            );
        }
        valido = false;
    }
    if (
        !actividad.entradaLibre &&
        (
            !actividad.cupoMaximo || actividad.cupoMaximo < 1
        )
    ) {
        mostrarError(
            "errorCupoActividad",
            "Ingrese un cupo máximo válido."
        );
        valido = false;
    } else limpiarError("errorResponsableActividad");

    return valido;
}
/* ==========================================
   MOSTRAR ERROR
========================================== */
function mostrarError(
    id,
    mensaje
) {
    const elemento =
        document.getElementById(id);
    if (elemento) {
        elemento.textContent =
            mensaje;
    }
}
/* ==========================================
   LIMPIAR ERRORES
========================================== */
function limpiarErrores() {
    const errores =
        document.querySelectorAll(
            ".mensaje-error"
        );
    errores.forEach(
        function (elemento) {
            elemento.textContent = "";
        }
    );
}
/* ==========================================
   LIMPIAR FORMULARIO
========================================== */
if (btnLimpiar) {
    btnLimpiar.addEventListener(
        "click",
        function () {
            formActividad.reset();
            limpiarErrores();
            ocultarCamposLugar();
        }
    );
}
/* ==========================================
   MOSTRAR / OCULTAR LUGAR
========================================== */
const tipoLugar =
    document.getElementById(
        "tipoLugar"
    );
const grupoEspacioInterno =
    document.getElementById(
        "grupoEspacioInterno"
    );
const grupoLugarExterno =
    document.getElementById(
        "grupoLugarExterno"
    );
tipoLugar.addEventListener(
    "change",
    function () {
        ocultarCamposLugar();
        if (
            this.value ===
            "interno"
        ) {
            grupoEspacioInterno.style.display =
                "block";
        }
        if (
            this.value ===
            "externo"
        ) {
            grupoLugarExterno.style.display =
                "block";
        }
    }
);
function ocultarCamposLugar() {
    grupoEspacioInterno.style.display =
        "none";
    grupoLugarExterno.style.display =
        "none";
}
/* ==========================================
   ENTRADA LIBRE
========================================== */
const entradaLibre =
    document.getElementById(
        "entradaLibre"
    );
const cupoActividad =
    document.getElementById(
        "cupoActividad"
    );
entradaLibre.addEventListener(
    "change",
    function () {
        if (this.checked) {
            cupoActividad.value = "";
            cupoActividad.disabled =
                true;
        } else {
            cupoActividad.disabled =
                false;
        }
    }
);