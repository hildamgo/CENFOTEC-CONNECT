// ======================================================
// CONFIGURACIÓN DE LA API
// ======================================================
const API_PARTICIPANTES  = "/api/participantes";
const API_INSCRIPCIONES  = "/api/inscripciones";
const API_ACTIVIDADES    = "/api/actividades";

const mapaErrorCampo = {
    "err-participante": "selectParticipante",
    "err-actividad":    "selectActividad"
};

function setError(id, msg) {
    document.getElementById(id).textContent = msg;
    const campo = document.getElementById(mapaErrorCampo[id]);
    if (!campo) return;
    campo.classList.toggle("campo-error", !!msg);
    campo.classList.toggle("campo-valido", !msg);
}

// ======================================================
// CARGAR SELECTS — Participantes y Actividades vienen de la API (Mongo)
// ======================================================
async function cargarSelects() {
    const sp = document.getElementById("selectParticipante");
    sp.innerHTML = '<option value="">— Seleccione un participante —</option>';

    try {
        const respuesta = await fetch(API_PARTICIPANTES + "?estado=Activo");
        const participantes = await respuesta.json();
        participantes.forEach(p => {
            sp.innerHTML += `<option value="${p._id}">${p.nombre} — ${p.identificacion}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar participantes:", error);
    }

    const sa = document.getElementById("selectActividad");
    sa.innerHTML = '<option value="">— Seleccione una actividad —</option>';

    try {
        const respuesta = await fetch(API_ACTIVIDADES + "?estado=Disponible");
        const actividadesDisponibles = await respuesta.json();

        actividadesDisponibles.forEach(a => {
            const cuposTexto = a.entradaLibre ? "Libre" : `${a.cupoMaximo - a.cuposOcupados} cupos`;
            sa.innerHTML += `<option value="${a._id}" data-nombre="${a.nombre}" data-categoria="${a.categoria}" data-fecha="${a.fecha}">
                ${a.nombre} (${a.fecha}) — ${cuposTexto}
            </option>`;
        });
    } catch (error) {
        console.error("Error al cargar actividades:", error);
    }
}

// ======================================================
// REGISTRAR INSCRIPCIÓN (RF-29)
// ======================================================
document.getElementById("formInscripcion").addEventListener("submit", async function (e) {
    e.preventDefault();

    const selectParticipante = document.getElementById("selectParticipante");
    const selectActividad    = document.getElementById("selectActividad");
    const partId = selectParticipante.value;
    const actId  = selectActividad.value;

    setError("err-participante", partId ? "" : "Seleccione un participante.");
    setError("err-actividad",    actId  ? "" : "Seleccione una actividad.");
    if (!partId || !actId) return;

    const opcionActividad = selectActividad.selectedOptions[0];

    const nuevaInscripcion = {
        participanteId: partId,
        actividadId: actId,
        actividadNombre: opcionActividad.dataset.nombre,
        actividadCategoria: opcionActividad.dataset.categoria,
        actividadFecha: opcionActividad.dataset.fecha
    };

    const botonGuardar = this.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(API_INSCRIPCIONES, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaInscripcion)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            alert(resultado.mensaje || "Ocurrió un error al registrar la inscripción.");
            return;
        }

        alert("Inscripción registrada correctamente.");
        this.reset();
        await cargarSelects();

    } catch (error) {
        console.error("Error al registrar inscripción:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
});

// ── Eventos y arranque
document.getElementById("btnLimpiar").addEventListener("click", async function () {
    document.getElementById("formInscripcion").reset();
    await cargarSelects();
});

cargarSelects();