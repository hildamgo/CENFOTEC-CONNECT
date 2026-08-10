// ======================================================
// MODELO: ESPACIOS
// ======================================================
// Aquí vive la lógica de negocio de los espacios:
// validaciones y acceso a MongoDB.
//
// server.js solamente recibe las peticiones y llama
// estas funciones.
// ======================================================
const { conectarBD } =
    require("../database/conexion");
    
// ======================================================
// COLECCIÓN
// ======================================================
async function coleccionEspacios() {
    const db = await conectarBD();
    return db.collection("espacios");
}
// ======================================================
// VALIDAR DATOS
// ======================================================
function validarDatosEspacio(datos) {
    if (
        !datos.nombre ||
        datos.nombre.trim() === ""
    ) {
        return "El nombre del espacio es obligatorio";
    }
    if (
        datos.nombre.trim().length < 2
    ) {
        return "El nombre del espacio debe tener al menos 2 caracteres";
    }
    if (
        !datos.sede ||
        datos.sede.trim() === ""
    ) {
        return "La sede es obligatoria";
    }
    if (
        datos.sede.trim().length < 2
    ) {
        return "La sede debe tener al menos 2 caracteres";
    }
    if (
        !datos.estado ||
        datos.estado.trim() === ""
    ) {
        return "El estado es obligatorio";
    }
    return null;
}
// ======================================================
// CREAR ESPACIO
// ======================================================
async function crearEspacio(datos) {
    const errorValidacion =
        validarDatosEspacio(datos);
    if (errorValidacion) {
        return {
            error: errorValidacion
        };
    }
    const espacios =
        await coleccionEspacios();
    // ==============================================
    // EVITAR DUPLICADOS
    // ==============================================
    const espacioExistente =
        await espacios.findOne({
            nombre: {
                $regex:
                    `^${escaparRegex(datos.nombre.trim())}$`,
                $options: "i"
            },
            sede: {
                $regex:
                    `^${escaparRegex(datos.sede.trim())}$`,
                $options: "i"
            }
        });
    if (espacioExistente) {
        return {
            error:
                "Ya existe un espacio con ese nombre en la misma sede."
        };
    }
    // ==============================================
    // NUEVO DOCUMENTO
    // ==============================================
    const nuevoEspacio = {
        nombre: datos.nombre.trim(),
        sede: datos.sede.trim(),
        estado: datos.estado.trim(),
        fechaRegistro: new Date()
    };
    const resultado =
        await espacios.insertOne(
            nuevoEspacio
        );
    return {
        id: resultado.insertedId,
        espacio: nuevoEspacio
    };
}
// ======================================================
// OBTENER TODOS LOS ESPACIOS
// ======================================================
async function buscarEspacios() {
    const espacios = await coleccionEspacios();
    return espacios
        .find({})
        .sort({
            nombre: 1
        })
        .toArray();
}
// ======================================================
// ESCAPAR REGEX
// ======================================================
function escaparRegex(
    texto
) {
    return texto.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}
// ======================================================
// EXPORTAR
// ======================================================
module.exports = {
    coleccionEspacios,
    crearEspacio,
    buscarEspacios
};