
const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/geminiController");

//POST /api/gemini/mejorar-descripcion
router.post(
    "/mejorar-descripcion",
    geminiController.mejorarDescripcion
);
module.exports = router;