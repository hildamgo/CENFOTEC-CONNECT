// ======================================================
// CONFIGURACIÓN INICIAL
// server.js SOLO enchufa las rutas de cada módulo.
//
// routes/      → define las URLs y a qué controlador van
// controllers/ → recibe la petición y llama al modelo
// models/      → validaciones + habla con MongoDB
// ======================================================
const express = require("express");
require("dotenv").config();

const { conectarBD } = require("./database/conexion");

const participanteRoutes = require("./routes/participanteRoutes");
const inscripcionRoutes  = require("./routes/inscripcionRoutes");
const actividadRoutes    = require("./routes/actividadRoutes");
const responsableRoutes  = require("./routes/responsableRoutes");
const espacioRoutes      = require("./routes/espacioRoutes");

const app = express();
const puerto = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

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