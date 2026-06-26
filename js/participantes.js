
const CLAVE_PARTICIPANTES = "cenfotec_participantes";
const CLAVE_INSCRIPCIONES = "cenfotec_inscripciones";
const CLAVE_ACTIVIDADES   = "cenfotec_actividades";

function obtenerDatos(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}
function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}
function crearId() {
    return Date.now().toString();
}
function obtenerFechaActual() {
    return new Date().toLocaleDateString("es-CR");
}
function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}
function limpiarError(id) {
    mostrarError(id, "");
}
function marcarCampo(id, ok) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("campo-error", "campo-valido");
    el.classList.add(ok ? "campo-valido" : "campo-error");
}


const form            = document.getElementById("formParticipante");
const tabla           = document.getElementById("tablaParticipantes");
const buscador        = document.getElementById("buscarParticipante");
const btnLimpiar      = document.getElementById("btnLimpiar");
const filtroEstado    = document.getElementById("filtroEstado");
const filtroProfesion = document.getElementById("filtroProfesion");
const grupoActividad  = document.getElementById("grupoActividad");
const selectActividad = document.getElementById("actividadOpcional");

// ── Validación (RNF-04) 
const reglas = {
    nombre:         { err: "err-nombre",         msg: "El nombre es obligatorio." },
    identificacion: { err: "err-identificacion", msg: "La identificación es obligatoria." },
    correo:         { err: "err-correo",         msg: "Ingrese un correo válido." },
    telefono:       { err: "err-telefono",       msg: "El teléfono es obligatorio." },
    edad:           { err: "err-edad",           msg: "Ingrese una edad válida (1–120)." },
    profesion:      { err: "err-profesion",      msg: "La profesión es obligatoria." }
};

function validarCampo(id) {
    const r   = reglas[id];
    const val = document.getElementById(id).value.trim();
    let ok    = !!val;
    if (id === "correo") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (id === "edad")   ok = val && parseInt(val) >= 1 && parseInt(val) <= 120;
    marcarCampo(id, ok);
    ok ? limpiarError(r.err) : mostrarError(r.err, r.msg);
    return ok;
}

function limpiarErrores() {
    Object.keys(reglas).forEach(function(id) {
        document.getElementById(id).classList.remove("campo-error", "campo-valido");
        limpiarError(reglas[id].err);
    });
}

Object.keys(reglas).forEach(function(id) {
    document.getElementById(id).addEventListener("blur", function() { validarCampo(id); });
});

// ── Actividades disponibles (RF-25)
function cargarActividades() {
    selectActividad.innerHTML = '<option value="">— Sin actividad —</option>';
    obtenerDatos(CLAVE_ACTIVIDADES)
        .filter(function(a) { return a.estado === "Disponible"; })
        .forEach(function(a) {
            const op = document.createElement("option");
            op.value       = a.id;
            op.textContent = a.nombre + " (" + a.fecha + ")";
            selectActividad.appendChild(op);
        });
}

// ── Tabla (RF-28) 
function mostrarParticipantes() {
    const texto     = buscador.value.toLowerCase().trim();
    const estado    = filtroEstado.value;
    const profesion = filtroProfesion.value.toLowerCase().trim();

    const filtrados = obtenerDatos(CLAVE_PARTICIPANTES).filter(function(p) {
        return (!texto    || [p.nombre, p.identificacion, p.correo, p.profesion]
                                .some(function(v) { return v.toLowerCase().includes(texto); }))
            && (!estado   || p.estado === estado)
            && (!profesion || p.profesion.toLowerCase().includes(profesion));
    });

    if (!filtrados.length) {
        tabla.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
        return;
    }

    tabla.innerHTML = filtrados.map(function(p) {
        const badge = p.estado === "Activo"
            ? '<span class="etiqueta-activo">Activo</span>'
            : '<span class="etiqueta-inactivo">Inactivo</span>';
        return `<tr>
            <td>${p.nombre}</td><td>${p.identificacion}</td><td>${p.correo}</td>
            <td>${p.telefono}</td><td>${p.edad}</td><td>${p.profesion}</td>
            <td>${badge}</td>
            <td>
                <button class="btn-editar" onclick="editarParticipante('${p.id}')">Editar</button>
                <button onclick="eliminarParticipante('${p.id}')">Eliminar</button>
            </td>
        </tr>`;
    }).join("");
}

// ── Limpiar formulario 
function limpiarFormulario() {
    form.reset();
    document.getElementById("participanteId").value    = "";
    document.getElementById("identificacion").disabled = false;
    document.getElementById("correo").disabled         = false;
    grupoActividad.style.display = "block";
    cargarActividades();
    limpiarErrores();
}

