// ======================================================
// MODELO: ESPACIOS
// Valida y guarda/busca espacios en MongoDB.
// ======================================================
const { conectarBD } = require("../database/conexion");

async function coleccionEspacios() {
    const db = await conectarBD();
    return db.collection("espacios");
}

// ── Validaciones de campos obligatorios (HUGL-19)
function validarDatosEspacio(datos) {
    if (!datos.nombre || datos.nombre.trim().length < 2) {
        return "El nombre del espacio es obligatorio";
    }
    if (!datos.sede || datos.sede.trim().length < 2) {
        return "La sede es obligatoria";
    }
    return null; // sin errores
}

// ── Crear un espacio nuevo (HUGL-19)
async function crearEspacio(datos) {
    const errorValidacion = validarDatosEspacio(datos);
    if (errorValidacion) {
        return { error: errorValidacion };
    }

    const espacios = await coleccionEspacios();

    const nombre = datos.nombre.trim();
    const sede = datos.sede.trim();
    const estado = datos.estado && datos.estado.trim() !== "" ? datos.estado.trim() : "Disponible";

    // No se puede repetir el mismo nombre en la misma sede
    const yaExiste = await espacios.findOne({
        nombre: { $regex: `^${nombre}$`, $options: "i" },
        sede: { $regex: `^${sede}$`, $options: "i" }
    });

    if (yaExiste) {
        return { error: "Ya existe un espacio con ese nombre en la misma sede" };
    }

    const nuevoEspacio = {
        nombre: nombre,
        sede: sede,
        estado: estado,
        fechaRegistro: new Date()
    };

    const resultado = await espacios.insertOne(nuevoEspacio);

    return { id: resultado.insertedId, espacio: nuevoEspacio };
}

// ── Buscar espacios con filtro de texto opcional
async function buscarEspacios(filtrosQuery) {
    const espacios = await coleccionEspacios();
    const { buscar } = filtrosQuery;
    const filtro = {};

    if (buscar && buscar.trim() !== "") {
        const texto = buscar.trim();
        filtro.$or = [
            { nombre: { $regex: texto, $options: "i" } },
            { sede: { $regex: texto, $options: "i" } }
        ];
    }

    return espacios.find(filtro).toArray();
}

module.exports = { coleccionEspacios, crearEspacio, buscarEspacios };