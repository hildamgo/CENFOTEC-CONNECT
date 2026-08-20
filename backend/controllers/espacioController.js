
const { crearEspacio: crearEspacioModelo, buscarEspacios: buscarEspaciosModelo } = require("../models/Espacio");

async function crearEspacio(req, res) {
    try {
        const resultado = await crearEspacioModelo(req.body);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "El espacio se registró correctamente",
            id: resultado.id,
            espacio: resultado.espacio
        });

    } catch (error) {
        console.error("Error al guardar espacio:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar el espacio" });
    }
}

async function obtenerEspacios(req, res) {
    try {
        const lista = await buscarEspaciosModelo(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar espacios:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar espacios" });
    }
}

module.exports = { crearEspacio, obtenerEspacios };