// ===================================================
// SERVICIO DE GEMINI - ASISTENCIA PARA ACTIVIDADES
// Basado en la estructura del proyecto de películas.
// La API Key permanece en el backend (.env).
// ===================================================
function crearError(mensaje, status){
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

function validarDatos(datos){
    if (!datos || typeof datos !== "object"){
        throw crearError("No se recibieron los datos de la actividad.", 400);
    }
    if (typeof datos.nombre !== "string" || datos.nombre.trim() === ""){
        throw crearError("El nombre de la actividad es obligatorio.", 400);
    }
    if (typeof datos.categoria !== "string" || datos.categoria.trim() === ""){
        throw crearError("La categoría de la actividad es obligatorio.", 400);
    }
    if (typeof datos.fecha !== "string" || datos.fecha.trim() === ""){
        throw crearError("La fecha es obligatoria.", 400);
    }
    if (typeof datos.horaInicio !== "string" || datos.horaInicio.trim() === ""){
        throw crearError("La hora de inicio es obligatoria.", 400);
    }
    // CORRECCIÓN: el frontend (asistencia-ia.js) manda "horaFin", no "horaFinal".
    if (typeof datos.horaFin !== "string" || datos.horaFin.trim() === ""){
        throw crearError("La hora de finalización es obligatoria.", 400);
    }
    if (typeof datos.lugar !== "string" || datos.lugar.trim() === ""){
        throw crearError("El lugar es obligatorio.", 400);
    }
    if (typeof datos.responsableNombre !== "string" || datos.responsableNombre.trim().length < 3){
        throw crearError("El responsable es obligatorio.", 400);
    }
    return {
        nombre: datos.nombre.trim(),
        categoria: datos.categoria.trim(),
        fecha: datos.fecha.trim(),
        horaInicio: datos.horaInicio.trim(),
        horaFin: datos.horaFin.trim(),
        lugar: datos.lugar.trim(),
        responsableNombre: datos.responsableNombre.trim(),
        descripcion: typeof datos.descripcion === "string"
            ? datos.descripcion.trim()
            : ""
    };
}

function construirPrompt(datos){
    const prompt = `
    Actúa como asistente de redacción para CENFOTEC CONNECT.

Tu tarea es mejorar o redactar la descripción de una actividad universitaria.

Datos de la actividad:
Nombre: ${datos.nombre}
Categoría: ${datos.categoria}
Fecha: ${datos.fecha}
Hora de inicio: ${datos.horaInicio}
Hora de finalización: ${datos.horaFin}
Lugar: ${datos.lugar}
Responsable: ${datos.responsableNombre}

Descripción original:
${datos.descripcion || "No se proporcionó una descripción."}

Reglas:
1. Responde en español.
2. Escribe una descripción clara, atractiva y apropiada para una actividad universitaria.
3. Conserva únicamente la información proporcionada.
4. No inventes expositores, premios, requisitos, costos, contenidos específicos ni beneficios que no estén indicados.
5. No cambies el nombre, categoría, fecha, horario, lugar ni responsable.
6. Si existe una descripción original, mejora su ortografía, gramática, claridad y redacción sin cambiar su intención.
7. Si no existe una descripción original, crea una descripción breve utilizando únicamente los datos disponibles.
8. Devuelve únicamente la descripción final, en un solo párrafo.
9. No agregues títulos, comillas ni explicaciones.
    `;

    return prompt.trim();
}

function obtenerTextoRespuesta(resultado){
    if (!resultado.candidates || resultado.candidates.length === 0){
        return "";
    }
    const candidato = resultado.candidates[0];

    if(!candidato.content || !candidato.content.parts){
        return "";
    }
    let textoCompleto = "";
    const partes = candidato.content.parts;

    for (let i = 0; i < partes.length; i++){
        if (typeof partes[i].text === "string"){
            textoCompleto += partes[i].text;
        }
    }
    return textoCompleto.trim();
}

async function mejorarDescripcion(datosEntrada) {
    const datos = validarDatos(datosEntrada);
    const apiKey = process.env.GEMINI_API_KEY;
    const modelo = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey){
        throw crearError("Gemini API no está configurada. Agregue GEMINI_API_KEY al .env.",
            503);
    }
    const cuerpo = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: construirPrompt(datos)
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500
        }
    };
    const url =
    "https://generativelanguage.googleapis.com/" +
        "v1beta/models/" +
        encodeURIComponent(modelo) +
        ":generateContent";

    let respuesta;

    try {
        // CORRECCIÓN: faltaba enviar el "body" — la petición salía vacía
        // y Gemini nunca recibía el prompt.
        respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey
            },
            body: JSON.stringify(cuerpo)
        });
    } catch (error){
        throw crearError("No es posible conectarse con Gemini.", 503);
    }
    const resultado = await respuesta.json();

    if (!respuesta.ok){
        console.error("Respuesta de Gemini:", resultado);

        let mensajeError = "Gemini rechazó la solicitud.";
        if (resultado.error && resultado.error.message){
            mensajeError = resultado.error.message;
        }
        throw crearError(mensajeError, 502);
    }
    const descripcionMejorada = obtenerTextoRespuesta(resultado);

    if (descripcionMejorada === ""){
        throw crearError("Gemini no generó una descripción.", 502);
    }
    return{
        descripcionOriginal: datos.descripcion,
        descripcionMejorada: descripcionMejorada,
        modelo: modelo
    };
}
module.exports = { mejorarDescripcion };