// ── Submit (RF-25, RF-26, RF-27, RNF-01)
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const valido = Object.keys(reglas).map(validarCampo).every(Boolean);
    if (!valido) return;

    const id             = document.getElementById("participanteId").value;
    const nombre         = document.getElementById("nombre").value.trim();
    const identificacion = document.getElementById("identificacion").value.trim();
    const correo         = document.getElementById("correo").value.trim().toLowerCase();
    const telefono       = document.getElementById("telefono").value.trim();
    const edad           = parseInt(document.getElementById("edad").value);
    const profesion      = document.getElementById("profesion").value.trim();
    const estado         = document.getElementById("estado").value;
    const actividadId    = selectActividad.value;

    let participantes = obtenerDatos(CLAVE_PARTICIPANTES);

    if (!id) {
        // Unicidad (RF-26, RNF-01)
        if (participantes.find(function(p) { return p.identificacion === identificacion; })) {
            marcarCampo("identificacion", false);
            mostrarError("err-identificacion", "Identificación ya registrada.");
            return;
        }
        if (participantes.find(function(p) { return p.correo === correo; })) {
            marcarCampo("correo", false);
            mostrarError("err-correo", "Correo ya registrado.");
            return;
        }

        const nuevoId = crearId();
        participantes.push({ id: nuevoId, nombre, identificacion, correo, telefono, edad, profesion, estado, fechaRegistro: obtenerFechaActual() });
        guardarDatos(CLAVE_PARTICIPANTES, participantes);

        if (actividadId) inscribirEnActividad(nuevoId, actividadId);
        alert("Participante registrado correctamente.");

    } else {
        // Edición (RF-27) — identificacion y correo no se tocan (RF-26)
        const i = participantes.findIndex(function(p) { return p.id === id; });
        Object.assign(participantes[i], { nombre, telefono, edad, profesion, estado });
        guardarDatos(CLAVE_PARTICIPANTES, participantes);
        alert("Participante actualizado correctamente.");
    }

    mostrarParticipantes();
    limpiarFormulario();
});

// ── Inscripción opcional al registrar (RF-25, RF-29) 
function inscribirEnActividad(participanteId, actividadId) {
    const actividades = obtenerDatos(CLAVE_ACTIVIDADES);
    const i = actividades.findIndex(function(a) { return a.id === actividadId; });
    if (i === -1) return;

    if (actividades[i].cuposOcupados >= actividades[i].cupoMaximo) {
        alert("La actividad ya no tiene cupos. Participante registrado sin inscripción.");
        return;
    }

    const inscripciones = obtenerDatos(CLAVE_INSCRIPCIONES);
    inscripciones.push({
        id: crearId(),
        participanteId,
        actividadId,
        actividadNombre:    actividades[i].nombre,
        actividadCategoria: actividades[i].categoria,
        actividadFecha:     actividades[i].fecha,
        fechaInscripcion:   obtenerFechaActual(),
        estado: "Activa"
    });

    actividades[i].cuposOcupados += 1;
    if (actividades[i].cuposOcupados >= actividades[i].cupoMaximo) actividades[i].estado = "Llena";

    guardarDatos(CLAVE_INSCRIPCIONES, inscripciones);
    guardarDatos(CLAVE_ACTIVIDADES, actividades);
}

// ── Editar (RF-27, RF-26) 
function editarParticipante(id) {
    const p = obtenerDatos(CLAVE_PARTICIPANTES).find(function(p) { return p.id === id; });
    if (!p) return;

    ["participanteId","nombre","identificacion","correo","telefono","edad","profesion","estado"]
        .forEach(function(campo) {
            document.getElementById(campo).value = p[campo === "participanteId" ? "id" : campo];
        });

    document.getElementById("identificacion").disabled = true;
    document.getElementById("correo").disabled         = true;
    grupoActividad.style.display = "none";
    limpiarErrores();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Eliminar (RF-27, RNF-03) 
function eliminarParticipante(id) {
    const inscripciones = obtenerDatos(CLAVE_INSCRIPCIONES);

    if (inscripciones.some(function(i) { return i.participanteId === id && i.estado === "Activa"; })) {
        alert("No se puede eliminar: el participante tiene inscripciones activas. Cancélelas primero.");
        return;
    }
    if (!confirm("¿Eliminar este participante? Sus inscripciones también serán eliminadas.")) return;

    guardarDatos(CLAVE_PARTICIPANTES, obtenerDatos(CLAVE_PARTICIPANTES).filter(function(p) { return p.id !== id; }));
    guardarDatos(CLAVE_INSCRIPCIONES, inscripciones.filter(function(i) { return i.participanteId !== id; }));
    mostrarParticipantes();
}

// ── Eventos y arranque 
buscador.addEventListener("input", mostrarParticipantes);
filtroEstado.addEventListener("change", mostrarParticipantes);
filtroProfesion.addEventListener("input", mostrarParticipantes);
btnLimpiar.addEventListener("click", limpiarFormulario);

cargarActividades();
mostrarParticipantes();