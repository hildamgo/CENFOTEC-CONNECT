const formLugarActividad = document.getElementById("formLugarActividad");
const tipoLugar = document.getElementById("tipoLugar");
const grupoEspacioInterno = document.getElementById("grupoEspacioInterno");
const grupoLugarExterno = document.getElementById("grupoLugarExterno");
const espacioActividad = document.getElementById("espacioActividad");
const resultadoLugar = document.getElementById("resultadoLugar");

function cargarEspaciosDisponibles() {
    const espacios = obtenerDatos(CLAVE_ESPACIOS).filter(function(espacio) {
        return espacio.estado === "Disponible";
    });

    espacioActividad.innerHTML = '<option value="">Seleccione un espacio</option>';

    espacios.forEach(function(espacio) {
        const opcion = document.createElement("option");
        opcion.value = espacio.id;
        opcion.textContent = espacio.nombre + " - " + espacio.sede;
        espacioActividad.appendChild(opcion);
    });
}

function cambiarTipoLugar() {
    if (tipoLugar.value === "interno") {
        grupoEspacioInterno.style.display = "block";
        grupoLugarExterno.style.display = "none";
    } else if (tipoLugar.value === "externo") {
        grupoEspacioInterno.style.display = "none";
        grupoLugarExterno.style.display = "block";
    } else {
        grupoEspacioInterno.style.display = "none";
        grupoLugarExterno.style.display = "none";
    }
}

function guardarLugarActividad(evento) {
    evento.preventDefault();

    const nombreValido = validarTexto("nombreActividad", "errorNombreActividad", "El nombre de la actividad", 3);
    let tipoValido = true;

    if (tipoLugar.value === "") {
        mostrarError("errorTipoLugar", "Seleccione si la actividad es dentro o fuera del campus.");
        marcarCampo("tipoLugar", false);
        tipoValido = false;
    } else {
        limpiarError("errorTipoLugar");
        marcarCampo("tipoLugar", true);
    }

    let lugarValido = true;
    let descripcionLugar = "";
    let espacioId = "";

    if (tipoLugar.value === "interno") {
        espacioId = espacioActividad.value;
        if (espacioId === "") {
            mostrarError("errorEspacioActividad", "Seleccione un espacio registrado.");
            marcarCampo("espacioActividad", false);
            lugarValido = false;
        } else {
            const espacio = obtenerDatos(CLAVE_ESPACIOS).find(function(item) {
                return item.id === espacioId;
            });
            descripcionLugar = espacio.nombre + " - " + espacio.sede;
            limpiarError("errorEspacioActividad");
            marcarCampo("espacioActividad", true);
        }
    }

    if (tipoLugar.value === "externo") {
        lugarValido = validarTexto("lugarExterno", "errorLugarExterno", "El lugar externo", 3);
        descripcionLugar = document.getElementById("lugarExterno").value.trim();
    }

    if (!nombreValido || !tipoValido || !lugarValido) {
        return;
    }

    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    const actividad = {
        id: crearId(),
        nombre: document.getElementById("nombreActividad").value.trim(),
        tipoLugar: tipoLugar.value,
        espacioId: espacioId,
        lugar: descripcionLugar,
        estado: "Disponible",
        fechaRegistro: obtenerFechaActual()
    };

    actividades.push(actividad);
    guardarDatos(CLAVE_ACTIVIDADES, actividades);

    resultadoLugar.textContent = actividad.nombre + " - " + actividad.lugar;
    formLugarActividad.reset();
    cambiarTipoLugar();
    alert("Lugar de actividad guardado correctamente.");
}

cargarEspaciosDisponibles();
cambiarTipoLugar();
tipoLugar.addEventListener("change", cambiarTipoLugar);
formLugarActividad.addEventListener("submit", guardarLugarActividad);