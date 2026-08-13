// ======================================================
// CONFIGURACIÓN INICIAL
// server.js SOLO enchufa las rutas de cada módulo.
//
// routes/      → define las URLs y a qué controlador van
// controllers/ → recibe la petición y llama al modelo
// models/      → validaciones + habla con MongoDB
// ======================================================
const express = require("express");
const session = require("express-session");
require("dotenv").config();

const { conectarBD } = require("./database/conexion");

const participanteRoutes = require("./routes/participanteRoutes");
const inscripcionRoutes = require("./routes/inscripcionRoutes");
const actividadRoutes = require("./routes/actividadRoutes");
const responsableRoutes = require("./routes/responsableRoutes");
const espacioRoutes = require("./routes/EspacioRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const geminiRoutes = require(".routes/geminiRoutes");
const app = express();
const puerto = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Sesión (RNF02) — guarda quién inició sesión entre peticiones
app.use(session({
    secret: "cenfotec-connect-secreto-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 horas
}));

// ======================================================
// ENDPOINT DE PRUEBA
// ======================================================
app.get("/api/prueba", function (req, res) {
    res.json({ mensaje: "El API está funcionando correctamente." });
});

// ======================================================
// RUTAS POR MÓDULO
// ======================================================
app.use("/api/participantes", participanteRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
app.use("/api/actividades", actividadRoutes);
app.use("/api/responsables", responsableRoutes);
app.use("/api/espacios", espacioRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api.gemini", geminiRoutes);

// ======================================================
// INICIAR APLICACIÓN
// ======================================================
async function iniciarAplicacion() {
    await conectarBD();

    app.listen(puerto, function () {
        console.log("Servidor disponible en:");
        console.log("http://localhost:" + puerto);
    });
}

iniciarAplicacion();