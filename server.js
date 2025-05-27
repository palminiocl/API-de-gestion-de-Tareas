import express from 'express';
import sequelize from './sequelize.js';
import Tarea from './models/Tarea.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sincronizar base de datos
await sequelize.sync({ alter: true });

// Crear una tarea
app.post('/tasks', async (req, res) => {
  try {
    const tarea = await Tarea.create(req.body);
    res.status(201).json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todas las tareas
app.get('/tasks', async (req, res) => {
  const tareas = await Tarea.findAll();
  res.json(tareas);
});

// Actualizar una tarea
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tarea = await Tarea.findByPk(id);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    
    await tarea.update(req.body);
    res.json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findByPk(id);
  if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });

  await tarea.destroy();
  tarea.status = 'eliminada'; // Cambiar el estado a 'eliminada'
  res.json(tarea);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
