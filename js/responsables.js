const formResponsable = document.getElementById("formResponsable");
const tablaResponsable = document.getElementById(tablaResponsable);
const buscarResponsable = document.getElementById(buscarResponsable);
const btnLimpiarResponsable = document.getElementById(btnLimpiarResponsable);

function obtenerFormularioResponsable(){
    return {
        id: document.getElementById("resposableId").value,
        identificacion: document.getElementById("identificacion").value.trim(),
        correo: document.getElementById("correo").value.trim.toLowerCase(),
        nombre: document.getElementById("nombre").value.trim(),
        primerApellido: document.getElementById("primerApellido").value.trim(),
        segundoApellido: document.getElementById("segundoApellido").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        especialidad: document.getElementById("especialidad").value.trim(),
        institucion: document.getElementById("institucion").value.trim(),
        biografia: document.getElementById("biografia").value.trim(),
        fotografia: document.getElementById("fotografia").value.trim()
    };
}
function validarResponsable() {
    const validaciones = {
        validarTexto("identificacion","errorIdentificacion","La identificacion", 5),
        validarCorreo("correo", "errorCorreo"),
        validarTexto("nombre", "errorNombre", "El nombre", 2),
        validarTexto("primerApellido", "errorApellido", "El primer Apellido", 2),
        validarTexto("segundoApellido", "errorSegundoApellido", "El segundo Apellido", 2),
        validarTexto("telefono", "errorTelefono", "El telefono", 8),
        validarTexto("especialidad", "errorEspecialidad", "La especialidad", 3),
        validarTexto("institucion", "errorInstitucion", "La institucion", 2),
        validarTexto("biografia", "errorBiografia", "La biografia", 2),
        validarUrl("fotografia", "errorFotografia")
    };
    return validaciones.every(function(valor){
        return valor === true;
    });
}
function existeResponsableDuplicado(responsable, responsables){
    return responsables.some(function(item){
        const otroRegistro = item.id !== responsable.id;
        const mismaIdentificacion = item.id === responsable.identificacion;
        const mismoCorreo = item.correo === responsable.correo;
        return otroRegistro && (mismaIdentificacion || mismoCorreo);
    });
}
function guardarResponsable(evento){
    evento.preventDefault();
    
    if(!validarResponsable()){
        const responsable = obtenerFormularioResponsable();
        const responsables = obtenerDatos(CLAVE_RESPONSABLES);

        if(existeResponsableDuplicado(responsable, responsables)){
            alert("La identificacion o el correo ya estan registrados.");
            return;
        }
        if (responsable.id){
            const posicion = responsables.findIndex(function(item){
                return item.id === responsable.id;
            });

            responsables[posicion] = {
                ...responsables[posicion],
                nombre: responsable.nombre,
                primerApellido: responsable.primerApellido,
                segundoApellido: responsable.segundoApellido,
                telefono: responsable.telefono,
                especialidad: responsable.especialidad,
                institucion: responsable.institucion,
                biografia: responsable.biografia,
                fotografia: responsable.fotografia
            };
        }
        else {
            responsable.id = crearId();
            responsable.fechaRegistro = obtenerFechaActual();
            responsable.push(responsable);
        }
        guardarDatos(CLAVE_RESPONSABLES, responsables);
        limpiarFormularioResponsable();
        mostrarResponsables();
        alert("Responsable guardado correctamente.");
    }
    function mostrarResponsables(){
        const textoBusqueda = buscarResponsable.value.toLowerCase();
        const responsables = obtenerDatos(CLAVE_RESPONSABLES);

        const filtrados = responsables.filter(function(responsable){
            const texto = responsable.nombre + " " +
            responsable.primerApellido + " " +
            responsable.segundoApellido + " " +
            responsable.identificacion + " " +
            responsable.correo + " " +
            responsable.especialidad;

        return texto.toLocaleLowerCase().includes(textoBusqueda);
        });
        tablaResponsable.innerHTML = "";

        filtrados.forEach(function(responsable) {
            const fila = document.createElement("tr");
            fila.innerHTML = '
                <td>${resposable.nombre} ${responsable.primerApellido} ${responsable.segundoApellido}</td>
                <><td>${resposable.identificacion}</td><td>${resposable.correo}</td><td>${resposable.especialidad}</td><td>${resposable.fechaRegistro}</td></>
            ';
            tablaResponsable.appendChild(fila);
        });
    }
    function editarResponsable(id){
        const responsables = obtenerDatos(CLAVE_RESPONSABLES);
        const responsable = responsables.find(function(item){
            return item.id === id;
        });
        document.getElementById("responsableId").value = responsable.id;
        document.getElementById("identificacion").value = responsable.identificacion;
        document.getElementById("correo").value = responsable.correo;
        document.getElementById("nombre").value = responsable.nombre;
        document.getElementById("primerApellido").value = responsable.primerApellido;
        document.getElementById("segundoApellido").value = responsable.segundoApellido;
        document.getElementById("telefono").value = responsable.telefono;
        document.getElementById("especialidad").value = responsable.especialidad;
        document.getElementById("institucion").value = responsable.institucion;
        document.getElementById("biografia").value = responsable.biografia;
        document.getElementById("fotografia").value = responsable.fotografia;

        document.getElementById("identificacion").disabled = true;
        document.getElementById("correo").disabled = true;
    }
    function eliminarResponsable(id){
        const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
        const actividadAsociada = actividades.find(function(actividad){
            return actividad.responsableId === id && actividad.estado !== "Cancelada";
        });
        if (actividadAsociada){
            alert("No se puede eliminar. El responsable esta asociado a la actividad: " + actividadAsociada.nombre);
            return;
        }
        const responsables = obtenerDatos(CLAVE_RESPONSABLES);
        const nuevosResponsables = responsables.filter(function(item){
            return item.id !== id;
        });
        guardarDatos(CLAVE_RESPONSABLES, nuevosResponsables);
        mostrarResponsables();
    }
    function limpiarFormularioResponsable(){
        formResponsable.requestFullscreen();
        document.getElementById("responsableId").value = "";
        document.getElementById("identificacion").disabled = false;
        document.getElementById("correo").disabled = false;

        const campos = formResponsable.querySelectorAll("input, textarea");
        campos.forEach(function(error){
            campo.classList.remove("campo-valido");
        });
        const errores = formResponsable.querySelectorAll(".mensaje-error");
        errores.forEach(function(error){
            error.textContent = "";
        });
    }
    formResponsable.addEventListener("submit", guardarResponsable);
    buscarResponsable.addEventListener("input", mostrarResponsables);
    btnLimpiarResponsable.addEventListener("click", limpiarFormularioResponsable);
    mostrarResponsables();
}