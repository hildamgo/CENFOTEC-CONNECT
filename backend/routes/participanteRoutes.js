
const express = require("express");
const router = express.Router();
const participanteController = require("../controllers/participanteController");

router.post("/", participanteController.crearParticipante);
router.get("/", participanteController.obtenerParticipantes);

module.exports = router;