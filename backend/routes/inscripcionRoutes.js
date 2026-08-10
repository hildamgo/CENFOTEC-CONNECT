// ======================================================
// RUTAS: INSCRIPCIONESs
// ======================================================
const express = require("express");
const router = express.Router();
const inscripcionController = require("../controllers/inscripcionController");

router.post("/", inscripcionController.crearInscripcion);
router.get("/", inscripcionController.obtenerInscripciones);

module.exports = router;