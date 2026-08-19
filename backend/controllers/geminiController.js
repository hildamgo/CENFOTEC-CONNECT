// =======================================
// CONTROLADOR DE GEMINI
// =======================================
const {
    mejorarDescripcion: ejecutarMejora
} = require("../services/geminiService.js");

//POST /api/gemini/mejorar-descripcion
async function mejorarDescripcion(req, res) {
    try {
        const resultado = await ejecutarMejora(req.body);
        res.json(resultado);
    } catch (error) {
        console.error("Error en Gemini:", error);
        res.status(error.status || 500).json({
            mensaje: error.message || "Ocurrió un error con Gemini ok."
        });
    }
}
module.exports = { mejorarDescripcion };