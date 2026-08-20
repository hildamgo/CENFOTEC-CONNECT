
const API_PARTICIPANTES = "/api/participantes";
const API_ACTIVIDADES   = "/api/actividades";
const API_INSCRIPCIONES = "/api/inscripciones";

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

// ======================================================
// ACTIVIDADES DISPONIBLES (RF-25) — vienen de la API (Mongo)
// ======================================================
async function cargarActividades() {
    selectActividad.innerHTML = '<option value="">— Sin actividad —</option>';

    try {
        const respuesta = await fetch(API_ACTIVIDADES + "?estado=Disponible");

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener las actividades");
        }

        const actividadesDisponibles = await respuesta.json();

        actividadesDisponibles.forEach(function(a) {
            const op = document.createElement("option");
            op.value = a._id;
            op.textContent = a.nombre + " (" + a.fecha + ")";
            op.dataset.nombre    = a.nombre;
            op.dataset.categoria = a.categoria;
            op.dataset.fecha     = a.fecha;
            selectActividad.appendChild(op);
        });

    } catch (error) {
        console.error("Error al cargar actividades:", error);
    }
}

// ── Limpiar formulario
function limpiarFormulario() {
    form.reset();
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

        if (actividadId) {
            await inscribirEnActividad(resultado.id, selectActividad.selectedOptions[0]);
        }

        alert("Participante registrado correctamente.");
        limpiarFormulario();

    } catch (error) {
        console.error("Error al registrar participante:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
});

// ── Inscripción opcional al registrar (RF-25, RF-29) — vía API real
async function inscribirEnActividad(participanteId, opcionActividad) {
    if (!opcionActividad) return;

    try {
        const respuesta = await fetch(API_INSCRIPCIONES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                participanteId: participanteId,
                actividadId: opcionActividad.value,
                actividadNombre: opcionActividad.dataset.nombre,
                actividadCategoria: opcionActividad.dataset.categoria,
                actividadFecha: opcionActividad.dataset.fecha
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert((resultado.mensaje || "No se pudo inscribir a la actividad") + " (el participante sí quedó registrado).");
        }

    } catch (error) {
        console.error("Error al inscribir en la actividad:", error);
        alert("No se pudo inscribir a la actividad (el participante sí quedó registrado).");
    }
}

// ── Eventos y arranque
document.getElementById("btnLimpiar").addEventListener("click", limpiarFormulario);

cargarActividades();