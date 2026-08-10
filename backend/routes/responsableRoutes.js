// ======================================================
// RUTAS: RESPONSABLES
// ======================================================
const express = require("express");
const router = express.Router();
const responsableController = require("../controllers/responsableController");

router.post("/", responsableController.crearResponsable);
router.get("/", responsableController.obtenerResponsables);

module.exports = router;