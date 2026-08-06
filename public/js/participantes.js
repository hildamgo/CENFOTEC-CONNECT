// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_PARTICIPANTES = "/api/participantes";

// Actividades sigue en localStorage por ahora (ese módulo no es Mongo todavía)
const CLAVE_ACTIVIDADES   = "cenfotec_actividades";
const CLAVE_INSCRIPCIONES = "cenfotec_inscripciones";

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
const btnVer          = document.getElementById("btnVerParticipantes");

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

// ── Actividades disponibles (RF-25) — todavía locales, se conectan en otro paso
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

// ======================================================
// CONSULTAR PARTICIPANTES DESDE LA API (RF-28)
// ======================================================
async function mostrarParticipantes() {
    const texto     = buscador.value.trim();
    const estado    = filtroEstado.value;
    const profesion = filtroProfesion.value.trim();

    const params = new URLSearchParams();
    if (texto)     params.append("buscar", texto);
    if (estado)    params.append("estado", estado);
    if (profesion) params.append("profesion", profesion);

    tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">Cargando...</td></tr>';

    try {
        const respuesta = await fetch(API_PARTICIPANTES + "?" + params.toString());

        if (!respuesta.ok) {
            throw new Error("Respuesta no válida del servidor");
        }

        const participantes = await respuesta.json();

        if (!participantes.length) {
            tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
            return;
        }

        tabla.innerHTML = participantes.map(function(p) {
            const badge = p.estado === "Activo"
                ? '<span class="etiqueta-activo">Activo</span>'
                : '<span class="etiqueta-inactivo">Inactivo</span>';
            return `<tr>
                <td>${p.nombre}</td><td>${p.identificacion}</td><td>${p.correo}</td>
                <td>${p.telefono}</td><td>${p.edad}</td><td>${p.profesion}</td>
                <td>${badge}</td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al consultar participantes:", error);
        tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c0392b;padding:20px;">No se pudo conectar con el servidor.</td></tr>';
    }
}

// ── Limpiar formulario
function limpiarFormulario() {
    form.reset();
    document.getElementById("participanteId").value = "";
    grupoActividad.style.display = "block";
    cargarActividades();
    limpiarErrores();
}

// ======================================================
// REGISTRAR PARTICIPANTE EN LA API (RF-25, RF-26, RNF-01)
// ======================================================
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const valido = Object.keys(reglas).map(validarCampo).every(Boolean);
    if (!valido) return;

    const nombre         = document.getElementById("nombre").value.trim();
    const identificacion = document.getElementById("identificacion").value.trim();
    const correo         = document.getElementById("correo").value.trim().toLowerCase();
    const telefono       = document.getElementById("telefono").value.trim();
    const edad           = parseInt(document.getElementById("edad").value);
    const profesion      = document.getElementById("profesion").value.trim();
    const actividadId    = selectActividad.value;

    const nuevoParticipante = { nombre, identificacion, correo, telefono, edad, profesion };

    const botonGuardar = form.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_PARTICIPANTES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoParticipante)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            // El servidor ya nos dice cuál campo falló (identificación o correo duplicados, etc.)
            if (resultado.mensaje && resultado.mensaje.toLowerCase().includes("identificación")) {
                marcarCampo("identificacion", false);
                mostrarError("err-identificacion", resultado.mensaje);
            } else if (resultado.mensaje && resultado.mensaje.toLowerCase().includes("correo")) {
                marcarCampo("correo", false);
                mostrarError("err-correo", resultado.mensaje);
            } else {
                alert(resultado.mensaje || "Ocurrió un error al registrar el participante.");
            }
            return;
        }

        if (actividadId) inscribirEnActividad(resultado.id, actividadId);

        alert("Participante registrado correctamente.");
        limpiarFormulario();
        mostrarParticipantes();

    } catch (error) {
        console.error("Error al registrar participante:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
});

// ── Inscripción opcional al registrar (RF-25, RF-29) — todavía local, se conecta en el siguiente paso
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

// ── Eventos y arranque
btnVer.addEventListener("click", mostrarParticipantes);
buscador.addEventListener("input", mostrarParticipantes);
filtroEstado.addEventListener("change", mostrarParticipantes);
filtroProfesion.addEventListener("input", mostrarParticipantes);
btnLimpiar.addEventListener("click", limpiarFormulario);

cargarActividades();
tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">Presioná "Ver Participantes" para cargar la lista.</td></tr>';