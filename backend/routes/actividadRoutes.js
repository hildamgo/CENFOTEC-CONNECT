
const express = require("express");
const router = express.Router();
const actividadController = require("../controllers/actividadController");

router.post("/", actividadController.crearActividad);
router.get("/", actividadController.obtenerActividad);
router.get("/:id", actividadController.obtenerActividadPorId);

module.exports = router;