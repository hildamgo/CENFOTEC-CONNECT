// ======================================================
// MODELO: USUARIOS (login / administradores)
// Aquí vive TODA la lógica de negocio de usuarios:
// validaciones, hash de contraseña y acceso a MongoDB.
// server.js solo llama estas funciones.
// ======================================================
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { conectarBD } = require("../database/conexion");

const ROLES_VALIDOS = ["Administrador General", "Administrador de Actividades"];

async function coleccionUsuarios() {
    const db = await conectarBD();
    return db.collection("usuarios");
}

// ── Validaciones de campos obligatorios y formato (según Documento de Diseño)
function validarDatosUsuario(datos) {
    if (!datos.nombre || datos.nombre.trim() === "") {
        return "El nombre es obligatorio";
    }
    if (!datos.correo || datos.correo.trim() === "") {
        return "El correo es obligatorio";
    }
    if (!datos.contrasena || datos.contrasena.trim() === "") {
        return "La contraseña es obligatoria";
    }
    if (!datos.confirmarContrasena || datos.confirmarContrasena.trim() === "") {
        return "Debe confirmar la contraseña";
    }
    if (!datos.rol || datos.rol.trim() === "") {
        return "El rol es obligatorio";
    }
    if (!ROLES_VALIDOS.includes(datos.rol.trim())) {
        return "El rol debe ser Administrador General o Administrador de Actividades";
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(datos.correo.trim().toLowerCase())) {
        return "El correo electrónico no es válido";
    }

    // Mínimo 8 caracteres, al menos una mayúscula y un número
    const formatoContrasena = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formatoContrasena.test(datos.contrasena)) {
        return "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número";
    }

    if (datos.contrasena !== datos.confirmarContrasena) {
        return "Las contraseñas no coinciden";
    }

    return null; // sin errores
}

// ── Registrar administrador (HUGU-01)
async function crearUsuario(datos) {
    const errorValidacion = validarDatosUsuario(datos);
    if (errorValidacion) {
        return { error: errorValidacion };
    }

    const usuarios = await coleccionUsuarios();

    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim().toLowerCase();
    const rol = datos.rol.trim();

    // Unicidad de correo (RNF-01 / HURNF-33)
    const existePorCorreo = await usuarios.findOne({ correo: correo });
    if (existePorCorreo) {
        return { error: "Ya existe una cuenta registrada con ese correo" };
    }

    const hash = await bcrypt.hash(datos.contrasena, 10);

    const nuevoUsuario = {
        nombre: nombre,
        correo: correo,
        contrasena: hash,
        rol: rol,
        estado: "Activo",
        fechaRegistro: new Date()
    };

    const resultado = await usuarios.insertOne(nuevoUsuario);

    const { contrasena, ...usuarioSinContrasena } = nuevoUsuario;
    return { id: resultado.insertedId, usuario: usuarioSinContrasena };
}

// ── Listar administradores (HUGU-03)
async function buscarUsuarios(filtrosQuery) {
    const usuarios = await coleccionUsuarios();
    const { buscar, rol } = filtrosQuery || {};
    const filtro = {};

    if (buscar && buscar.trim() !== "") {
        const texto = buscar.trim();
        filtro.$or = [
            { nombre: { $regex: texto, $options: "i" } },
            { correo: { $regex: texto, $options: "i" } }
        ];
    }

    if (rol && rol.trim() !== "") {
        filtro.rol = rol.trim();
    }

    // Nunca devolvemos el hash de la contraseña en los listados
    return usuarios.find(filtro).project({ contrasena: 0 }).toArray();
}

// ── Validar login (HUGU-06)
async function validarLogin(correo, contrasena) {
    if (!correo || correo.trim() === "") {
        return { error: "El correo es obligatorio" };
    }
    if (!contrasena || contrasena.trim() === "") {
        return { error: "La contraseña es obligatoria" };
    }

    const usuarios = await coleccionUsuarios();
    const usuario = await usuarios.findOne({ correo: correo.trim().toLowerCase() });

    // Mensaje de error genérico a propósito (CP-01): no revelar si el correo existe o no
    if (!usuario) {
        return { error: "No fue posible iniciar sesión con esas credenciales" };
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coincide) {
        return { error: "No fue posible iniciar sesión con esas credenciales" };
    }

    const { contrasena: hashGuardado, ...usuarioSinContrasena } = usuario;
    return { usuario: usuarioSinContrasena };
}

// ── Restablecer contraseña (HUGU-09)
// NOTA: esta versión NO envía correo de verificación todavía (el módulo de
// envío de correo no está construido). Cambia correo + contraseña nueva
// directamente. Cuando exista el servicio de correo, esto debe cambiarse
// por un flujo de token temporal enviado al correo del usuario.
async function restablecerContrasena(correo, contrasenaNueva, confirmarContrasenaNueva) {
    if (!correo || correo.trim() === "") {
        return { error: "El correo es obligatorio" };
    }

    const formatoContrasena = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formatoContrasena.test(contrasenaNueva || "")) {
        return { error: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número" };
    }

    if (contrasenaNueva !== confirmarContrasenaNueva) {
        return { error: "Las contraseñas no coinciden" };
    }

    const usuarios = await coleccionUsuarios();
    const usuario = await usuarios.findOne({ correo: correo.trim().toLowerCase() });

    if (!usuario) {
        return { error: "No existe una cuenta con ese correo" };
    }

    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await usuarios.updateOne({ _id: usuario._id }, { $set: { contrasena: hash } });

    return { mensaje: "Contraseña actualizada correctamente" };
}

async function buscarPorId(id) {
    if (!ObjectId.isValid(id)) return null;
    const usuarios = await coleccionUsuarios();
    return usuarios.findOne({ _id: new ObjectId(id) }, { projection: { contrasena: 0 } });
}

module.exports = {
    ROLES_VALIDOS,
    coleccionUsuarios,
    crearUsuario,
    buscarUsuarios,
    validarLogin,
    restablecerContrasena,
    buscarPorId
};