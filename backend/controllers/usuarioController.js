// ======================================================
// CONTROLADOR: USUARIOS (login / administradores)
// ======================================================
const {
    crearUsuario: crearUsuarioModelo,
    buscarUsuarios: buscarUsuariosModelo,
    validarLogin,
    restablecerContrasena: restablecerContrasenaModelo
} = require("../models/Usuario");

// POST /api/usuarios/registro  (HUGU-01)
async function registrarUsuario(req, res) {
    try {
        const resultado = await crearUsuarioModelo(req.body);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "El usuario se registró correctamente",
            id: resultado.id,
            usuario: resultado.usuario
        });

    } catch (error) {
        console.error("Error al registrar usuario:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al registrar el usuario" });
    }
}

// GET /api/usuarios  (HUGU-03: listar administradores)
async function obtenerUsuarios(req, res) {
    try {
        const lista = await buscarUsuariosModelo(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar usuarios:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar usuarios" });
    }
}

// POST /api/usuarios/login  (HUGU-06)
async function iniciarSesion(req, res) {
    try {
        const { correo, contrasena } = req.body;
        const resultado = await validarLogin(correo, contrasena);

        if (resultado.error) {
            return res.status(401).json({ mensaje: resultado.error });
        }

        // Guardamos solo lo necesario en la sesión (nunca el hash de la contraseña)
        req.session.usuario = resultado.usuario;

        res.json({
            mensaje: "Sesión iniciada correctamente",
            usuario: resultado.usuario
        });

    } catch (error) {
        console.error("Error al iniciar sesión:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al iniciar sesión" });
    }
}

// POST /api/usuarios/logout  (HUGU-07)
function cerrarSesion(req, res) {
    req.session.destroy(function (error) {
        if (error) {
            console.error("Error al cerrar sesión:");
            console.error(error);
            return res.status(500).json({ mensaje: "No se pudo cerrar la sesión" });
        }
        res.clearCookie("connect.sid");
        res.json({ mensaje: "Sesión cerrada correctamente" });
    });
}

// GET /api/usuarios/sesion -> para que el frontend sepa si hay alguien logueado
function obtenerSesion(req, res) {
    if (req.session && req.session.usuario) {
        return res.json({ autenticado: true, usuario: req.session.usuario });
    }
    res.json({ autenticado: false });
}

// POST /api/usuarios/restablecer  (HUGU-09)
async function restablecerContrasena(req, res) {
    try {
        const { correo, contrasenaNueva, confirmarContrasenaNueva } = req.body;
        const resultado = await restablecerContrasenaModelo(correo, contrasenaNueva, confirmarContrasenaNueva);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.json({ mensaje: resultado.mensaje });

    } catch (error) {
        console.error("Error al restablecer contraseña:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al restablecer la contraseña" });
    }
}

module.exports = {
    registrarUsuario,
    obtenerUsuarios,
    iniciarSesion,
    cerrarSesion,
    obtenerSesion,
    restablecerContrasena
};