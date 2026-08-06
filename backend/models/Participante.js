// ======================================================
// MODELO: PARTICIPANTES
// Aquí vive TODA la lógica de negocio de participantes:
// validaciones, reglas de unicidad y acceso a MongoDB.
// server.js solo llama estas funciones.
// ======================================================
const { conectarBD } = require("../database/conexion");

async function coleccionParticipantes() {
    const db = await conectarBD();
    return db.collection("participantes");
}

// ── Validaciones de campos obligatorios y formato
function validarDatosParticipante(datos) {
    if (!datos.nombre || datos.nombre.trim() === "") {
        return "El nombre del participante es obligatorio";
    }
    if (!datos.identificacion || datos.identificacion.trim() === "") {
        return "La identificación del participante es obligatoria";
    }
    if (!datos.correo || datos.correo.trim() === "") {
        return "El correo del participante es obligatorio";
    }
    if (!datos.telefono || datos.telefono.trim() === "") {
        return "El teléfono del participante es obligatorio";
    }
    if (datos.edad === undefined || datos.edad === null || datos.edad === "") {
        return "La edad del participante es obligatoria";
    }
    if (!datos.profesion || datos.profesion.trim() === "") {
        return "La profesión del participante es obligatoria";
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(datos.correo.trim().toLowerCase())) {
        return "El correo electrónico no es válido";
    }

    const edad = parseInt(datos.edad);
    if (isNaN(edad) || edad < 1 || edad > 120) {
        return "La edad debe estar entre 1 y 120 años";
    }

    return null; // sin errores
}

// ── Crear un participante nuevo (RF-25, RF-26)
async function crearParticipante(datos) {
    const errorValidacion = validarDatosParticipante(datos);
    if (errorValidacion) {
        return { error: errorValidacion };
    }

    const participantes = await coleccionParticipantes();

    const nombre = datos.nombre.trim();
    const identificacion = datos.identificacion.trim();
    const correo = datos.correo.trim().toLowerCase();
    const telefono = datos.telefono.trim();
    const profesion = datos.profesion.trim();
    const edad = parseInt(datos.edad);

    // Unicidad de identificación y correo (RNF-01)
    const existePorIdentificacion = await participantes.findOne({ identificacion: identificacion });
    if (existePorIdentificacion) {
        return { error: "La identificación ya está registrada" };
    }

    const existePorCorreo = await participantes.findOne({ correo: correo });
    if (existePorCorreo) {
        return { error: "El correo ya está registrado" };
    }

    const nuevoParticipante = {
        nombre: nombre,
        identificacion: identificacion,
        correo: correo,
        telefono: telefono,
        edad: edad,
        profesion: profesion,
        estado: "Activo",
        fechaRegistro: new Date()
    };

    const resultado = await participantes.insertOne(nuevoParticipante);

    return { id: resultado.insertedId, participante: nuevoParticipante };
}

// ── Buscar participantes con filtros opcionales (RF-28)
async function buscarParticipantes(filtrosQuery) {
    const participantes = await coleccionParticipantes();
    const { buscar, estado, profesion } = filtrosQuery;
    const filtro = {};

    if (buscar && buscar.trim() !== "") {
        const texto = buscar.trim();
        filtro.$or = [
            { nombre: { $regex: texto, $options: "i" } },
            { identificacion: { $regex: texto, $options: "i" } },
            { correo: { $regex: texto, $options: "i" } },
            { profesion: { $regex: texto, $options: "i" } }
        ];
    }

    if (estado && estado.trim() !== "") {
        filtro.estado = estado;
    }

    if (profesion && profesion.trim() !== "") {
        filtro.profesion = { $regex: profesion.trim(), $options: "i" };
    }

    return participantes.find(filtro).toArray();
}

module.exports = { coleccionParticipantes, crearParticipante, buscarParticipantes };