const formEspacio = document.getElementById("formEspacio");
const tablaEspacios = document.getElementById("tablaEspacios");
const buscarEspacio = document.getElementById("buscarEspacio");
const btnLimpiarEspacio = document.getElementById("btnLimpiarEspacio");

function obtenerFormularioEspacio() {
    return {
        id: document.getElementById("espacioId").value,
        nombre: document.getElementById("nombreEspacio").value.trim(),
        sede: document.getElementById("sedeEspacio").value.trim(),
        estado: document.getElementById("estadoEspacio").value
    };
}

function validarEspacio() {
    const nombreValido = validarTexto("nombreEspacio", "errorNombreEspacio", "El nombre del espacio", 2);
    const sedeValida = validarTexto("sedeEspacio", "errorSedeEspacio", "La sede", 2);
    return nombreValido && sedeValida;
}

function existeEspacioDuplicado(espacio, espacios) {
    return espacios.some(function(item) {
        const mismoNombre = item.nombre.toLowerCase() === espacio.nombre.toLowerCase();
        const mismaSede = item.sede.toLowerCase() === espacio.sede.toLowerCase();
        const otroRegistro = item.id !== espacio.id;
        return mismoNombre && mismaSede && otroRegistro;
    });
}

function guardarEspacio(evento) {
    evento.preventDefault();

    if (!validarEspacio()) {
        return;
    }

    const espacio = obtenerFormularioEspacio();
    const espacios = obtenerDatos(CLAVE_ESPACIOS);

    if (existeEspacioDuplicado(espacio, espacios)) {
        mostrarError("errorNombreEspacio", "Ya existe un espacio con ese nombre en la misma sede.");
        marcarCampo("nombreEspacio", false);
        return;
    }

    if (espacio.id) {
        const posicion = espacios.findIndex(function(item) {
            return item.id === espacio.id;
        });
        espacios[posicion] = {
            ...espacios[posicion],
            nombre: espacio.nombre,
            sede: espacio.sede,
            estado: espacio.estado
        };
    } else {
        espacio.id = crearId();
        espacio.fechaRegistro = obtenerFechaActual();
        espacios.push(espacio);
    }

    guardarDatos(CLAVE_ESPACIOS, espacios);
    limpiarFormularioEspacio();
    mostrarEspacios();
    alert("Espacio guardado correctamente.");
}

function mostrarEspacios() {
    const textoBusqueda = buscarEspacio.value.toLowerCase();
    const espacios = obtenerDatos(CLAVE_ESPACIOS);

    const filtrados = espacios.filter(function(espacio) {
        return espacio.nombre.toLowerCase().includes(textoBusqueda) ||
               espacio.sede.toLowerCase().includes(textoBusqueda);
    });

    tablaEspacios.innerHTML = "";

    filtrados.forEach(function(espacio) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${espacio.nombre}</td>
            <td>${espacio.sede}</td>
            <td>${espacio.estado}</td>
            <td>${espacio.fechaRegistro}</td>
            <td>
                <button class="boton secundario" onclick="editarEspacio('${espacio.id}')">Editar</button>
                <button class="boton peligro" onclick="eliminarEspacio('${espacio.id}')">Eliminar</button>
            </td>
        `;
        tablaEspacios.appendChild(fila);
    });
}

function editarEspacio(id) {
    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    const espacio = espacios.find(function(item) {
        return item.id === id;
    });

    document.getElementById("espacioId").value = espacio.id;
    document.getElementById("nombreEspacio").value = espacio.nombre;
    document.getElementById("sedeEspacio").value = espacio.sede;
    document.getElementById("estadoEspacio").value = espacio.estado;

    // Scroll automatico al formulario
    document.getElementById("formEspacio").scrollIntoView({ behaviour: "smooth"});
}

function eliminarEspacio(id) {
    const espacios = obtenerDatos(CLAVE_ESPACIOS);
    const nuevosEspacios = espacios.filter(function(item) {
        return item.id !== id;
    });

    guardarDatos(CLAVE_ESPACIOS, nuevosEspacios);
    mostrarEspacios();
}

function limpiarFormularioEspacio() {
    formEspacio.reset();
    document.getElementById("espacioId").value = "";
    limpiarError("errorNombreEspacio");
    limpiarError("errorSedeEspacio");
    document.getElementById("nombreEspacio").classList.remove("campo-error", "campo-valido");
    document.getElementById("sedeEspacio").classList.remove("campo-error", "campo-valido");
}

formEspacio.addEventListener("submit", guardarEspacio);
buscarEspacio.addEventListener("input", mostrarEspacios);
btnLimpiarEspacio.addEventListener("click", limpiarFormularioEspacio);
mostrarEspacios();
