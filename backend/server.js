// ======================================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// ======================================================

const express = require("express");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const app = express();

const puerto = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;

const clienteMongo = new MongoClient(uri);


// Permitir recibir JSON
app.use(express.json());

// Publicar carpeta public
app.use(express.static("public"));


// ======================================================
// OBJETOS DE NEGOCIO
// ======================================================

let participantes;
let responsables;
let actividades;
let espacios;
let administradores;
let inscripciones;


// ======================================================
// FUNCIÓN PARA CONECTAR CON MONGODB
// ======================================================

async function conectarBD(){

    try{

        console.log(process.env.MONGODB_URI);

        await clienteMongo.connect();


        const dataBase = clienteMongo.db("CENFOTEC-CONNECT");


        participantes = dataBase.collection("participantes");
        responsables = dataBase.collection("responsables");
        actividades = dataBase.collection("actividades");
        espacios = dataBase.collection("espacios");
        administradores = dataBase.collection("administradores");
        inscripciones = dataBase.collection("inscripciones");


        console.log("Conexión exitosa a la base de datos CENFOTEC-CONNECT");


    }catch(error){

        console.error("Error conectando con MongoDB:");
        console.error(error);

        process.exit(1);

    }

}


// ======================================================
// ENDPOINT DE PRUEBA
// ======================================================


app.get("/api/prueba", function(req,res){

    res.json({

        mensaje:"El API está funcionando correctamente."

    });

});



// ======================================================
// ENDPOINT REGISTRO DE PARTICIPANTES
// ======================================================


// POST http://localhost:3000/api/participantes
// ======================================================
// ENDPOINT REGISTRO DE PARTICIPANTES
// ======================================================

// POST http://localhost:3000/api/participantes

app.post("/api/participantes", async function(req, res) {

    try {

        const datosParticipante = req.body;

        // ==================================================
        // VALIDAR CAMPOS OBLIGATORIOS
        // ==================================================

        if (!datosParticipante.nombre || datosParticipante.nombre.trim() === "") {
            return res.status(400).json({
                mensaje: "El nombre del participante es obligatorio"
            });
        }

        if (!datosParticipante.identificacion || datosParticipante.identificacion.trim() === "") {
            return res.status(400).json({
                mensaje: "La identificación del participante es obligatoria"
            });
        }

        if (!datosParticipante.correo || datosParticipante.correo.trim() === "") {
            return res.status(400).json({
                mensaje: "El correo del participante es obligatorio"
            });
        }

        if (!datosParticipante.telefono || datosParticipante.telefono.trim() === "") {
            return res.status(400).json({
                mensaje: "El teléfono del participante es obligatorio"
            });
        }

        if (datosParticipante.edad === undefined || datosParticipante.edad === null || datosParticipante.edad === "") {
            return res.status(400).json({
                mensaje: "La edad del participante es obligatoria"
            });
        }

        if (!datosParticipante.profesion || datosParticipante.profesion.trim() === "") {
            return res.status(400).json({
                mensaje: "La profesión del participante es obligatoria"
            });
        }

        // ==================================================
        // LIMPIAR Y PREPARAR DATOS
        // ==================================================

        const nombre = datosParticipante.nombre.trim();
        const identificacion = datosParticipante.identificacion.trim();
        const correo = datosParticipante.correo.trim().toLowerCase();
        const telefono = datosParticipante.telefono.trim();
        const profesion = datosParticipante.profesion.trim();
        const edad = parseInt(datosParticipante.edad);

        // ==================================================
        // VALIDAR FORMATO DEL CORREO
        // ==================================================

        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoCorreo.test(correo)) {
            return res.status(400).json({
                mensaje: "El correo electrónico no es válido"
            });
        }

        // ==================================================
        // VALIDAR EDAD
        // ==================================================

        if (isNaN(edad) || edad < 1 || edad > 120) {
            return res.status(400).json({
                mensaje: "La edad debe estar entre 1 y 120 años"
            });
        }

        // ==================================================
        // VALIDAR IDENTIFICACIÓN ÚNICA
        // ==================================================

        const participantePorIdentificacion =
            await participantes.findOne({
                identificacion: identificacion
            });

        if (participantePorIdentificacion) {
            return res.status(400).json({
                mensaje: "La identificación ya está registrada"
            });
        }

        // ==================================================
        // VALIDAR CORREO ÚNICO
        // ==================================================

        const participantePorCorreo =
            await participantes.findOne({
                correo: correo
            });

        if (participantePorCorreo) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });
        }

        // ==================================================
        // CREAR DOCUMENTO
        // ==================================================

        const nuevoParticipante = {

            nombre: nombre,

            identificacion: identificacion,

            correo: correo,

            telefono: telefono,

            edad: edad,

            profesion: profesion,

            estado: "Activo",

            fechaRegistro: new Date()

        };

        // ==================================================
        // GUARDAR EN MONGODB
        // ==================================================

        const resultado =
            await participantes.insertOne(nuevoParticipante);

        // ==================================================
        // RESPUESTA
        // ==================================================

        res.status(201).json({

            mensaje: "El participante se registró correctamente",

            id: resultado.insertedId,

            participante: nuevoParticipante

        });

    } catch (error) {

        console.error("Error al guardar participante:");

        console.error(error);

        res.status(500).json({

            mensaje: "Ocurrió un error al guardar el participante"

        });

    }

});

// ======================================================
// ENDPOINT CONSULTAR PARTICIPANTES
// ======================================================


// GET http://localhost:3000/api/participantes

app.get("/api/participantes", async function(req, res) {

    try {

        const { buscar, estado, profesion } = req.query;

        const filtro = {};

        // ==============================
        // BUSCADOR
        // ==============================

        if (buscar && buscar.trim() !== "") {

            const texto = buscar.trim();

            filtro.$or = [
                { nombre: { $regex: texto, $options: "i" } },
                { identificacion: { $regex: texto, $options: "i" } },
                { correo: { $regex: texto, $options: "i" } },
                { profesion: { $regex: texto, $options: "i" } }
            ];

        }

        // ==============================
        // FILTRO ESTADO
        // ==============================

        if (estado && estado.trim() !== "") {

            filtro.estado = estado;

        }

        // ==============================
        // FILTRO PROFESIÓN
        // ==============================

        if (profesion && profesion.trim() !== "") {

            filtro.profesion = {
                $regex: profesion.trim(),
                $options: "i"
            };

        }

        // ==============================
        // CONSULTAR MONGODB
        // ==============================

        const lista = await participantes
            .find(filtro)
            .toArray();

        res.json(lista);

    } catch (error) {

        console.error("Error al consultar participantes:");
        console.error(error);

        res.status(500).json({
            mensaje: "Ocurrió un error al consultar participantes"
        });

    }

});
// ======================================================
// INICIAR APLICACIÓN
// ======================================================

async function iniciarAplicacion(){

    await conectarBD();

    app.listen(puerto, function(){

        console.log("Servidor disponible en:");

        console.log("http://localhost:" + puerto);

    });

}

iniciarAplicacion();
