const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Arrays en memoria (se borran al reiniciar el servidor)
let espacios = [];
let responsables = [];

// Rutas Espacios
app.get('/api/spaces', (req, res) => res.json(espacios));
app.post('/api/spaces', (req, res) => {
  const { nombre, sede, descripcion } = req.body;
  if (!nombre || !sede) return res.status(400).json({ error: 'Nombre y sede son obligatorios.' });
  if (espacios.find(e => e.nombre === nombre && e.sede === sede)) {
    return res.status(409).json({ error: 'Ya existe un espacio con ese nombre en la misma sede.' });
  }
  const nuevo = { id: Date.now().toString(), nombre, sede, descripcion };
  espacios.push(nuevo);
  res.status(201).json(nuevo);
});
app.delete('/api/spaces/:id', (req, res) => {
  espacios = espacios.filter(e => e.id !== req.params.id);
  res.json({ mensaje: 'Espacio eliminado.' });
});

// Rutas Responsables
app.get('/api/responsibles', (req, res) => res.json(responsables));
app.post('/api/responsibles', (req, res) => {
  const { identificacion, nombre, apellido, correo, telefonos } = req.body;
  if (!identificacion || !nombre || !apellido || !correo || !telefonos || telefonos.length === 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  if (responsables.find(r => r.identificacion === identificacion || r.correo === correo)) {
    return res.status(409).json({ error: 'Identificación o correo ya registrado.' });
  }
  const nuevo = { id: Date.now().toString(), identificacion, nombre, apellido, correo, telefonos };
  responsables.push(nuevo);
  res.status(201).json(nuevo);
});
app.delete('/api/responsibles/:id', (req, res) => {
  responsables = responsables.filter(r => r.id !== req.params.id);
  res.json({ mensaje: 'Responsable eliminado.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Fase 1 en http://localhost:${PORT}`));
