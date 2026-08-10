// ======================================================
// MODELO: RESPONSABLES
// Valida y guarda/busca responsables en MongoDB.
// server.js solo llama estas funciones.
// ======================================================
const { conectarBD } = require("../database/conexion");

async function coleccionResponsables() {
    const db = await conectarBD();
    return db.collection("responsables");
}

// ── Validaciones de campos obligatorios (HUGR-21)
function validarDatosResponsable(datos) {
    if (!datos.identificacion || datos.identificacion.trim().length < 5) {
        return "La identificación es obligatoria (mínimo 5 caracteres)";
    }
    if (!datos.correo || datos.correo.trim() === "") {
        return "El correo es obligatorio";
    }
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(datos.correo.trim().toLowerCase())) {
        return "El correo electrónico no es válido";
    }
    if (!datos.nombre || datos.nombre.trim().length < 2) {
        return "El nombre es obligatorio";
    }
    if (!datos.primerApellido || datos.primerApellido.trim().length < 2) {
        return "El primer apellido es obligatorio";
    }
    if (!datos.segundoApellido || datos.segundoApellido.trim().length < 2) {
        return "El segundo apellido es obligatorio";
    }
    if (!datos.telefono || datos.telefono.trim().length < 8) {
        return "El teléfono es obligatorio (mínimo 8 dígitos)";
    }
    if (!datos.especialidad || datos.especialidad.trim().length < 3) {
        return "La especialidad es obligatoria";
    }
    if (!datos.institucion || datos.institucion.trim() === "") {
        return "La institución es obligatoria";
    }
    if (!datos.biografia || datos.biografia.trim() === "") {
        return "La biografía es obligatoria";
    }
    if (!datos.fotografia || (!datos.fotografia.startsWith("http://") && !datos.fotografia.startsWith("https://"))) {
        return "La URL de la fotografía no es válida";
    }

    return null; // sin errores
}

// ── Crear un responsable nuevo (HUGR-21)
async function crearResponsable(datos) {
    const errorValidacion = validarDatosResponsable(datos);
    if (errorValidacion) {
        return { error: errorValidacion };
    }

    const responsables = await coleccionResponsables();

    const identificacion = datos.identificacion.trim();
    const correo = datos.correo.trim().toLowerCase();

    // Unicidad de identificación y correo (RNF-01)
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
        fotografia: datos.fotografia.trim(),
        fechaRegistro: new Date()
    };

    const resultado = await responsables.insertOne(nuevoResponsable);

    return { id: resultado.insertedId, responsable: nuevoResponsable };
}

// ── Buscar responsables con filtro de texto opcional (HUGR-24)
async function buscarResponsables(filtrosQuery) {
    const responsables = await coleccionResponsables();
    const { buscar } = filtrosQuery;
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

    return responsables.find(filtro).toArray();
}

module.exports = { coleccionResponsables, crearResponsable, buscarResponsables };