// ======================================================
// MODELO: ACTIVIDADES
// Aquí vive la lógica de negocio de actividades: validaciones
// y acceso a MongoDB. server.js solo llama estas funciones.
//
// Nota: Espacios y Responsables todavía no viven en MongoDB
// (esos módulos no están migrados), así que el frontend nos
// manda esos datos ya resueltos (nombre del espacio/lugar,
// nombre del responsable). El día que se migren, esta función
// se puede actualizar para validar contra sus colecciones.
// ======================================================
const { conectarBD } = require("../database/conexion");

async function coleccionActividades() {
    const db = await conectarBD();
    return db.collection("actividades");
}

// ── Validaciones de campos obligatorios (HUGA-10, HUGA-11)
function validarDatosActividad(datos) {
    if (!datos.nombre || datos.nombre.trim() === "") {
        return "El nombre de la actividad es obligatorio";
    }
    if (!datos.categoria || datos.categoria.trim() === "") {
        return "La categoría es obligatoria";
    }
    if (!datos.descripcion || datos.descripcion.trim().length < 10) {
        return "La descripción debe tener al menos 10 caracteres";
    }
    if (!datos.fecha || datos.fecha.trim() === "") {
        return "La fecha es obligatoria";
    }
    if (!datos.horaInicio || datos.horaInicio.trim() === "") {
        return "La hora de inicio es obligatoria";
    }
    if (!datos.horaFin || datos.horaFin.trim() === "") {
        return "La hora de fin es obligatoria";
    }
    if (!datos.lugar || datos.lugar.trim() === "") {
        return "El lugar es obligatorio";
    }
    if (!datos.responsableNombre || datos.responsableNombre.trim() === "") {
        return "El responsable es obligatorio";
    }

    // HUGA-18: entrada libre no requiere cupo, si no es libre el cupo es obligatorio
    if (!datos.entradaLibre) {
        const cupo = parseInt(datos.cupoMaximo);
        if (isNaN(cupo) || cupo <= 0) {
            return "El cupo máximo debe ser mayor a 0, o marque entrada libre";
        }
    }

    return null; // sin errores
}

// ── Crear una actividad nueva (HUGA-10)
async function crearActividad(datos) {
    const errorValidacion = validarDatosActividad(datos);
    if (errorValidacion) {
        return { error: errorValidacion };
    }

    const actividades = await coleccionActividades();

    const nuevaActividad = {
        nombre: datos.nombre.trim(),
        categoria: datos.categoria.trim(),
        descripcion: datos.descripcion.trim(),
        fecha: datos.fecha.trim(),
        horaInicio: datos.horaInicio.trim(),
        horaFin: datos.horaFin.trim(),
        lugar: datos.lugar.trim(),
        entradaLibre: !!datos.entradaLibre,
        cupoMaximo: datos.entradaLibre ? null : parseInt(datos.cupoMaximo),
        cuposOcupados: 0,
        responsableNombre: datos.responsableNombre.trim(),
        estado: "Disponible",
        fechaRegistro: new Date()
    };

    const resultado = await actividades.insertOne(nuevaActividad);

    return { id: resultado.insertedId, actividad: nuevaActividad };
}

// ── Buscar actividades con filtros opcionales (HUGA-14, HUGA-16)
async function buscarActividades(filtrosQuery) {
    const actividades = await coleccionActividades();
    const { buscar, categoria, estado, fecha, lugar } = filtrosQuery;
    const filtro = {};

    if (buscar && buscar.trim() !== "") {
        const texto = buscar.trim();
        filtro.$or = [
            { nombre: { $regex: texto, $options: "i" } },
            { lugar: { $regex: texto, $options: "i" } },
            { responsableNombre: { $regex: texto, $options: "i" } },
            { descripcion: { $regex: texto, $options: "i" } }
        ];
    }

    if (categoria && categoria.trim() !== "") filtro.categoria = categoria;
    if (estado && estado.trim() !== "") filtro.estado = estado;
    if (fecha && fecha.trim() !== "") filtro.fecha = fecha;
    if (lugar && lugar.trim() !== "") filtro.lugar = { $regex: lugar.trim(), $options: "i" };

    return actividades.find(filtro).toArray();
}

// ── Buscar una actividad por su ID (para detalle-actividad.html)
async function buscarActividadPorId(id) {
    const { ObjectId } = require("mongodb");
    if (!ObjectId.isValid(id)) return null;

    const actividades = await coleccionActividades();
    return actividades.findOne({ _id: new ObjectId(id) });
}

module.exports = { coleccionActividades, crearActividad, buscarActividades, buscarActividadPorId };