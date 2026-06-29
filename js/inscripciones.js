const CLAVE_INSCRIPCIONES = "cenfotec_inscripciones";
const CLAVE_PARTICIPANTES = "cenfotec_participantes";
const CLAVE_ACTIVIDADES   = "cenfotec_actividades";


const obtener = c => JSON.parse(localStorage.getItem(c)) || [];
const guardar  = (c, d) => localStorage.setItem(c, JSON.stringify(d));
const crearId  = () => Date.now().toString();
const hoy      = () => new Date().toLocaleDateString("es-CR");

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

//aqui cargam los selects 
function cargarSelects() {
    // Participantes activos
    const sp = document.getElementById("selectParticipante");
    sp.innerHTML = '<option value="">— Seleccione un participante —</option>';
    obtener(CLAVE_PARTICIPANTES).filter(p => p.estado === "Activo").forEach(p => {
        sp.innerHTML += `<option value="${p.id}">${p.nombre} — ${p.identificacion}</option>`;
    });

    // se ven acytividades 
    const sa = document.getElementById("selectActividad");
    sa.innerHTML = '<option value="">— Seleccione una actividad —</option>';
    obtener(CLAVE_ACTIVIDADES).filter(a => a.estado === "Disponible").forEach(a => {
        sa.innerHTML += `<option value="${a.id}">${a.nombre} (${a.fecha}) — ${a.cupoMaximo - a.cuposOcupados} cupos</option>`;
    });

    // Categorías para filtro
    const fc = document.getElementById("filtroCategoria");
    const cats = [...new Set(obtener(CLAVE_ACTIVIDADES).map(a => a.categoria))];
    fc.innerHTML = '<option value="">Todas</option>';
    cats.forEach(c => { fc.innerHTML += `<option value="${c}">${c}</option>`; });
}

// Tabla 
function mostrarInscripciones() {
    const texto  = document.getElementById("buscarInscripcion").value.toLowerCase().trim();
    const estado = document.getElementById("filtroEstado").value;
    const cat    = document.getElementById("filtroCategoria").value;
    const fecha  = document.getElementById("filtroFecha").value;
    const parts  = obtener(CLAVE_PARTICIPANTES);
    const tabla  = document.getElementById("tablaInscripciones");

    const filtradas = obtener(CLAVE_INSCRIPCIONES).filter(i => {
        const p = parts.find(p => p.id === i.participanteId);
        return (!texto  || [p?.nombre, p?.identificacion, i.actividadNombre].some(v => v?.toLowerCase().includes(texto)))
            && (!estado || i.estado === estado)
            && (!cat    || i.actividadCategoria === cat)
            && (!fecha  || i.actividadFecha === fecha);
    });

    if (!filtradas.length) {
        tabla.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
        return;
    }

    tabla.innerHTML = filtradas.map(i => {
        const p     = parts.find(p => p.id === i.participanteId);
        const badge = i.estado === "Activa"
            ? '<span class="etiqueta-activo">Activa</span>'
            : '<span class="etiqueta-inactivo">Cancelada</span>';
        const btns = i.estado === "Activa"
            ? `<button class="btn-editar" onclick="cancelarInscripcion('${i.id}')">Cancelar</button>
               <button onclick="eliminarInscripcion('${i.id}')">Eliminar</button>`
            : `<button onclick="eliminarInscripcion('${i.id}')">Eliminar</button>`;
        return `<tr>
            <td>${p?.nombre || "—"}</td><td>${p?.identificacion || "—"}</td>
            <td>${i.actividadNombre}</td><td>${i.actividadCategoria}</td>
            <td>${i.actividadFecha}</td><td>${i.fechaInscripcion}</td>
            <td>${badge}</td><td><div style="display:flex;gap:6px;">${btns}</div></td>
        </tr>`;
    }).join("");
}

// ── aca sed Liberara cupo (RF-31, RF-32) 
function liberarCupo(actividadId) {
    const acts = obtener(CLAVE_ACTIVIDADES);
    const i    = acts.findIndex(a => a.id === actividadId);
    if (i === -1) return;
    if (acts[i].cuposOcupados > 0) acts[i].cuposOcupados -= 1;
    if (acts[i].estado === "Llena") acts[i].estado = "Disponible";
    guardar(CLAVE_ACTIVIDADES, acts);
}

// ── Submit: nueva inscripción (RF-29) ─────────────────────────
document.getElementById("formInscripcion").addEventListener("submit", function(e) {
    e.preventDefault();
    const partId = document.getElementById("selectParticipante").value;
    const actId  = document.getElementById("selectActividad").value;

    setError("err-participante", partId ? "" : "Seleccione un participante.");
    setError("err-actividad",    actId  ? "" : "Seleccione una actividad.");
    if (!partId || !actId) return;

    const acts  = obtener(CLAVE_ACTIVIDADES);
    const inscs = obtener(CLAVE_INSCRIPCIONES);
    const iAct  = acts.findIndex(a => a.id === actId);

    // RF-29: duplicado
    if (inscs.some(i => i.participanteId === partId && i.actividadId === actId && i.estado === "Activa")) {
        alert("Este participante ya está inscrito en esta actividad."); return;
    }
    // RF-29: cupo
    if (acts[iAct].cuposOcupados >= acts[iAct].cupoMaximo) {
        alert("Esta actividad no tiene cupos disponibles."); return;
    }

    inscs.push({
        id: crearId(), participanteId: partId, actividadId: actId,
        actividadNombre: acts[iAct].nombre, actividadCategoria: acts[iAct].categoria,
        actividadFecha: acts[iAct].fecha, fechaInscripcion: hoy(), estado: "Activa"
    });

    acts[iAct].cuposOcupados += 1;
    if (acts[iAct].cuposOcupados >= acts[iAct].cupoMaximo) acts[iAct].estado = "Llena";

    guardar(CLAVE_INSCRIPCIONES, inscs);
    guardar(CLAVE_ACTIVIDADES, acts);
    alert("Inscripción registrada correctamente.");
    cargarSelects();
    mostrarInscripciones();
    this.reset();
});

// ── Cancelar (RF-31, RF-32) 
function cancelarInscripcion(id) {
    if (!confirm("¿Cancelar esta inscripción? Se liberará el cupo.")) return;
    const inscs = obtener(CLAVE_INSCRIPCIONES);
    const i     = inscs.findIndex(i => i.id === id);
    liberarCupo(inscs[i].actividadId);
    inscs[i].estado = "Cancelada";
    guardar(CLAVE_INSCRIPCIONES, inscs);
    cargarSelects();
    mostrarInscripciones();
}

// ── Eliminar (RF-32)
function eliminarInscripcion(id) {
    if (!confirm("¿Eliminar esta inscripción? No se puede deshacer.")) return;
    let inscs = obtener(CLAVE_INSCRIPCIONES);
    const insc = inscs.find(i => i.id === id);
    if (insc?.estado === "Activa") liberarCupo(insc.actividadId);
    guardar(CLAVE_INSCRIPCIONES, inscs.filter(i => i.id !== id));
    cargarSelects();
    mostrarInscripciones();
}

// ── Eventos y arranque 
["buscarInscripcion","filtroEstado","filtroCategoria","filtroFecha"]
    .forEach(id => document.getElementById(id).addEventListener("input", mostrarInscripciones));

document.getElementById("btnLimpiar").addEventListener("click", function() {
    document.getElementById("formInscripcion").reset();
    cargarSelects();
});

cargarSelects();
mostrarInscripciones();