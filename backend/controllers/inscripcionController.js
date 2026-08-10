// ======================================================
// CONTROLADOR: INSCRIPCIONESn
// ======================================================
const { crearInscripcion: crearInscripcionModelo, buscarInscripciones: buscarInscripcionesModelo } = require("../models/Inscripcion");

async function crearInscripcion(req, res) {
    try {
        const resultado = await crearInscripcionModelo(req.body);

        if (resultado.error) {
            const codigo = resultado.error === "El participante no existe" ? 404 : 400;
            return res.status(codigo).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "Inscripción registrada correctamente",
            id: resultado.id,
            inscripcion: resultado.inscripcion
        });

    } catch (error) {
        console.error("Error al guardar inscripción:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar la inscripción" });
    }
}

async function obtenerInscripciones(req, res) {
    try {
        const lista = await buscarInscripcionesModelo(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar inscripciones:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar inscripciones" });
    }
}

module.exports = { crearInscripcion, obtenerInscripciones };