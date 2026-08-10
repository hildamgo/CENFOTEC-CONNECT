// ======================================================
// CONTROLADOR: ACTIVIDADES
// ======================================================
const {
    crearActividad: crearActividadModelo,
    buscarActividades: buscarActividadesModelo,
    buscarActividadPorId: buscarActividadPorIdModelo
} = require("../models/Actividad");

async function crearActividad(req, res) {
    try {
        const resultado = await crearActividadModelo(req.body);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "La actividad se registró correctamente",
            id: resultado.id,
            actividad: resultado.actividad
        });

    } catch (error) {
        console.error("Error al guardar actividad:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar la actividad" });
    }
}

async function obtenerActividad(req, res) {
    try {
        const lista = await buscarActividadesModelo(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar actividades:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar actividades" });
    }
}

async function obtenerActividadPorId(req, res) {
    try {
        const actividad = await buscarActividadPorIdModelo(req.params.id);

        if (!actividad) {
            return res.status(404).json({ mensaje: "La actividad no existe" });
        }

        res.json(actividad);

    } catch (error) {
        console.error("Error al consultar la actividad:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar la actividad" });
    }
}

module.exports = { crearActividad, obtenerActividad, obtenerActividadPorId };