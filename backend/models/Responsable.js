// ======================================================
// MODELO: RESPONSABLES
// Aquí vive TODA la lógica de negocio de responsables:
// validaciones, reglas de unicidad y acceso a MongoDB.
// server.js solo llama estas funciones.
// ======================================================
const { conectarBD } = require("../database/conexion");

async function coleccionResponsables() {
    const db = await conectarBD();
    return db.collection("responsables");
}

// ── Validaciones de campos obligatorios y formato
function validarDatosResponsable(datos) {
    if (!datos.identificacion || datos.identificacion.trim() === "") {
        return "La identificación del responsable es obligatoria";
    }
    if (!datos.correo || datos.correo.trim() === "") {
        return "El correo del responsable es obligatorio";
    }
    if (!datos.nombre || datos.nombre.trim() === "") {
        return "El nombre del responsable es obligatorio";
    }
    if (!datos.primerApellido || datos.primerApellido.trim() === "") {
        return "El primer apellido del responsable es obligatorio";
    }
    if (!datos.segundoApellido || datos.segundoApellido.trim() === "") {
        return "El segundo apellido del responsable es obligatorio";
    }
    if (!datos.telefono || datos.telefono.trim() === "") {
        return "El teléfono del responsable es obligatorio";
    }
    if (!datos.especialidad || datos.especialidad.trim() === "") {
        return "La especialidad del responsable es obligatoria";
    }
    if (!datos.institucion || datos.institucion.trim() === "") {
        return "La institución del responsable es obligatoria";
    }
    if (!datos.biografia || datos.biografia.trim() === "") {
        return "La biografía del responsable es obligatoria";
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(datos.correo.trim().toLowerCase())) {
        return "El correo electrónico no es válido";
    }

    return null; // sin errores
}

// ── Crear un responsable nuevo
async function crearResponsable(datos) {
    const errorValidacion = validarDatosResponsable(datos);
    if (errorValidacion) {
        return { error: errorValidacion };
    }

    const responsables = await coleccionResponsables();

    const identificacion = datos.identificacion.trim();
    const correo = datos.correo.trim().toLowerCase();

    // Unicidad de identificación y correo
    const existePorIdentificacion = await responsables.findOne({ identificacion: identificacion });
    if (existePorIdentificacion) {
        return { error: "La identificación ya está registrada" };
    }

    const existePorCorreo = await responsables.findOne({ correo: correo });
    if (existePorCorreo) {
        return { error: "El correo ya está registrado" };
    }

    const nuevoResponsable = {
        identificacion: identificacion,
        correo: correo,
        nombre: datos.nombre.trim(),
        primerApellido: datos.primerApellido.trim(),
        segundoApellido: datos.segundoApellido.trim(),
        telefono: datos.telefono.trim(),
        especialidad: datos.especialidad.trim(),
        institucion: datos.institucion.trim(),
        biografia: datos.biografia.trim(),
        fotografia: datos.fotografia || null,
        estado: "Activo",
        fechaRegistro: new Date()
    };

    const resultado = await responsables.insertOne(nuevoResponsable);

    return { id: resultado.insertedId, responsable: nuevoResponsable };
}

// ── Buscar responsables con filtros opcionales
async function buscarResponsables(filtrosQuery) {
    const responsables = await coleccionResponsables();
    const { buscar, especialidad, estado } = filtrosQuery || {};
    const filtro = {};

    if (buscar && buscar.trim() !== "") {
        const texto = buscar.trim();
        filtro.$or = [
            { nombre: { $regex: texto, $options: "i" } },
            { primerApellido: { $regex: texto, $options: "i" } },
            { segundoApellido: { $regex: texto, $options: "i" } },
            { identificacion: { $regex: texto, $options: "i" } },
            { correo: { $regex: texto, $options: "i" } },
            { especialidad: { $regex: texto, $options: "i" } }
        ];
    }

    if (especialidad && especialidad.trim() !== "") {
        filtro.especialidad = { $regex: especialidad.trim(), $options: "i" };
    }

    if (estado && estado.trim() !== "") {
        filtro.estado = estado;
    }

    return responsables.find(filtro).toArray();
}

module.exports = { coleccionResponsables, crearResponsable, buscarResponsables };