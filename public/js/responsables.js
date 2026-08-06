const CLAVE_RESPONSABLES = "cenfotec_responsables";
const CLAVE_ACTIVIDADES  = "cenfotec_actividades";

// helpers (a ver si es eso) puse esto para que no dependa de datos.js ya que datos ocupa iniciar sesion y creo que este no lo ocupa
function crearId() { return Date.now().toString(); }
function obtenerDatos(clave) { return JSON.parse(localStorage.getItem(clave)) || []; }
function guardarDatos(clave, datos) { localStorage.setItem(clave, JSON.stringify(datos)); }
function obtenerFechaActual() { return new Date().toLocaleDateString("es-CR"); }
function mostrarError(id, mensaje) { const el = document.getElementById(id); if (el) el.textContent = mensaje; }
function limpiarError(id) { mostrarError(id, ""); }
function marcarCampo(id, esValido) {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.classList.remove("campo-error", "campo-valido");
    campo.classList.add(esValido ? "campo-valido" : "campo-error");
}
function validarTexto(idCampo, idError, nombreCampo, minimo) {
    const valor = document.getElementById(idCampo).value.trim();
    if (!valor) { mostrarError(idError, nombreCampo + " es obligatorio."); marcarCampo(idCampo, false); return false; }
    if (valor.length < minimo) { mostrarError(idError, nombreCampo + " debe tener al menos " + minimo + " caracteres."); marcarCampo(idCampo, false); return false; }
    limpiarError(idError); marcarCampo(idCampo, true); return true;
}
function validarCorreo(idCampo, idError) {
    const correo = document.getElementById(idCampo).value.trim();
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!expresion.test(correo)) { mostrarError(idError, "Ingrese un correo valido."); marcarCampo(idCampo, false); return false; }
    limpiarError(idError); marcarCampo(idCampo, true); return true;
}
function validarUrl(idCampo, idError) {
    const url = document.getElementById(idCampo).value.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) { mostrarError(idError, "Ingrese una URL valida."); marcarCampo(idCampo, false); return false; }
    limpiarError(idError); marcarCampo(idCampo, true); return true;
}

//codigo sntiguo 
const formResponsable       = document.getElementById("formResponsable");
const tablaResponsable      = document.getElementById("tablaResponsables"); 
const buscarResponsable     = document.getElementById("buscarResponsable");
const btnLimpiarResponsable = document.getElementById("btnLimpiar"); 

function obtenerFormularioResponsable() {
    return {
        id:              document.getElementById("responsableId").value,
        identificacion:  document.getElementById("identificacion").value.trim(),
        correo:          document.getElementById("correo").value.trim().toLowerCase(), 
        nombre:          document.getElementById("nombre").value.trim(),
        primerApellido:  document.getElementById("primerApellido").value.trim(),
        segundoApellido: document.getElementById("segundoApellido").value.trim(),
        telefono:        document.getElementById("telefono").value.trim(),
        especialidad:    document.getElementById("especialidad").value.trim(),
        institucion:     document.getElementById("institucion").value.trim(),
        biografia:       document.getElementById("biografia").value.trim(),
        fotografia:      document.getElementById("fotografia").value.trim()
    };
}
function validarResponsable() {
    const validaciones = [
        validarTexto("identificacion", "errorIdentificacion", "La identificacion", 5),
        validarCorreo("correo", "errorCorreo"),
        validarTexto("nombre", "errorNombre", "El nombre", 2),
        validarTexto("primerApellido", "errorPrimerApellido", "El primer Apellido", 2), 
        validarTexto("segundoApellido", "errorSegundoApellido", "El segundo Apellido", 2),
        validarTexto("telefono", "errorTelefono", "El telefono", 8),
        validarTexto("especialidad", "errorEspecialidad", "La especialidad", 3),
        validarTexto("institucion", "errorInstitucion", "La institucion", 2),
        validarTexto("biografia", "errorBiografia", "La biografia", 2),
        validarUrl("fotografia", "errorFotografia")
    ];
    return validaciones.every(function(valor) { return valor === true; });
}
function existeResponsableDuplicado(responsable, responsables) {
    return responsables.some(function(item) {
        const otroRegistro        = item.id !== responsable.id;
        const mismaIdentificacion = item.identificacion === responsable.identificacion; 
        return otroRegistro && (mismaIdentificacion || mismoCorreo);
    });
}


