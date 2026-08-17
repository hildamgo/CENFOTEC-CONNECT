// ======================================================
// RUTAS: RESPONSABLES
// ======================================================
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const responsableController = require("../controllers/responsableController");

// ── Aseguramos que la carpeta de subida exista (multer no la crea sola)
const carpetaSubida = path.join(__dirname, "..", "..", "public", "uploads", "responsables");
if (!fs.existsSync(carpetaSubida)) {
    fs.mkdirSync(carpetaSubida, { recursive: true });
}

// ── Configuración de subida de fotos de responsables
const almacenamiento = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaSubida);
    },
    filename: function (req, file, cb) {
        const nombreUnico = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, nombreUnico);
    }
});

const subirFoto = multer({
    storage: almacenamiento,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("El archivo debe ser una imagen"));
        }
    }
});

router.post("/", subirFoto.single("fotografia"), responsableController.crearResponsable);
router.get("/", responsableController.obtenerResponsables);

module.exports = router;