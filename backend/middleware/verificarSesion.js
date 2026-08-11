// ======================================================
// MIDDLEWARE: VERIFICAR SESIÓN ACTIVA
// Protege endpoints/páginas para que no sean accesibles
// sin haber iniciado sesión (HUGU-07 / HURNF-34).
// ======================================================
function verificarSesion(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }
    res.status(401).json({ mensaje: "Debe iniciar sesión para acceder a este recurso" });
}

module.exports = { verificarSesion };