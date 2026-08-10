// ======================================================
// RUTAS: ESPACIOS
// ======================================================
const express = require("express");
const router = express.Router();
const espacioController = require("../controllers/espacioController");

router.post("/", espacioController.crearEspacio);
router.get("/", espacioController.obtenerEspacios);

module.exports = router;