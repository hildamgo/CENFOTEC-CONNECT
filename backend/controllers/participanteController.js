
const { crearParticipante: crearParticipanteModelo, buscarParticipantes: buscarParticipantesModelo } = require("../models/Participante");

async function crearParticipante(req, res) {
    try {
        const resultado = await crearParticipanteModelo(req.body);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "El participante se registró correctamente",
            id: resultado.id,
            participante: resultado.participante
        });

    } catch (error) {
        console.error("Error al guardar participante:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar el participante" });
    }
}

async function obtenerParticipantes(req, res) {
    try {
        const lista = await buscarParticipantesModelo(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar participantes:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar participantes" });
    }
}

module.exports = { crearParticipante, obtenerParticipantes };