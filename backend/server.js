// ======================================================
// CONFIGURACIÓN INICIAL
// server.js SOLO define rutas. Toda la lógica de negocio
// (validaciones, reglas, acceso a datos) vive en /models.
// ======================================================
const express = require("express");
require("dotenv").config();

const { conectarBD } = require("./database/conexion");
const { crearParticipante, buscarParticipantes } = require("./models/Participante");
const { crearInscripcion, buscarInscripciones } = require("./models/Inscripcion");
const { crearActividad, buscarActividades, buscarActividadPorId } = require("./models/actividad");
const { crearEspacio, buscarEspacios } = require("./models/espacio");

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
// PARTICIPANTES
// ======================================================

// POST http://localhost:3000/api/participantes
app.post("/api/participantes", async function (req, res) {
    try {
        const resultado = await crearParticipante(req.body);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }

        res.status(201).json({
            mensaje: "El participante se registró correctamente",
            id: resultado.id,
            participante: resultado.participante
        });

    } catch (error) {
        console.error("Error al guardar participante:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar el participante" });
    }
});

// GET http://localhost:3000/api/participantes
app.get("/api/participantes", async function (req, res) {
    try {
        const lista = await buscarParticipantes(req.query);
        res.json(lista);

    } catch (error) {
        console.error("Error al consultar participantes:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar participantes" });
    }
});

// ======================================================
// INSCRIPCIONES
// ======================================================

// POST http://localhost:3000/api/inscripciones
app.post("/api/inscripciones", async function (req, res) {
    try {
        const resultado = await crearInscripcion(req.body);

        if (resultado.error) {
            const codigo = resultado.error === "El participante no existe" ? 404 : 400;
            return res.status(codigo).json({ mensaje: resultado.error });
        }
        res.status(201).json({
            mensaje: "Inscripción registrada correctamente",
            id: resultado.id,
            inscripcion: resultado.inscripcion
        });
    } catch (error) {
        console.error("Error al guardar inscripción:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar la inscripción" });
    }
});

// GET http://localhost:3000/api/inscripciones
app.get("/api/inscripciones", async function (req, res) {
    try {
        const lista = await buscarInscripciones(req.query);
        res.json(lista);
    } catch (error) {
        console.error("Error al consultar inscripciones:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar inscripciones" });
    }
});

// ======================================================
// ACTIVIDADES
// ======================================================

// POST http://localhost:3000/api/actividades
app.post("/api/actividades", async function (req, res) {
    try {
        const resultado = await crearActividad(req.body);

        if (resultado.error) {
            return res.status(400).json({ mensaje: resultado.error });
        }
        res.status(201).json({
            mensaje: "La actividad se registró correctamente",
            id: resultado.id,
            actividad: resultado.actividad
        });
    } catch (error) {
        console.error("Error al guardar actividad:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al guardar la actividad" });
    }
});

// GET http://localhost:3000/api/actividades
app.get("/api/actividades", async function (req, res) {
    try {
        const lista = await buscarActividades(req.query);
        res.json(lista);
    } catch (error) {
        console.error("Error al consultar actividades:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar actividades" });
    }
});

// GET http://localhost:3000/api/actividades/:id
app.get("/api/actividades/:id", async function (req, res) {
    try {
        const actividad = await buscarActividadPorId(req.params.id);

        if (!actividad) {
            return res.status(404).json({ mensaje: "La actividad no existe" });
        }
        res.json(actividad);
    } catch (error) {
        console.error("Error al consultar la actividad:");
        console.error(error);
        res.status(500).json({ mensaje: "Ocurrió un error al consultar la actividad" });
    }
});

// ======================================================
// ESPACIOS
// ======================================================

// POST http://localhost:3000/api/espacios
app.post(
    "/api/espacios",
    async function (req, res) {
        try {
            const resultado = await crearEspacio(
                    req.body
                );
            if (resultado.error) {
                return res
                    .status(400)
                    .json({
                        mensaje:
                            resultado.error
                    });
            }
            res
                .status(201)
                .json({
                    mensaje:
                        "El espacio se registró correctamente",
                    id:
                        resultado.id,
                    espacio:
                        resultado.espacio
                });
        } catch (error) {
            console.error(
                "Error al guardar espacio:"
            );
            console.error(error);
            res
                .status(500)
                .json({
                    mensaje:
                        "Ocurrió un error al guardar el espacio"
                });
        }

    }
);
// GET http://localhost:3000/api/espacios
app.get(
    "/api/espacios",
    async function (req, res) {
        try {
            const lista =
                await buscarEspacios();
            res.json(lista);
        } catch (error) {
            console.error(
                "Error al consultar espacios:"
            );
            console.error(error);
            res
            .status(500)
            .json({
                mensaje:
                    "Ocurrió un error al consultar espacios"
            });
    }
}
);

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