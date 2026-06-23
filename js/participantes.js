const form = document.getElementById("formParticipante");
const tabla = document.getElementById("tablaParticipantes");
const buscador = document.getElementById("buscarParticipante");
const btnLimpiar = document.getElementById("btnLimpiar");

let participantes =
JSON.parse(localStorage.getItem("participantes")) || [];

function guardarLocal() {
    localStorage.setItem(
        "participantes",
        JSON.stringify(participantes)
    );
}

function limpiarFormulario() {

    form.reset();

    document.getElementById("participanteId").value = "";

    document.getElementById("identificacion").disabled = false;
    document.getElementById("correo").disabled = false;

    document.getElementById("estado").value = "Activo";
}

function mostrarParticipantes() {

    const texto = buscador.value.toLowerCase();

    tabla.innerHTML = "";

    participantes
    .filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.identificacion.toLowerCase().includes(texto) ||
        p.correo.toLowerCase().includes(texto) ||
        p.profesion.toLowerCase().includes(texto) ||
        p.estado.toLowerCase().includes(texto)
    )
    .forEach(p => {

        tabla.innerHTML += `
        <tr>

            <td>${p.nombre}</td>

            <td>${p.identificacion}</td>

            <td>${p.correo}</td>

            <td>${p.profesion}</td>

            <td>
                <span class="${
                    p.estado === "Activo"
                    ? "etiqueta-activo"
                    : "etiqueta-inactivo"
                }">
                    ${p.estado}
                </span>
            </td>

            <td>

                <button
                class="btn-editar"
                onclick="editarParticipante('${p.id}')">
                Editar
                </button>

                <button
                onclick="eliminarParticipante('${p.id}')">
                Eliminar
                </button>

            </td>

        </tr>
        `;
    });
}

form.addEventListener("submit", function(e){

    e.preventDefault();

    const id =
    document.getElementById("participanteId").value;

    const nombre =
    document.getElementById("nombre").value.trim();

    const identificacion =
    document.getElementById("identificacion").value.trim();

    const correo =
    document.getElementById("correo").value.trim().toLowerCase();

    const telefono =
    document.getElementById("telefono").value.trim();

    const edad =
    document.getElementById("edad").value;

    const profesion =
    document.getElementById("profesion").value.trim();

    const estado =
    document.getElementById("estado").value;

    if (
        !nombre ||
        !identificacion ||
        !correo ||
        !telefono ||
        !edad ||
        !profesion
    ) {
        alert("Complete todos los campos.");
        return;
    }

    if (!id) {

        const existe = participantes.some(p =>
            p.identificacion === identificacion ||
            p.correo === correo
        );

        if (existe) {
            alert("La identificación o correo ya existe.");
            return;
        }

        participantes.push({
            id: Date.now().toString(),
            nombre,
            identificacion,
            correo,
            telefono,
            edad,
            profesion,
            estado
        });

    } else {

        const participante =
        participantes.find(p => p.id === id);

        participante.nombre = nombre;
        participante.telefono = telefono;
        participante.edad = edad;
        participante.profesion = profesion;
        participante.estado = estado;
    }

    guardarLocal();
    mostrarParticipantes();
    limpiarFormulario();

    alert("Participante guardado correctamente.");
});

function editarParticipante(id){

    const participante =
    participantes.find(p => p.id === id);

    document.getElementById("participanteId").value =
    participante.id;

    document.getElementById("nombre").value =
    participante.nombre;

    document.getElementById("identificacion").value =
    participante.identificacion;

    document.getElementById("correo").value =
    participante.correo;

    document.getElementById("telefono").value =
    participante.telefono;

    document.getElementById("edad").value =
    participante.edad;

    document.getElementById("profesion").value =
    participante.profesion;

    document.getElementById("estado").value =
    participante.estado;

    document.getElementById("identificacion").disabled = true;
    document.getElementById("correo").disabled = true;
}

function eliminarParticipante(id){

    if (!confirm("¿Desea eliminar este participante?")) {
        return;
    }

    participantes =
    participantes.filter(p => p.id !== id);

    guardarLocal();
    mostrarParticipantes();
}

btnLimpiar.addEventListener(
    "click",
    limpiarFormulario
);

buscador.addEventListener(
    "input",
    mostrarParticipantes
);

mostrarParticipantes();