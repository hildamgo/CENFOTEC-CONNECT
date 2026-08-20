
const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { verificarSesion } = require("../middleware/verificarSesion");

router.post("/registro", usuarioController.registrarUsuario);
router.get("/", verificarSesion, usuarioController.obtenerUsuarios);
router.post("/login", usuarioController.iniciarSesion);
router.post("/logout", usuarioController.cerrarSesion);
router.get("/sesion", usuarioController.obtenerSesion);
router.post("/restablecer", usuarioController.restablecerContrasena);

module.exports = router;