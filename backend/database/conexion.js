
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const clienteMongo = new MongoClient(uri);

let db = null;

// Reutiliza la misma conexión si ya se abrió antes (patrón singleton simple)
async function conectarBD() {
    if (db) return db;

    try {
        await clienteMongo.connect();
        db = clienteMongo.db("CENFOTEC-CONNECT");
        console.log("Conexión exitosa a la base de datos CENFOTEC-CONNECT");
        return db;
    } catch (error) {
        console.error("Error conectando con MongoDB:");
        console.error(error);
        process.exit(1);
    }
}

module.exports = { conectarBD };