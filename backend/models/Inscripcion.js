// ======================================================
// MODELO: INSCRIPCIONES
// Aquí vive TODA la lógica de negocio de inscripciones:
// validaciones, reglas de duplicado y acceso a MongoDB.
// server.js solo llama estas funciones.
// ======================================================
const { ObjectId } = require("mongodb");
const { conectarBD } = require("../database/conexion");
const { coleccionParticipantes } = require("./Participante");

async function coleccionInscripciones() {
    const db = await conectarBD();
    return db.collection("inscripciones");
}

// ── Crear una inscripción nueva (RF-29)
async function crearInscripcion(datos) {
    if (!datos.participanteId || !ObjectId.isValid(datos.participanteId)) {
        return { error: "Debe seleccionar un participante válido" };
    }
    if (!datos.actividadId) {
        return { error: "Debe seleccionar una actividad" };
    }
    if (!datos.actividadNombre || !datos.actividadCategoria || !datos.actividadFecha) {
        return { error: "Faltan datos de la actividad seleccionada" };
    }

    const participantes = await coleccionParticipantes();
    const participante = await participantes.findOne({ _id: new ObjectId(datos.participanteId) });
    if (!participante) {
        return { error: "El participante no existe" };
    }

    // Actividades ya vive en MongoDB, así que validamos que exista de verdad
    // (antes solo confiábamos en el nombre/categoría/fecha que mandaba el frontend).
    let actividadEncontrada = null;
    if (ObjectId.isValid(datos.actividadId)) {
        const db = await conectarBD();
        actividadEncontrada = await db.collection("actividades").findOne({ _id: new ObjectId(datos.actividadId) });
        if (!actividadEncontrada) {
            return { error: "La actividad no existe" };
        }
        if (!actividadEncontrada.entradaLibre && actividadEncontrada.cuposOcupados >= actividadEncontrada.cupoMaximo) {
            return { error: "La actividad ya no tiene cupos disponibles" };
        }
    }

    const inscripciones = await coleccionInscripciones();

    // Evitar inscripción duplicada activa a la misma actividad (RF-29)
    const yaInscrito = await inscripciones.findOne({
        participanteId: datos.participanteId,
        actividadId: datos.actividadId,
        estado: "Activa"
    });

    if (yaInscrito) {
        return { error: "Este participante ya está inscrito en esta actividad" };
    }

    const nuevaInscripcion = {
        participanteId: datos.participanteId,
        participanteNombre: participante.nombre,
        participanteIdentificacion: participante.identificacion,
        actividadId: datos.actividadId,
        actividadNombre: datos.actividadNombre,
        actividadCategoria: datos.actividadCategoria,
        actividadFecha: datos.actividadFecha,
        fechaInscripcion: new Date(),
        estado: "Activa"
    };

    const resultado = await inscripciones.insertOne(nuevaInscripcion);

    // Actualiza el cupo ocupado de la actividad en Mongo (ahora que sí vive ahí)
    if (actividadEncontrada && !actividadEncontrada.entradaLibre) {
        const db = await conectarBD();
        const nuevosOcupados = actividadEncontrada.cuposOcupados + 1;
        const nuevoEstado = nuevosOcupados >= actividadEncontrada.cupoMaximo ? "Llena" : actividadEncontrada.estado;

        await db.collection("actividades").updateOne(
            { _id: actividadEncontrada._id },
            { $set: { cuposOcupados: nuevosOcupados, estado: nuevoEstado } }
        );
    }

    return { id: resultado.insertedId, inscripcion: nuevaInscripcion };
}

// ── Buscar inscripciones con filtros opcionales (RF-30)
async function buscarInscripciones(filtrosQuery) {
    const inscripciones = await coleccionInscripciones();
    const { buscar, estado, categoria, fecha, actividadId } = filtrosQuery;
    const filtro = {};

    if (actividadId && actividadId.trim() !== "") {
        filtro.actividadId = actividadId.trim();
    }

    if (buscar && buscar.trim() !== "") {
        const texto = buscar.trim();
        filtro.$or = [
            { participanteNombre: { $regex: texto, $options: "i" } },
            { participanteIdentificacion: { $regex: texto, $options: "i" } },
            { actividadNombre: { $regex: texto, $options: "i" } }
        ];
    }

    if (estado && estado.trim() !== "") {
        filtro.estado = estado;
    }

    if (categoria && categoria.trim() !== "") {
        filtro.actividadCategoria = categoria;
    }

    if (fecha && fecha.trim() !== "") {
        filtro.actividadFecha = fecha;
    }

    return inscripciones.find(filtro).sort({ fechaInscripcion: -1 }).toArray();
}

module.exports = { coleccionInscripciones, crearInscripcion, buscarInscripciones };