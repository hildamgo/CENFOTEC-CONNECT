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

    let actividadesDisponibles = [];
    try {
        const respuesta = await fetch(API_ACTIVIDADES + "?estado=Disponible");
        actividadesDisponibles = await respuesta.json();

        actividadesDisponibles.forEach(a => {
            const cuposTexto = a.entradaLibre ? "Libre" : `${a.cupoMaximo - a.cuposOcupados} cupos`;
            sa.innerHTML += `<option value="${a._id}" data-nombre="${a.nombre}" data-categoria="${a.categoria}" data-fecha="${a.fecha}">
                ${a.nombre} (${a.fecha}) — ${cuposTexto}
            </option>`;
        });
    } catch (error) {
        console.error("Error al cargar actividades:", error);
    }

    // Categorías para el filtro, tomadas de las actividades disponibles
    const fc = document.getElementById("filtroCategoria");
    const cats = [...new Set(actividadesDisponibles.map(a => a.categoria))];
    fc.innerHTML = '<option value="">Todas</option>';
    cats.forEach(c => { fc.innerHTML += `<option value="${c}">${c}</option>`; });
}

// ======================================================
// CONSULTAR INSCRIPCIONES DESDE LA API (RF-30)
// ======================================================
async function mostrarInscripciones() {
    const texto  = document.getElementById("buscarInscripcion").value.trim();
    const estado = document.getElementById("filtroEstado").value;
    const cat    = document.getElementById("filtroCategoria").value;
    const fecha  = document.getElementById("filtroFecha").value;
    const tabla  = document.getElementById("tablaInscripciones");

    const params = new URLSearchParams();
    if (texto)  params.append("buscar", texto);
    if (estado) params.append("estado", estado);
    if (cat)    params.append("categoria", cat);
    if (fecha)  params.append("fecha", fecha);

    tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">Cargando...</td></tr>';

    try {
        const respuesta = await fetch(API_INSCRIPCIONES + "?" + params.toString());
        if (!respuesta.ok) throw new Error("Respuesta no válida del servidor");

        const inscripciones = await respuesta.json();

        if (!inscripciones.length) {
            tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">Sin resultados.</td></tr>';
            return;
        }

        tabla.innerHTML = inscripciones.map(i => {
            const badge = i.estado === "Activa"
                ? '<span class="etiqueta-activo">Activa</span>'
                : '<span class="etiqueta-inactivo">Cancelada</span>';
            const fechaInscripcion = new Date(i.fechaInscripcion).toLocaleDateString("es-CR");
            return `<tr>
                <td>${i.participanteNombre}</td><td>${i.participanteIdentificacion}</td>
                <td>${i.actividadNombre}</td><td>${i.actividadCategoria}</td>
                <td>${i.actividadFecha}</td><td>${fechaInscripcion}</td>
                <td>${badge}</td>
            </tr>`;
        }).join("");

    } catch (error) {
        console.error("Error al consultar inscripciones:", error);
        tabla.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c0392b;padding:20px;">No se pudo conectar con el servidor.</td></tr>';
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
        await mostrarInscripciones();

    } catch (error) {
        console.error("Error al registrar inscripción:", error);
        alert("No se pudo conectar con el servidor. Intente de nuevo.");
    } finally {
        botonGuardar.disabled = false;
    }
});

// ── Eventos y arranque
["buscarInscripcion", "filtroEstado", "filtroCategoria", "filtroFecha"]
    .forEach(id => document.getElementById(id).addEventListener("input", mostrarInscripciones));

document.getElementById("btnLimpiar").addEventListener("click", async function () {
    document.getElementById("formInscripcion").reset();
    await cargarSelects();
});

document.getElementById("btnVerInscripciones").addEventListener("click", mostrarInscripciones);

cargarSelects();
document.getElementById("tablaInscripciones").innerHTML =
    '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">Presioná "Ver Inscripciones" para cargar la lista.</td></tr>';