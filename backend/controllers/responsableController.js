
const { crearResponsable: crearResponsableModelo, buscarResponsables: buscarResponsablesModelo } = require("../models/Responsable");

async function crearResponsable(req, res) {
    try {
        const datos = { ...req.body };
        if (req.file) {
            datos.fotografia = "/uploads/responsables/" + req.file.filename;
        }

        const resultado = await crearResponsableModelo(datos);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "El responsable se registró correctamente",
            id: resultado.id,
            responsable: resultado.responsable
        });

    } catch (error) {
        console.error("Error al guardar responsable:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar el responsable" });
    }
}

async function obtenerResponsables(req, res) {
    try {
        const lista = await buscarResponsablesModelo(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar responsables:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar responsables" });
    }
}

module.exports = { crearResponsable, obtenerResponsables };