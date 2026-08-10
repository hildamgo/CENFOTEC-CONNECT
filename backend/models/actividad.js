// ======================================================
// MODELO: ACTIVIDADES
// ======================================================
// Aquí se encuentra la lógica de negocio de actividades.
// El servidor recibe la petición y este modelo trabaja
// con MongoDB.
//
// Funciones principales:
// - crearActividad()
// - buscarActividades()
// - buscarActividadPorId()
// ======================================================
const { conectarBD } =
    require("../database/conexion");
// ======================================================
// COLECCIÓN
// ======================================================
async function coleccionActividades() {
    const db =
        await conectarBD();

    return db.collection("actividades");
}
// ======================================================
// VALIDAR DATOS
// ======================================================
function validarDatosActividad(datos) {
    if (
        !datos.nombre ||
        datos.nombre.trim() === ""
    ) {
        return "El nombre de la actividad es obligatorio";
    }
    if (
        !datos.categoria ||
        datos.categoria.trim() === ""
    ) {
        return "La categoría es obligatoria";
    }
    if (
        !datos.descripcion ||
        datos.descripcion.trim().length < 10
    ) {
        return "La descripción debe tener al menos 10 caracteres";
    }
    if (
        !datos.fecha ||
        datos.fecha.trim() === ""
    ) {
        return "La fecha es obligatoria";
    }
    if (
        !datos.horaInicio ||
        datos.horaInicio.trim() === ""
    ) {
        return "La hora de inicio es obligatoria";
    }
    if (
        !datos.horaFin ||
        datos.horaFin.trim() === ""
    ) {
        return "La hora de finalización es obligatoria";
    }
    if (
        !datos.lugar ||
        datos.lugar.trim() === ""
    ) {
        return "El lugar es obligatorio";
    }
    if (
        !datos.responsableNombre ||
        datos.responsableNombre.trim() === ""
    ) {
        return "El responsable es obligatorio";
    }
    // Entrada libre no necesita cupo
    if (!datos.entradaLibre) {
        const cupo =
            parseInt(datos.cupoMaximo);
        if (
            isNaN(cupo) ||
            cupo <= 0
        ) {
            return "El cupo máximo debe ser mayor que 0";
        }
    }
    return null;
}
// ======================================================
// CREAR ACTIVIDAD
// ======================================================
async function crearActividad(datos) {
    const errorValidacion =
        validarDatosActividad(datos);
    if (errorValidacion) {
        return {
            error: errorValidacion
        };
    }
    const actividades =
        await coleccionActividades();
    const nuevaActividad = {
        nombre: datos.nombre.trim(),
        categoria: datos.categoria.trim(),
        descripcion: datos.descripcion.trim(),
        fecha: datos.fecha.trim(),
        horaInicio: datos.horaInicio.trim(),
        horaFin: datos.horaFin.trim(),
        lugar: datos.lugar.trim(),
        cupoMaximo: datos.entradaLibre ? null: parseInt(datos.cupoMaximo),
        entradaLibre: !!datos.entradaLibre,
        cuposOcupados: 0,
        responsableId: datos.responsableId || "",
        responsableNombre: datos.responsableNombre.trim(),
        estado: "Disponible",
        fechaRegistro: new Date()
    };
    const resultado =
        await actividades.insertOne(
            nuevaActividad
        );
    return {
        id:
            resultado.insertedId,
        actividad:
            nuevaActividad
    };
}
// ======================================================
// OBTENER TODAS LAS ACTIVIDADES
// ======================================================
async function buscarActividades() {
    const actividades =
        await coleccionActividades();
    return actividades
        .find({})
        .sort({
            fecha: 1,
            horaInicio: 1
        })
        .toArray();
}
// ======================================================
// OBTENER UNA ACTIVIDAD POR ID
// ======================================================
async function buscarActividadPorId(id) {
    const {
        ObjectId
    } = require("mongodb");
    if (
        !ObjectId.isValid(id)
    ) {
        return null;
    }
    const actividades =
        await coleccionActividades();
    return actividades.findOne({
        _id:
            new ObjectId(id)
    });
}
// ======================================================
// EXPORTAR FUNCIONES
// ======================================================
module.exports = {
    coleccionActividades,
    crearActividad,
    buscarActividades,
    buscarActividadPorId
};