function guardarResponsable(evento) {
    evento.preventDefault();

    if (!validarResponsable()) return;

    const responsable  = obtenerFormularioResponsable();
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);

    if (existeResponsableDuplicado(responsable, responsables)) {
        alert("La identificacion o el correo ya estan registrados.");
        return;
    }

    if (responsable.id) {
        const posicion = responsables.findIndex(function(item) { return item.id === responsable.id; });
        responsables[posicion] = {
            ...responsables[posicion],
            nombre:          responsable.nombre,
            primerApellido:  responsable.primerApellido,
            segundoApellido: responsable.segundoApellido,
            telefono:        responsable.telefono,
            especialidad:    responsable.especialidad,
            institucion:     responsable.institucion,
            biografia:       responsable.biografia,
            fotografia:      responsable.fotografia
        };
    } else {
        responsable.id            = crearId();
        responsable.fechaRegistro = obtenerFechaActual();
        responsables.push(responsable); 
    }

    guardarDatos(CLAVE_RESPONSABLES, responsables);
    limpiarFormularioResponsable();
    mostrarResponsables();
    alert("Responsable guardado correctamente.");
}
function mostrarResponsables() {
    const textoBusqueda = buscarResponsable.value.toLowerCase();
    const responsables  = obtenerDatos(CLAVE_RESPONSABLES);

    const filtrados = responsables.filter(function(responsable) {
        const texto = responsable.nombre + " " +
            responsable.primerApellido + " " +
            responsable.segundoApellido + " " +
            responsable.identificacion + " " +
            responsable.correo + " " +
            responsable.especialidad;
        return texto.toLowerCase().includes(textoBusqueda);
    });

    tablaResponsable.innerHTML = "";

    filtrados.forEach(function(responsable) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${responsable.nombre} ${responsable.primerApellido} ${responsable.segundoApellido}</td>
            <td>${responsable.identificacion}</td>
            <td>${responsable.correo}</td>
            <td>${responsable.especialidad}</td>
            <td>${responsable.fechaRegistro}</td>
            <td>
                <button class="btn-editar" onclick="editarResponsable('${responsable.id}')">Editar</button>
                <button onclick="eliminarResponsable('${responsable.id}')">Eliminar</button>
            </td>
        `;
        tablaResponsable.appendChild(fila);
    });
}
function editarResponsable(id) {
    const responsables = obtenerDatos(CLAVE_RESPONSABLES);
    const responsable  = responsables.find(function(item) { return item.id === id; });

    document.getElementById("responsableId").value    = responsable.id;
    document.getElementById("identificacion").value   = responsable.identificacion;
    document.getElementById("correo").value           = responsable.correo;
    document.getElementById("nombre").value           = responsable.nombre;
    document.getElementById("primerApellido").value   = responsable.primerApellido;
    document.getElementById("segundoApellido").value  = responsable.segundoApellido;
    document.getElementById("telefono").value         = responsable.telefono;
    document.getElementById("especialidad").value     = responsable.especialidad;
    document.getElementById("institucion").value      = responsable.institucion;
    document.getElementById("biografia").value        = responsable.biografia;
    document.getElementById("fotografia").value       = responsable.fotografia;

    document.getElementById("identificacion").disabled = true;
    document.getElementById("correo").disabled         = true;
    window.scrollTo({ top: 0, behavior: "smooth" }); 
}


function eliminarResponsable(id) {
    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    const actividadAsociada = actividades.find(function(actividad) {
        return actividad.responsableId === id && actividad.estado !== "Cancelada";
    });
    if (actividadAsociada) {
        alert("No se puede eliminar. El responsable esta asociado a la actividad: " + actividadAsociada.nombre);
        return;
    }
    if (!confirm("¿Eliminar este responsable?")) return;
    guardarDatos(CLAVE_RESPONSABLES, obtenerDatos(CLAVE_RESPONSABLES).filter(function(item) { return item.id !== id; }));
    mostrarResponsables();
}
function limpiarFormularioResponsable() {
    formResponsable.reset();
    document.getElementById("responsableId").value     = "";
    document.getElementById("identificacion").disabled = false;
    document.getElementById("correo").disabled         = false;

    formResponsable.querySelectorAll("input, textarea").forEach(function(campo) {
        campo.classList.remove("campo-valido", "campo-error"); 
    });
    formResponsable.querySelectorAll(".mensaje-error").forEach(function(error) {
        error.textContent = "";
    });
}
formResponsable.addEventListener("submit", guardarResponsable);
buscarResponsable.addEventListener("input", mostrarResponsables);
btnLimpiarResponsable.addEventListener("click", limpiarFormularioResponsable);
mostrarResponsables();